const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const { connectToDB, getErrors } = require('./utils/database');
let dbInstance = null;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const displayLog = (message) => {
    console.log(`[${new Date().toUTCString()}] ${message}`);
};
connectToDB(process.argv.slice(2)[0], (db) => {
    dbInstance = db;
    app.listen(PORT, () => {
        displayLog(`Server is up on PORT ${PORT}`);
    });
});
app.get('/', (req, res) => {
    res.render('index.pug');
});
app.get('/api/errors/getErrors', (request, response) => {
    dbInstance.query('SELECT * FROM errors', (err, res) => {
        response.send(res.rows);
    });
});
