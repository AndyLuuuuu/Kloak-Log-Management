var express = require('express');
var path = require('path');
var app = express();
var PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/', function (req, res) {
    res.render('index.pug');
});
app.listen(PORT, function () {
    console.log("Server is up on PORT " + PORT);
});
