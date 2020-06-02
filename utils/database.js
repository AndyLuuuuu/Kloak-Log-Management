"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Client } = require('pg');
const displayLog = (message) => {
    console.log(`[${new Date().toUTCString()}] ${message}`);
};
const connectToDB = (dbString, cb) => {
    const dbClient = new Client({
        connectionString: dbString,
    });
    dbClient.connect();
    dbClient.query('SELECT NOW()', (err, res) => {
        if (err) {
            displayLog('Could not connect to database!');
            return;
        }
        displayLog('Connected to database.');
        cb(dbClient);
    });
};
const getErrors = (db, cb) => {
    return db.query('SELECT id, serverName, level, detail, extract(epoch from time) as time FROM errors', (err, res) => {
        return res.rows;
    });
};
module.exports = {
    connectToDB,
    getErrors,
};
