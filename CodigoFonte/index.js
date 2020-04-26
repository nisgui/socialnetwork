const express = require('express');
const http = require("http");
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;

const server = http.createServer(app);
server.listen(SERVER_PORT, function () {
    console.log(`server start in port ${SERVER_PORT}`);
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, X-Requested-With');
    next();
});


require('./router')(app);