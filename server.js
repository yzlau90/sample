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
app.use(express.urlencoded({ extended: true }));

// Needed for Prisma to connect to database
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

// Main landing page
app.get('/', async function (req, res) {

  // Try-Catch for any errors
  try {
    // Get all blog posts
    const blogs = await prisma.post.findMany({
      orderBy: [
        {
          id: 'desc'
        }
      ]
    });

    // Render the homepage with all the blog posts
    await res.render('pages/home', { blogs: blogs });
  } catch (error) {
    res.render('pages/home');
    console.log(error);
  }
});

// About page
app.get('/about', function (req, res) {
  res.render('pages/about');
});

// Access Filter page
app.get('/filter', function (req, res) {
  res.render('pages/filter');
});

// Access Your Picks page
app.get('/yourpicks', function (req, res) {
  res.render('pages/yourpicks');
});


function getLikes(id) {
  return parseInt(localStorage.getItem(`likes_${id}`)) || 0;
}

function addLike(id) {
  const currentLikes = getLikes(id);
  const newLikes = currentLikes + 1;
  localStorage.setItem(`likes_${id}`, newLikes);

  const likeSpan = document.getElementById(`like-count-${id}`);
  if (likeSpan) {
    likeSpan.textContent = newLikes;
  }
}

// Tells the app which port to run on
app.listen(8080);