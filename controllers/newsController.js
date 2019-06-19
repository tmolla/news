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
  // Grab every document in the Articles collection and pass it along the index page.
  // index page uses handlebars to render the articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // create the handlebars object to send back
      var hbsObject = {
        scrape: false,
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
router.get("/search/:pattern", function(req, res) {
  const searchString = "/" + req.params.pattern  + "/";
  console.log(searchString)
  db.Article.find({title : {$regex: "/" + searchString + "/" ,$options:'i'}})
  .then(function(dbArticle) {
    // create the handlebars object to send back
    var hbsObject = {
      scrape: false,
      articles: dbArticle
    };
    console.log(dbArticle)
    res.render("index", hbsObject);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    res.json(err);
  });
});


router.get("/scrape", function(req, res) {
  var myRes = [];
  // First, we grab the body of the html with axios
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
    // create the handlebars object to send back
    var hbsObject = {
      scrape: true,
      articles: myRes
    };
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
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    }
  );
});

// Route for saving a new note associated with an Article
router.post("/note/:id", function(req, res) {
  // push a new note on to the article
  db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {notes:req.body.text}}, { new: true })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    }
  );
});

// Route for saving an Article
router.post("/save", function(req, res) {
  // Create a new Article
  db.Article.create(req.body)
    .then(function(dbArticle) {
      // View the added result in the console
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error return it
      res.json(err);
    });
});

//Rout for deleting a note from an article
router.delete("/note/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  const input = JSON.parse(req.params.id);
  const articleId = input.articleId;
  const noteIndex = input.noteIndex;
 
  //find the article to remove the note from
  db.Article.findOne({ _id : articleId}).then(function(dbArticle){
    //remove the note and return a response
    dbArticle["notes"].splice(noteIndex,1); 
    db.Article.findOneAndUpdate({ _id : articleId}, {$set: {notes : dbArticle["notes"]}}, {new: true})
    .then(function(){
      res.send("removed");
    })
  });
});

//Route to remove an article
router.delete("/articles/:id", function(req, res) {
  db.Article.remove({ _id: req.params.id }, function(err, done) 
  {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      console.log(done);
      res.send(done);
    }
  });
});

// Export routes for server.js to use.
module.exports = router;