/**
 * Created by QH217 on 9/15/2016.
 */
"use strict";

var path = require('path');
var views = require('co-views');
var koaRouter = require('koa-router');
var render = views(path.join(__dirname, '../views'), {map: {html: 'jade'}});

var router = new koaRouter();

/* GET home page. */
router.get('/', function *() {
  this.body = yield render('index.jade');
});

module.exports = router.middleware();
