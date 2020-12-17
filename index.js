const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Config
const config = require("./config");

// Connect to MongoDB
mongoose.connect(config.mongoURI, config.dbOptions).then(() => console.log("MongoDB Connected")).catch(err => console.log(err));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());

// Cors
app.use(cors());

// Using ejs view engine
app.set('view engine', 'ejs');

// Check Server for yota books
app.get("/status", (req, res) =>
    res.send("Server Working")
);

// redirect non https
// app.use(function (req, res, next) {
//     req.headers['x-forwarded-proto']
//     if ( req.headers['x-forwarded-proto'] == 'https') {
//         next();
//     } else {
//         res.redirect('https://' + req.headers.host + req.url);
//     }
// });

// Use Routes
const routes = require('./routes');
app.use('/', routes);

app.use(express.static('public'));

// Global Error handling
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.end();
});

// Start listening to server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log('Server running on port ' + server.address().port));

module.exports = app;
