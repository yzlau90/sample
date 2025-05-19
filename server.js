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

  let map;
  let bookmarks = [];
  const bookmarkMarkers = [];

  function loadBookmarks() {
    const saved = localStorage.getItem("bookmarks");
    if (saved) {
      bookmarks = JSON.parse(saved);
    }
  }

  function saveBookmarks() {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  function updateBookmarkListUI() {
    const list = document.getElementById("bookmarkList");
    list.innerHTML = "";

    if (bookmarks.length === 0) {
      list.textContent = "No bookmarks yet";
      return;
    }

    bookmarks.forEach((bookmark, index) => {
      const item = document.createElement("div");
      item.className = "bookmark-item";
      item.textContent = bookmark.name;
      item.onclick = () => {
        const { lat, lng } = bookmark.position;
        map.panTo(bookmark.position);
        map.setZoom(14);
        google.maps.event.trigger(bookmarkMarkers[index], "click");
      };
      list.appendChild(item);
    });
  }

  function addBookmark(name, position) {
    const bookmark = { name, position };
    bookmarks.push(bookmark);
    saveBookmarks();
    const marker = addMarkerToMap(name, position);
    bookmarkMarkers.push(marker);
    updateBookmarkListUI();
  }

  function addMarkerToMap(name, position) {
    const marker = new google.maps.Marker({
      position,
      map,
      title: name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${name}</strong>`
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    return marker;
  }

  function initMap() {
    loadBookmarks();

    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: bookmarks.length > 0 ? bookmarks[0].position : { lat: 40.748817, lng: -73.985428 } // Default: NYC
    });

    // Add existing markers
    bookmarks.forEach(bookmark => {
      const marker = addMarkerToMap(bookmark.name, bookmark.position);
      bookmarkMarkers.push(marker);
    });

    updateBookmarkListUI();

    // Add new bookmarks on map click
    map.addListener("click", (e) => {
      const latLng = e.latLng;
      const name = prompt("Enter a name for this bookmark:");
      if (name) {
        addBookmark(name, { lat: latLng.lat(), lng: latLng.lng() });
      }
    });
  }

app.get('/', async function(req, res) {

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
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// New post page
app.get('/new', function(req, res) {
    res.render('pages/new');
});

// Create a new post
app.post('/new', async function(req, res) {
    
    // Try-Catch for any errors
    try {
        // Get the title and content from submitted form
        const { title, content } = req.body;

        // Reload page if empty title or content
        if (!title || !content) {
            console.log("Unable to create new post, no title or content");
            res.render('pages/new');
        } else {
            // Create post and store in database
            const blog = await prisma.post.create({
                data: { title, content },
            });

            // Redirect back to the homepage
            res.redirect('/');
        }
      } catch (error) {
        console.log(error);
        res.render('pages/new');
      }

});

// Delete a post by id
app.post("/delete/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        await prisma.post.delete({
            where: { id: parseInt(id) },
        });
      
        // Redirect back to the homepage
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
  });

// Tells the app which port to run on
app.get('/demo', function(req, res) {
  res.render('pages/demo');
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
 
app.listen(8080);