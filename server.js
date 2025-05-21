// Needed for dotenv
require("dotenv").config();

// Needed for Express
var express = require('express')
var app = express()

// Needed for EJS
app.set('view engine', 'ejs');

// Needed for public directory
app.use(express.static(__dirname + '/public'));

// Needed for parsing form data
app.use(express.json());       
app.use(express.urlencoded({extended: true}));

// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// Main landing page
app.get("/home", (req, res) => {
  res.render("pages/home"); // Renders views/home.ejs
});

// About page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// Access Filter page
app.get('/filter', function(req, res) {
    res.render('pages/filter');
});

// Tells the app which port to run on
app.listen(8080);