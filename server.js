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
<script>
  let map;

  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 1.3521, lng: 103.8198 }, // Singapore
      zoom: 12
    });

    fetch("HKMlocations.csv")
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;
            const listContainer = document.getElementById("location-list");

            data.forEach(loc => {
              const lat = parseFloat(loc.lat);
              const lng = parseFloat(loc.lng);

              const marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: loc.name
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `<strong>${loc.name}</strong><br><a href="${loc.google_maps_url}" target="_blank">View on Google Maps</a>`
              });

              marker.addListener("click", () => {
                infoWindow.open(map, marker);
              });

              const card = document.createElement("div");
              card.className = "card";
              card.innerHTML = `
                <h3>${loc.name}</h3>
                <p><strong>Rating:</strong> ${loc.rating} ⭐ (${loc.review_count} reviews)</p>
                <p><strong>Description:</strong> ${loc.description}</p>
                <p><strong>Taste Profile:</strong> <span class="tags">${loc.tags.split(";").map(tag => `<span>${tag.trim()}</span>`).join(" ")}</span></p>
                <p><strong>Location:</strong> ${loc.town}</p>
                <p><strong>Operating Hours:</strong> ${loc.operating_hours}</p>
                <p><strong>Price:</strong> $${parseFloat(loc.price || 0).toFixed(2)}</p>
                <p><strong>Pre-order Info:</strong> ${loc.pre_order || "N/A"}</p>
                <p><a href="${loc.google_maps_url}" target="_blank">📍 Google Maps</a></p>
              `;
              listContainer.appendChild(card);
            });
          }
        });
      });
  }
</script>

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