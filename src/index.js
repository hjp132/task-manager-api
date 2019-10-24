const app = require('./app');
const port = process.env.PORT;
const path = require('path');
const hbs = require('hbs');
const express = require('express');
const mongoose = require('mongoose');
const auth = require('../src/middleware/auth');
const Task = require('./routes/task');


app.listen(port, () => {
    console.log('Server is up on port ' + port)
});


const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));
app.use(express.static(path.join(__dirname, '/public')));


const router = express.Router();
app.use('/',router);



app.get('/home', (req, res) => {
    res.render('index', {

        title: 'Home',
        name: 'HP'
    })
});

app.get('/signup', (req, res) => {
    res.render('signup', {

        title: 'Sign Up',
        name: 'HP'
    })
});



app.get('/help', (req, res) => {
    res.render('help', {

        title: 'Help',
        name: 'HP'
    })
});



app.get('*', (req, res) => {
    res.render('index', {
        title: 'Home'
    })
});

//
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/";
//
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("task-manager-api");
//     var query = { name: "dummy" };
//     dbo.collection("users").find(query).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result);
//         db.close();
//     });
// });








