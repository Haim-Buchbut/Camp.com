
var express = 		require("express");
var bodyParser = 	require("body-parser");
var Campground = 	require("./models/campground");
var Comment = 		require("./models/comment");
// var User = 		require("./models/user");
// var seedDB = 		require("./seeds");
var mongoose = 		require("mongoose");

// Acquiring routes
var campgroundsRoutes = require("./routes/campgrounds");
var commentsRoutes = require("./routes/comments");

var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(campgroundsRoutes);
app.use(commentsRoutes);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelpcamp", { useNewUrlParser: true } );

// Seeding the DB with some data for testing
// seedDB();

app.get("/", function(req,res){
	res.render("campgrounds/landing");
});

app.get("*", function(req,res){
	res.send("This page is not available!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("YelpCamp server is up!");
});

