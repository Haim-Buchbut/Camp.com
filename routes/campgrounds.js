
var express = require("express");
var app = express();
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var methodOverride = require("method-override");

app.use(methodOverride("_method"));

// All Campgrounds
router.get("/campgrounds", function(req,res){
	Campground.find( {},function(err,campgroundsFromDB) {
		if(err) {
			req.flash("errorMsg", "We experiencing technical problems and can't show the available campgrounds");
			console.log("Could not retrieve campgrounds from the DB");
			res.redirect("/");
		} else {
			res.render("campgrounds/index.ejs", {campgrounds:campgroundsFromDB});
		}
	});
});

// Adding a new campground
router.get("/campgrounds/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new.ejs");
});
router.post("/campgrounds", middleware.isLoggedIn, function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.desc;
	var createdBy = { id: req.user._id, username: req.user.username };
	var newCampground = { name: name, image: image, desc: desc, createdBy: createdBy };
	Campground.create( newCampground, function(err,newCampground) {
			if(err) {
				console.log("Failed to save a new campground");
				console.log(err);
				req.flash("errorMsg", "We could not add the campground. Please try again later.");
			} else {
				req.flash("successMsg","You successfully added a new campground");
				res.redirect("/campgrounds");
			}
		}
	);	
});

// Edit a campground
router.get("/campgrounds/:id/edit", middleware.hasPermissionForCampground, function(req,res) {
	Campground.findById({_id : req.params.id}, function(err, campground) {
		res.render("campgrounds/edit.ejs", {campground : campground});					
	});
});

// Update a campground
router.put("/campgrounds/:id/", middleware.hasPermissionForCampground, function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.desc;
	var updatedCampground = {name:name, image:image, desc:desc};
	Campground.findByIdAndUpdate(req.params.id, updatedCampground, function(err, campground){
		req.flash("successMsg","The campground was successfully updated");
		res.redirect("/campgrounds/" + req.params.id);	
	});
}); 

// Deleting a campground
router.delete("/campgrounds/:id/", middleware.hasPermissionForCampground, function(req,res) {
	Campground.findByIdAndDelete(req.params.id, function(err, campground) {
		Comment.deleteMany( {_id: { $in: campground.comments }}, function(err) {
			if(err)
				console.log(err);
		});
		req.flash("successMsg","The campground was successfully deleted");
		res.redirect("/campgrounds");	
	});
}); 

// Show Campground (must be the last one; otherwise the rest of the routes will not get catched)
router.get("/campgrounds/:id", function(req,res){
	Campground.findById({_id: req.params.id}).populate("comments").exec(function(err,reqCampground){
		if(err) {
			req.flash("errorMsg", "We could not find the requested campground");
			console.log("Could not find the requested campground");
		} else {
			res.render("campgrounds/show.ejs", {campground: reqCampground});	
		}
	});
});

module.exports = router;
