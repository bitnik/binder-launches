FROM node:15.12.0-buster-slim
# https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
# COPY . .
COPY public ./public
COPY server ./server
COPY src ./src

RUN npm run build

EXPOSE 3001
CMD [ "npm", "run", "start-server" ]
