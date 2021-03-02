This is a project to learn react js and material ui and has no purpose for production.

First you have to run binder_gallery locally 

1. Setup the [binder_gallery](https://github.com/gesiscss/binder_gallery) by following the instructions in github repo
2. Run `flask parse-mybinder-archives mybinder` and fill the db with some data
3. Install and enable [flask-cors](https://flask-cors.readthedocs.io/en/latest/)
4. You may also need to increase API limiter
5. When everything is ready, `flask run` and test the API (http://127.0.0.1:5000/gallery/api/v1.0/)

Now you can run the react app in dev mode

1. Install JS packages with `npm install`
2. Run `nom start` and it will be available at http://localhost:3000

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
