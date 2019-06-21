var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");


//setup server listening port
//var PORT = 3000;
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
app.use(logger("dev")); // Morgan logger 
app.use(express.urlencoded({ extended: true })); // Parse body as JSON
app.use(express.json()); //parse body as JSON
if (process.env.NODE_ENV === "production"){
  app.use(express.static("client/build"));
}
app.use(express.static("public"));// Make public a static folder
mongoose.connect(process.env.MONGODB_URI || "mongodb://appscrape:qcDPkF89h2QwCUA@ds241097.mlab.com:41097/heroku_18vh90k8");
//mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true, useFindAndModify: false }); //Connect to Mongo

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
// Import routes and give the server access to them.
var routes = require("./controllers/newsController.js");
app.use(routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
