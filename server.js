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
// add this snippet after "var express = require('express')"
var axios = require('axios');


// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// Main landing page

// About page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// add this snippet before 
app.get('/weather', async (req, res) => {
    try {
      const response = await axios.get('https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast');
      res.render('pages/weather', { weather: response.data });
    } catch (error) {
      console.error(error);
      res.send('Error fetching weather data');
    }
  });
 
// Tells the app to access filter page
app.get('/filter', function(req, res) {
  res.render('pages/filter');
});  
app.listen(8080);