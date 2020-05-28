var express = require('express');
var path = require('path');
var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.get('/', function (req, res) {
    res.sendFile('index.html');
});
app.listen(PORT, function () {
    console.log("Server is up on PORT " + PORT);
});
