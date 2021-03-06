var http = require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');

var index = require('./routes/index');
var login = require('./routes/login');
var singlebattle = require('./routes/single_battle');
var battle = require('./routes/battle');
var design = require('./routes/design');
var armies = require('./routes/armies');
var map = require('./routes/map');
var ws = require('./ws/ws_setup');
var log = require('@internal/common/logger');

process.chdir(__dirname);

var app = express();
var appCookieParser = cookieParser();

app.set('TOKEN_SECRET', process.env.TOKEN_SECRET);

/*if (app.get('env') !== 'development') {
  app.use(function (req, res, next) {
    res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
    return next();
  });
};*/

app.use(favicon(path.join(__dirname, 'assets', 'favicon.png')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'dist'), { maxAge: '30d' }));
app.use(express.static(path.join(__dirname, 'assets'), { maxAge: '30d' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(appCookieParser);

var JL = require('jsnlog').JL;
var jsnlog_nodejs = require('jsnlog-nodejs').jsnlog_nodejs;
app.post('*.logger', function (req, res) {
  jsnlog_nodejs(JL, req.body);
  log.error(req.body);
  // Send empty response. This is ok, because client side jsnlog does not use response from server.
  res.send('');
});

app.use(jwt({
  secret: app.get('TOKEN_SECRET'),
  getToken: req => req.cookies.a_token
}).unless({ path: ['/', '/ranking', '/login', '/register'] }));

app.use('/', index);
app.use('/', login);
app.use('/', battle);
if (app.get('env') === 'development') {
  app.use('/design', design);
}
app.use('/singlebattle', singlebattle);
app.use('/armies', armies);
app.use('/map', map);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status != 401) {
    log.error(err);
    // set locals, only providing error in development
    var error = {
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    };
    // render the error page
    res.status(err.status || 500);
    res.json(error);
  }
  else{
    res.sendStatus(401);
  }
});

function createServer(app) {
  return process.env.LOCAL
    ? https.createServer({
      pfx: fs.readFileSync('localhost.pfx'),
      passphrase: 'localhost',
      requestCert: false,
      rejectUnauthorized: false
    }, app)
    : http.createServer(app);
}

var server = createServer(app);

ws(server, appCookieParser);

server.listen(process.env.PORT || '3000');

var io = require('socket.io')(server);
var cote = require('cote');
new cote.Sockend(io, {
  name: 'sockend server'
});

module.exports = server;
