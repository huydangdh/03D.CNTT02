#!/usr/bin/env node

var koa =require('koa');
var path = require('path');
var tracer = require('tracer');
var mount = require('koa-mount');
var morgan = require('koa-morgan');
var koaStatic = require('koa-static');
var bodyParser = require('koa-bodyparser');

global.Configs = {
  data: {
    root: "./uploads",
    backupPath: "./BACKUP",
    trashPath: "/THÙNG RÁC"
  },
  logger: require('tracer').console({level: 'info'}),
  morganFormat: ':date[iso] :remote-addr :method :url :status :res[content-length] :response-time ms',
  port : process.env.OPENSHIFT_NODEJS_PORT  || 8000,
  ip:  process.env.OPENSHIFT_NODEJS_IP || "localhost"
};

// Start Server
console.log(path.dirname('/uploads'));
var startServer = function (app, port, ip) {
  app.listen(port, ip);
  Configs.logger.info('listening on ',ip,":",port);
};

var app = koa();
app.proxy = true;
app.use(morgan.middleware(Configs.morganFormat));
app.use(bodyParser());

var IndexRouter = require('./routes/index');
var MailRouter = require('./routes/api-mail');
var DriveRouter = require('./routes/api-drive');

app.use(mount('/', IndexRouter));
app.use(mount('/drive', DriveRouter));
app.use(mount('/mail', MailRouter));

app.use(koaStatic(path.join(__dirname,'./public/')));

startServer(app, Configs.port, Configs.ip);