var express = require("express");
// The following libraries are needed for scraping
var axios = require("axios");
var cheerio = require("cheerio");

//Intialize database
var db = require("../models");
var router = express.Router();
console.log("in the server side");
// A GET route for scraping the echoJS website
// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      var hbsObject = {
        articles: dbArticle
      };
      //console.log("Hello Telly");
      //console.log(hbsObject.articles);
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.get("/viewArticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      var hbsObject = {
        scrape: false,
        articles: dbArticle
      };
      console.log("from DB " + hbsObject.scrape);
      console.log(hbsObject.articles);
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  var myRes = [];
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      var result = {}; //initialize result
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      result._id = myRes.length;
      myRes.push(result);
    });
    var hbsObject = {
      scrape: true,
      articles: myRes
    };
    console.log("From Scrape " + hbsObject.scrape);
    console.log(hbsObject.articles);
    res.render("index", hbsObject);
  });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  console.log("in get without id");
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  console.log(req.params.id);
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      console.log(dbArticle)
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log("in post");
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article
router.post("/save", function(req, res) {
  // Create a new Article
  db.Article.create(req.body)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log(dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
      res.json(err);
    });
});


// app.get("/delete/:id", function(req, res) {
//   // Remove a note using the objectID
//   db.notes.remove(
//     {
//       _id: mongojs.ObjectID(req.params.id)
//     },
//     function(error, removed) {
//       // Log any errors from mongojs
//       if (error) {
//         console.log(error);
//         res.send(error);
//       }
//       else {
//         // Otherwise, send the mongojs response to the browser
//         // This will fire off the success function of the ajax request
//         console.log(removed);
//         res.send(removed);
//       }
//     }
//   );
// });
router.delete("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  console.log("in delete");
  db.Article.remove(
    { _id: req.params.id },
    function(err, done) {
      if (err) {
        console.log(err);
        res.send(err);
      }
      else {
        console.log(done);
        res.send(done);
      }
    }
  );
});
// Export routes for server.js to use.
module.exports = router;