
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

// All Campgrounds
router.get("/campgrounds", function(req,res){
	Campground.find( {},function(err,campgroundsFromDB) {
		if(err) {
			console.log("Could not retrieve campgrounds from the DB");
		} else {
			res.render("campgrounds/index.ejs", {campgrounds:campgroundsFromDB});
			// console.log("Campground list from DB:");
			// console.log(campgroundsFromDB);
		}
	});
});

// Adding a new campground
router.get("/campgrounds/new", function(req,res){
	res.render("campgrounds/new.ejs");
});
router.post("/campgrounds",function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.desc;
	var newCampground = { name: name, image: image, desc: desc };
	Campground.create( newCampground, function(err,newCampground) {
			if(err) {
				console.log("Failed to save a new campground");
				console.log(err);
			} else {
				res.redirect("/campgrounds");
			}
		}
	);	
});

// Show Campground
router.get("/campgrounds/:id", function(req,res){
	Campground.findById({_id: req.params.id}).populate("comments").exec(function(err,reqCampground){
		if(err) {
			console.log("Could not find the requested campground");
		} else {
			res.render("campgrounds/show.ejs", {campground: reqCampground});	
		}
	});
});

module.exports = router;
