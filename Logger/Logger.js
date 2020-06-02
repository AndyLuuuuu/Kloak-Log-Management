"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Client = require('pg').Client;
var fs = require('fs');
var path = require('path');
var Logger = /** @class */ (function () {
    function Logger(dbString, interval, logDirectory, folderNames) {
        this.pause = false;
        this.dbString = dbString;
        this.interval = interval;
        this.logDirectory = logDirectory;
        this.folderNames = folderNames;
    }
    Logger.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
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
    Logger.prototype.insertIntoDB = function (folder, data, fileName, cb) {
        switch (folder) {
            case 'error_log':
                var query = 'INSERT INTO errors(servername, level, detail, time) VALUES ($1, $2, $3, to_timestamp($4)) returning *';
                var values = Object.values(data);
                this.dbClient.query(query, values).then(function (res) {
                    cb(fileName);
                });
                break;
            case 'users':
                break;
            default:
                break;
        }
        // cb(fileName)
    };
    Logger.prototype.readFiles = function (filePath, folderName, deleteFolder) {
        var _this = this;
        var cb = function (file) {
            fs.unlink(path.join(filePath, file), function (err) {
                if (err) {
                    console.log(err);
                }
                _this.displayLog("Deleted " + path.join(filePath, file));
                checkFolder(filePath);
            });
        };
        var checkFolder = function (filePath) {
            fs.readdir(filePath, function (err, files) {
                console.log('second read', files);
                if (err) {
                    _this.displayLog("An error occured while reading " + path);
                    return;
                }
                if (files.length === 0) {
                    deleteFolder(filePath);
                }
            });
        };
        fs.readdir(filePath, function (err, files) {
            if (err) {
                _this.displayLog("An error occured while reading " + path);
                throw err;
            }
            if (files.length > 0) {
                files.map(function (file) {
                    fs.readFile(path.join(filePath, file), function (err, data) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.insertIntoDB(folderName, JSON.parse(data.toString()), file, cb);
                                    return [4 /*yield*/, this.sleep(250)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
            }
        });
    };
    Logger.prototype.readFolders = function () {
        var _this = this;
        this.pause = true;
        var deleteFolder = function (folder) {
            fs.rmdir(folder, function (err) {
                if (err) {
                    _this.displayLog("An error occured while deleting " + folder + ".");
                    throw err;
                }
                _this.displayLog("Deleted " + folder + ".");
                fs.rmdir(path.join(folder, '..'), function (err) {
                    if (err) {
                        return;
                    }
                    _this.displayLog("Deleted " + path.join(folder, '..') + ".");
                });
            });
        };
        var timestamps = [];
        fs.readdir(path.join(this.logDirectory), function (err, folders) {
            if (err) {
                _this.displayLog("An error occured while reading " + _this.logDirectory + ".");
                throw err;
            }
            if (folders.length > 0) {
                timestamps = folders;
                timestamps.map(function (timestamp) {
                    if (timestamp !== '.DS_Store') {
                        fs.readdir(path.join(_this.logDirectory, timestamp), function (err, folders) {
                            if (err) {
                                _this.displayLog("An error occured while reading " + path.join(_this.logDirectory, timestamp) + ".");
                                throw err;
                            }
                            if (folders.length > 0) {
                                folders.map(function (folder) {
                                    if (_this.folderNames.includes(folder)) {
                                        _this.readFiles(path.join(_this.logDirectory, timestamp, folder), folder, deleteFolder);
                                    }
                                });
                            }
                            fs.rmdir(path.join(_this.logDirectory, timestamp), function (err) {
                                _this.displayLog("Deleted " + path.join(_this.logDirectory, timestamp) + ".");
                            });
                        });
                    }
                });
            }
        });
        this.pause = false;
    };
    Logger.prototype.start = function () {
        var _this = this;
        var callback = function () {
            _this.displayLog("Automatically reading logs every " + _this.interval + "ms.");
            _this.intervalFn = setInterval(function () {
                if (!_this.pause) {
                    _this.readFolders();
                }
            }, _this.interval);
        };
        this.connectToDB(callback);
        if (!this.interval) {
            throw console.error('Please set a interval time!');
        }
    };
    Logger.prototype.stop = function () {
        if (!this.intervalFn) {
            this.displayLog("You don't have a running logger!");
            return;
        }
        clearInterval(this.intervalFn);
    };
    return Logger;
}());
if (process.argv.slice(2)[0].length < 30) {
    console.log('Please enter a database connection string!');
    throw Error;
}
var log = new Logger(process.argv.slice(2)[0], 60000, './sharedFolder/Log_Management/timestamp', ['error_log']);
log.start();
