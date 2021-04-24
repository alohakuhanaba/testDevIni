// load the things needed
const express = require('express');
const routes = require('./routes');
const request = require('tedious').Request;
const conn = require('./database/index');
const app = express();

// set usage of routes
app.use(routes);

// set the static files and view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static("public"));

// set the port of our application
app.listen(8080, () => {
    console.log('Server is up.');
}) 