/**
 * Created by QH217 on 9/14/2016.
 */
"use strict";

var fs = require('co-fs');
var origFs = require('fs');
var path = require('path');
var moment = require('moment');
var formParser = require('co-busboy');
var mv = require('mv');

var FileManager = {};

/**
 * Lấy thông tin Tệp tin/Thư mục.
 * @param p
 * @returns {{folder, size: (*|Number|string|number), mtime}}
 */
FileManager.getStats = function *(p) {
    var stats = yield fs.stat(p);
    var type = stats.isDirectory() ? "dir" : "file";
    var date = moment(moment(stats.mtime.getTime())).utc().format('YYYY-MM-DD HH:mm:ss');

    return {
        date: date,
        type: type,
        size: stats.size,
    };
};

/**
 * Lấy danh sách Tệp tin/Thư mục.
 * @param dirPath
 * @returns {Array}
 */
FileManager.list = function *(p) {
    var files = yield fs.readdir(p);
    var stats = {
        "result":[]
    };
    for (var i=0; i < files.length; ++i) {
        var fPath = path.join(p, files[i]);
        var stat = yield FileManager.getStats(fPath);
        stat.name = files[i];
        stats.result.push(stat);
    }
    return stats;
};

/**
 * Tạo thư mục mới
 * @param p
 * @returns {{result: {success: boolean, error: null}}}
 */
FileManager.mkdir = function (p) {
    fs.mkdir(p);
    return { "result": { "success": true, "error": null } };
};

/**
 * Đổi tên File/Thư mục
 * @param s
 * @param d
 * @returns {{result: {success: boolean, error: null}}}
 */
FileManager.rename = function *(s, d) {
    yield fs.rename(s, d);
    return { "result": { "success": true, "error": null } };
};

/**
 * Đọc File
 * @param p
 * @returns {{result: (string|String|*)}}
 */
FileManager.read = function *(p) {
    var content = yield fs.createReadStream(p);
    var result = {
        "result": content.toString()
    };

    return result;
};
/**
 * Upload File
 * @param ctx
 * @returns {{result: {success: boolean, error: null}}}
 */
FileManager.create = function *(ctx) {
    var part, p;
    var formData = formParser(ctx, {
        autoFields: true
    });

    while (part = yield formData) {
        
        p = path.join(Configs.data.root, formData.fields[0][1], remove_unicode(part.filename));
        part.pipe(origFs.createWriteStream(path.join(p)));
    }

    return { "result": { "success": true, "error": null } };
};
/**
 * Tải File
 * @param p
 */
FileManager.download = function (p) {
    var filestream = origFs.createReadStream(p);
    return filestream;
};
/**
 * Chuyển file vào thùng rác
 * @param p
 */
FileManager.delete = function *(p) {


};

function getExtensionFile(str) {
    return str.substr(str.lastIndexOf('.')+1);
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function remove_unicode(str)
{
    var ext = getExtensionFile(str);

    str= str.toLowerCase();
    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str= str.replace(/đ/g,"d");
    str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g,"-");

    str= str.replace(/-+-/g,"-"); //thay thế 2- thành 1-
    str= str.replace(/^\-+|\-+$/g,"");

    return (str + "." + ext).capitalizeFirstLetter();
}
module.exports = FileManager;