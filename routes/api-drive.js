/**
 * Created by QH217 on 9/15/2016.
 */

"use strict";

var fs = require('co-fs');
var path = require('path');
var views = require('co-views');
var koaRouter = require('koa-router');
var router = new koaRouter();
var FileManager = require('../utils/FileManager');
var AdmZip = require('adm-zip');
var zip = new AdmZip();
var render = views(path.join(__dirname, "../views"), {map: {html: "jade"}});
var mv = require('mv');

router.get('/', function *() {
    this.body = yield render("drive.jade");
});

router.get('/doBackup', function () {
    zip.addLocalFolder(Configs.data.root);
    zip.writeZip(path.join(Configs.data.backupPath,"BACKUP_UPLOADS_" + Date.now() + ".ZIP"));
});

router.get('/downloadFile', function () {
    var query = this.request.query;

    if(query.action === "download" && query.path) {
        var p = path.join(Configs.data.root, query.path);
        var file = FileManager.download(p);

        this.attachment(p);
        this.body = file;

        return true;
    }
    this.status = 403;
    this.body = "<h1 style='color: #d2322d;'>Cấm Truy Cập</h1>";
});

router.post('/list', function *() {
    var bodyReq = this.request.body;
    var p = path.join('./uploads', bodyReq.path);

    this.body = yield * FileManager.list(p);
});

router.post('/getContent', function *() {
    var bodyReq = this.request.body;
    var p = path.join('./uploads',bodyReq.item);

    var file = yield FileManager.read(p);
    this.body = file;
});

router.post('/createFolder', function *() {
    var bodyReq = this.request.body;
    var p = path.join('./uploads',bodyReq.newPath);

    this.body = yield FileManager.mkdir(p);
});

router.post('/rename', function *() {
    var bodyReq = this.request.body;
    var s = path.join('./uploads', bodyReq.item);
    var d = path.join('./uploads',  bodyReq.newItemPath);

    this.body = yield FileManager.rename(s, d);
});

router.post('/upload', function *() {
    this.body = yield FileManager.create(this);
});

router.post('/delete', function *() {
    var bodyReq = this.request.body;
    var p = bodyReq.items[0];
    this.body = yield FileManager.rename(path.join(Configs.data.root,p), path.join(Configs.data.root, Configs.data.trashPath, p));
});

module.exports = router.middleware();