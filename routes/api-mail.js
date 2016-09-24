/**
 * Created by QH217 on 9/24/2016.
 */
var ContextIO = require('contextio');
var path = require('path');
var views = require('co-views');
var koaRouter = require('koa-router');
var router = new koaRouter();
var render = views(path.join(__dirname, "../views"), {map: {html: "jade"}});

var ctxioClient = ContextIO({
    key: "ac5gzfd1",
    secret: "H0xlWTu0PQvGkXf2",
    version: "2.0"
});

router.get('/', function *() {
    this.body = yield render("mail.jade");
});

router.get('/messages', function *() {

    this.body = yield ctxioClient.accounts('57e51f3785efb2c63e8b4567').messages()
        .get({
            folder: "INBOX",
            sort_order: "desc",
            limit: 10
        }).then(function (data) {
            return data;
        });

    //res.sendFile(path.join(__dirname,"../raw","api.json"));
});

router.post('/messages/content', function *() {
    var file_id = this.request.body.message_id;

    this.body = yield ctxioClient.accounts('57e51f3785efb2c63e8b4567').messages(file_id)
        .get({
            include_body: 1
        }).then(function (data) {
            return data;
        });

    //res.sendFile(path.join(__dirname,"../raw","api.json"));
});

router.get('/files/download', function *() {
    var file_id = this.request.query.file_id;

    this.body = yield ctxioClient.accounts('57e51f3785efb2c63e8b4567').files(file_id).content()
        .get({
            as_link: 1
        }).then(function (data) {
            return {link_download: data};
        });

    //res.sendFile(path.join(__dirname,"../raw","api.json"));
});

module.exports = router.middleware();