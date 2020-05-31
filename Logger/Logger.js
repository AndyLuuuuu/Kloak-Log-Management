"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var Client = require('pg').Client;
var fs = require('fs');
var path = require('path');
var Logger = /** @class */ (function () {
    function Logger(dbString, interval, logDirectory) {
        this.dbString = dbString;
        this.interval = interval;
        this.logDirectory = logDirectory;
    }
    Logger.prototype.createTable = function (table) {
        switch (table) {
            case 'errors':
                this.dbClient.query("CREATE TABLE " + table + " (id SERIAL, servername text, level integer, detail text, time timestamp)");
                break;
            case 'userCount':
                this.dbClient.query("CREATE TABLE " + table + " (id SERIAL, active integer, idle int, time timestamp)");
                break;
            default:
                return;
        }
    };
    Logger.prototype.displayLog = function (message) {
        console.log("[" + new Date().toUTCString() + "] " + message);
    };
    Logger.prototype.checkTables = function (cb) {
        var _this = this;
        this.dbClient.query('SELECT * FROM usercount', function (err, res) {
            if (err) {
                _this.createTable('userCount');
                _this.displayLog('Created USERCOUNT table.');
            }
        });
        this.dbClient.query('SELECT * FROM errors', function (err, res) {
            if (err) {
                _this.createTable('errors');
                _this.displayLog('Created ERRORS table.');
            }
        });
        cb();
    };
    Logger.prototype.connectToDB = function (cb) {
        var _this = this;
        this.dbClient = new Client({
            connectionString: this.dbString
        });
        this.dbClient.connect();
        this.dbClient.query('SELECT NOW()', function (err, res) {
            if (!err) {
                _this.displayLog('Connected to database.');
                _this.checkTables(cb);
            }
        });
    };
    Logger.prototype.insertIntoDB = function (folder, data, cb) {
        switch (folder) {
            case 'error_log':
                // const query =
                //   'INSERT INTO errors(servername, level, detail, time) VALUES ($1, $2, $3, $4) returning *'
                // const values = Object.values(data)
                // this.dbClient.query(query, values).then((res) => {
                //   console.log(res.rows[0])
                //   cb()
                // })
                cb();
                break;
            case 'users':
                break;
            default:
                break;
        }
    };
    Logger.prototype.readFiles = function () {
        var _this = this;
        fs.readdir(path.join(this.logDirectory), function (err, files) {
            if (err) {
                _this.displayLog("An error occured while reading " + _this.logDirectory);
                throw err;
            }
            if (files.length > 0) {
                var directories_1 = [_this.logDirectory];
                directories_1.push(files[0]);
                fs.readdir(path.join(_this.logDirectory, files[0]), function (err, files) {
                    files.map(function (file) {
                        directories_1.push(file);
                        fs.readdir(path.join.apply(path, directories_1), function (err, files) {
                            files.map(function (file) {
                                console.log(file);
                                fs.readFile(path.join.apply(path, __spreadArrays(directories_1, [file])), function (err, data) {
                                    var callback = function () {
                                        fs.unlink(path.join.apply(path, __spreadArrays(directories_1, [file])), function (err) {
                                            if (err) {
                                                return;
                                            }
                                        });
                                    };
                                    _this.insertIntoDB(directories_1[directories_1.length - 1], JSON.parse(data.toString()), callback);
                                });
                            });
                            directories_1 = directories_1.slice(0, directories_1.length - 1);
                            console.log(directories_1);
                            // fs.readFiles(path.join(this.logDirectory, parent, file, files))
                        });
                    });
                });
            }
        });
    };
    Logger.prototype.start = function () {
        var _this = this;
        var callback = function () {
            _this.displayLog("Automatically reading logs every " + _this.interval + "ms.");
            _this.intervalFn = setInterval(function () { }, _this.interval);
        };
        callback();
        // this.connectToDB(callback)
        if (!this.interval) {
            throw console.error('Please set a interval time!');
        }
    };
    return Logger;
}());
var log = new Logger('postgres://dwojrnzm:c-_JKegtgW88VTxBKskf5jWJSDSTHXLi@ruby.db.elephantsql.com:5432/dwojrnzm', 300, './sharedFolder/Log_Management/timestamp');
log.readFiles();
