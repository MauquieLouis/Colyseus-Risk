const http = require('http');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const colyseus = require('colyseus');
const monitor = require("@colyseus/monitor").monitor;
var serveIndex = require('serve-index');
var path = require('path');

const MyRoom = require('./rooms/MyRoom').MyRoom;

const port = process.env.PORT || 2567;
const app = express()

app.use(cors());
app.use(express.json());
app.use(session({secret: 'aj5seKzd45ziA48', resave: true, saveUninitialized: true }));


const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server: server,
});

// register your room handlers
gameServer.define("chat", MyRoom)
    .enableRealtimeListing();
/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the require statement
 */
//app.use("/", socialRoutes);



app.use('/', serveIndex(path.join(__dirname, "static/index.html"), {'icons': true}))
app.use('/', express.static(path.join(__dirname, "static")));


// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on ws://localhost:${ port }`)
