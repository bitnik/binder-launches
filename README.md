This repo contains

1. a script to parse [binder launch events](https://mybinder-sre.readthedocs.io/en/latest/analytics/events-archive.html) and
save into [TimescaleDB](https://docs.timescale.com/latest/main)
2. a frontend to visualize launches using [React](https://reactjs.org/) with [Material-UI](https://material-ui.com/) which is backed by
[Express.js](https://expressjs.com/)

## Local development

1. First you have to [set up and run the parser](parser_py#local-development), so that you have some data to visualize.
2. Install the Node.js version 15.12.0. For that you can use the nvm (node version manager): https://github.com/nvm-sh/nvm#installing-and-updating
```bash
# once nvm is installed and ready
# https://github.com/nvm-sh/nvm#usage
# insall node v15.12.0
nvm install 15.12.0
# use the installed node version
nvm use 15.12.0
# check if you are using the right version
node --version
```
3. Install JS packages with `npm install`
4. Configure the express.js server app. To do that create a `config.js` file under `server` directory.
Currently there are only 3 configs, here is an example:
```js
const config = {
 port: 3001,
 debug: true,
 // db url is required
 db: 'postgres://username:password@host:port/database'
};

module.exports = config;
```
5. Start the node server with `npm run start-server`
6. Start the react app in dev mode with `npm run start-client` and then it will be available at [http://localhost:3000](http://localhost:3000)
