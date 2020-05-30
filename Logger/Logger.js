var Client = require('pg').Client;
var Logger = /** @class */ (function () {
    function Logger(dbString, interval, logDirectory) {
        this.dbString = dbString;
        this.interval = interval;
        this.logDirectory = logDirectory;
    }
    Logger.prototype.createTable = function (table) {
        switch (table) {
            case 'errors':
                this.dbClient.query("CREATE TABLE " + table + " (id SERIAL, level integer, detail text, time timestamp)");
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
    Logger.prototype.readFile = function () { };
    Logger.prototype.start = function () {
        var _this = this;
        var callback = function () {
            _this.displayLog("Automatically reading logs every " + _this.interval + "ms.");
            _this.intervalFn = setInterval(function () { }, _this.interval);
        };
        this.connectToDB(callback);
        if (!this.interval) {
            throw console.error('Please set a interval time!');
        }
    };
    return Logger;
}());
var log = new Logger('postgres://dwojrnzm:c-_JKegtgW88VTxBKskf5jWJSDSTHXLi@ruby.db.elephantsql.com:5432/dwojrnzm', 120, './');
log.start();
