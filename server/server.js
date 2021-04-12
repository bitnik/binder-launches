const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const path = require("path");
const _Launch = require("./launches");
const pino = require('pino');
const expressPino = require('express-pino-logger');
const fs = require('fs');

let config;
if (fs.existsSync(path.join(__dirname, 'config.js'))) {
    config = require('./config');
    if (!('debug' in config)) {
        config['debug'] = false;
    }
    if (!('port' in config)) {
        config['port'] = 3001;
    }
    if (!('baseUrl' in config)) {
        config['baseUrl'] = '/';
    } else if (config['baseUrl'].endsWith('/')) {
        config['baseUrl'] = config['baseUrl'].slice(0, -1); ;
    }
    if (!('dbSSL' in config)) {
        config['dbSSL'] = true;
    }
} else {
    throw 'Please provide "config.js" for configuration.';
}

// https://getpino.io/#/docs/api?id=options
const logger = pino({
    level: config.debug ? 'debug' : 'warn',
    // https://github.com/pinojs/pino-pretty#cli-arguments
    prettyPrint: config.debug ? { colorize: true, translateTime: true } : false,
});
const expressLogger = expressPino({ logger });

logger.debug(config)
const app = express();
app.use(expressLogger);
const port = config.port;

const sequelize = new Sequelize(config.db,
    {
        // https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: config.dbSSL,
                rejectUnauthorized: false
            }
        },
        logging: config.debug
    });

// init Launch model
const Launch = _Launch(sequelize, DataTypes);
Launch.removeAttribute('id');

sequelize.authenticate().then(() => {
    logger.info('Connection has been established successfully.');
    if (config.debug) {
        Launch.sync().then(() => {
            logger.info('launches table is synced.');
        }).catch(err => {
            logger.error('error while syncing launches table:', err);
        });
    }
}).catch(err => {
    logger.error('Unable to connect to the database:', err);
});

app.use(express.json());

// serve static files and index.html at root
const react_build = path.join(__dirname, '..', 'build');
app.use(config.baseUrl, express.static(react_build))
// app.get('/', (req, res) => res.status(200).sendFile(path.join(react_build, 'index.html')));

// config variables for data table
let ORIGINS = [];
let PROVIDERS = [];

var router = express.Router()
router.get('/launches', function(req, res) {
    logger.debug(req.query)
    // filters
    // NOTE: datetimes come in user's timezone and converted into UTC in the query
    if (Number.isNaN(Date.parse(req.query.from)) || Number.isNaN(Date.parse(req.query.to))) {
        res.status(400).json({'error': 'Bad Request: please provide a valid datetime', 'status': 400});
        return;
    }
    let filters = {
        timestamp: {
            [Op.between]: [req.query.from, req.query.to]
        }
    };
    if ('origins' in req.query) {
        const origins = req.query.origins.split(',');
        let origins_ = [];
        origins.forEach((o, i) => {
            if (ORIGINS.includes(o)) {
                origins_.push(o);
            }
            });
        filters['origin'] = origins_;
    }
    if ('providers' in req.query) {
        const providers = req.query.providers.split(',');
        let providers_ = [];
        providers.forEach((p, i) => {
            if (PROVIDERS.includes(p)) {
                providers_.push(p);
            }
            });
        filters['provider'] = providers_;
    }
    if ('repo' in req.query && req.query.repo !== ':') {
        const operation = req.query.repo.substring(0, req.query.repo.indexOf(':'));
        // do sth only if operation is valid
        if (operation.length > 0) {
            const value = req.query.repo.substring(req.query.repo.indexOf(':')+1);
            if (operation === "eq") {
                filters['repo'] = value;
            } else if (operation === "sw") {
                filters['repo'] = {[Op.like]: value+'%'};
            } else if (operation === "ew") {
                filters['repo'] = {[Op.like]: '%'+value};
            } else if (operation === "co") {
                filters['repo'] = {[Op.like]: '%'+value+'%'};
            }
        }
    }
    let groupby = [];
    let groupbyAttributes = [];
    if ('groupby' in req.query && req.query.groupby !== '') {
        const countCol = [sequelize.fn('COUNT', sequelize.col('*')), 'count'];
        if (req.query.groupby === 'provider-repo') {
            groupby = ['provider', 'repo'];
        } else if (req.query.groupby === 'provider') {
            groupby = ['provider'];
        } else if (req.query.groupby === 'origin') {
            groupby = ['origin'];
        }
        groupbyAttributes = groupby.concat([countCol]);
    }
    // pagination
    let offset = 0;
    const limit_ = 100;
    let page = 1;
    if ('page' in req.query) {
        page = parseInt(req.query.page);
        if (Number.isInteger(page)) {
            if (page < 1) {
                res.status(400).json({'error': 'Bad Request: please provide a valid page number', 'status': 400});
                return;
            }
            offset = offset + limit_ * (page-1);
        } else {
            page = 1;
        }
    }
    logger.debug(page, offset, limit_);
    // query
    const order_ = ('desc' in req.query && ['false', '0'].indexOf(req.query.desc.toLowerCase()) >= 0) ? 'asc' : 'desc';
    let query = {
        where: filters,
        offset: offset,
        limit: limit_,
        order: [[sequelize.col('timestamp'), order_]]
    };
    if (groupby.length > 0) {
        query['attributes'] = groupbyAttributes;
        query['group'] = groupby;
        query['order'] = [[sequelize.col('count'), 'DESC']];
    }
    Launch.findAll(
        query
        ).then(result => {
            res.status(200).send(result.length < limit_ ?
                                {'launches': result} :
                                {'launches': result, 'nextPage': page+1});
        }).catch(error => {
            logger.error(error);
            res.status(500).json({'error': 'Internal Server Error', 'status': 500});
        });
});

router.get('/config', function (req, res) {
    const origins = Launch.findAll({
        attributes: [
            'origin',
            [sequelize.fn('COUNT', sequelize.col('origin')), 'n_launches']
        ],
        group: 'origin',
        order: [
            [sequelize.col('n_launches'), 'DESC']
        ]
     });
     const providers = Launch.findAll({
        attributes: [
            'provider',
            [sequelize.fn('COUNT', sequelize.col('provider')), 'n_launches']
        ],
        group: 'provider',
        order: [
            [sequelize.col('n_launches'), 'DESC']
        ]
     });
     const first_launch_ts = Launch.findOne({
        attributes: [
            'timestamp',
        ],
        order: [
          ['timestamp'],
        ]
      });
      const last_launch_ts = Launch.findOne({
         attributes: [
             'timestamp',
         ],
         order: [
           ['timestamp', 'DESC'],
         ]
       });
    // run all Promises together
     Promise.all([origins, providers, first_launch_ts, last_launch_ts]).then(result => {
        let config = {};
        config['origins'] = result[0];
        config['origins'].forEach((e, i) => {
            if (!ORIGINS.includes(e.origin)) {
                ORIGINS.push(e.origin);
            }
          });
        config['providers'] = result[1];
        config['providers'].forEach((e, i) => {
            if (!PROVIDERS.includes(e.provider)) {
                PROVIDERS.push(e.provider);
            }
          });
        config['first_launch_ts_in_db'] = result[2];
        config['last_launch_ts_in_db'] = result[3];
        res.status(200).json(config);
    }).catch(error => {
        logger.error(error);
        res.status(500).json({'error': 'Internal Server Error', 'status': 500});
    });
  })

app.use(config.baseUrl, router)
app.listen(port, () => logger.info(`Example app listening at http://localhost:${port}`));
