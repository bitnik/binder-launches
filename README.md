This repo contains

1. a tool to parse [binder launch events](https://mybinder-sre.readthedocs.io/en/latest/analytics/events-archive.html) and
save into [TimescaleDB](https://docs.timescale.com/latest/main)
2. a frontend to visualize them using [React](https://reactjs.org/) with [Material-UI](https://material-ui.com/) which is backed by
[Express.js](https://expressjs.com/)

## Local development

1. First you have to [set up and run the parser](parser_py#local-development), so that you have some data to visualize.
2. Install JS packages with `npm install`
3. Start the node server with `npm run start-server`
4. Start the react app in dev mode with `npm run start-client` and then it will be available at [http://localhost:3000](http://localhost:3000)
