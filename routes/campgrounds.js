
var express = require("express");
var app = express();
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
// <!-- Google Maps API key: AIzaSyAuIfJp9qgrhve0xTQ283gqGB00_Flg8iU -->
// <!-- Google GeoCoding API key: AIzaSyDP7flZjCFiarELiMe7sGK0KsPY_5C8Wi8 -->
var NodeGeocoder = require('node-geocoder'); // documentation: https://www.npmjs.com/package/node-geocoder
var options = {
  provider: 'google',
  // httpAdapter: 'https',
  apiKey: 'AIzaSyDP7flZjCFiarELiMe7sGK0KsPY_5C8Wi8', // To do: define and use an env. variable instead: process.env.GEOCODER_API_KEY
  formatter: null
};
var geocoder = NodeGeocoder(options);
app.locals.googleGeocoder = geocoder;


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
	geocoder.geocode(req.body.address, function (err, results) {
		if(err || !results.length) {
			console.log("[Campground Add]: could not geocode the address.");
		  	req.flash("errorMsg", "Could not validate the address you provided.");
		  	res.redirect('back');
		} else {			
			var address = req.body.address;
			var lat = results[0].latitude;
			var lng = results[0].longitude;
			var name = req.body.name;
			var price = req.body.price;
			var image = req.body.image;
			var website = req.body.website;
			var desc = req.body.desc;
			var createdBy = { id: req.user._id, username: req.user.username };
			var newCampground = { name: name, address: address, lat: lat, lng: lng, price:price, image: image, website:website, desc: desc, createdBy: createdBy };
			Campground.create( newCampground, function(err,newCampground) {
					if(err || !newCampground) {
						console.log("Failed to save a new campground");
						console.log(err);
						req.flash("errorMsg", "We could not add the campground. Please try again later.");
					} else {
						req.flash("successMsg","You successfully added a new campground");
						res.redirect("/campgrounds");
					}
				}
			);	
		}
	});	
});

// Edit a campground
router.get("/campgrounds/:id/edit", middleware.hasPermissionForCampground, function(req,res) {
	Campground.findById({_id : req.params.id}, function(err, campground) {
		console.log(campground.address + " - " + campground.lat + " - " + campground.lng);
		res.render("campgrounds/edit.ejs", {campground : campground});					
	});
});

// Update a campground
router.put("/campgrounds/:id/", middleware.hasPermissionForCampground, function(req,res){
	geocoder.geocode(req.body.address, function(err, results) {
		if (err) {
			console.log("[Campground Edit]: could not geocode the address: " + err);
			req.flash("errorMsg", "The address is incorrect.");
		  	res.redirect('back');
		} else {
			var address = req.body.address;
			var lat = results[0].latitude;
			var lng = results[0].longitude;
			var name = req.body.name;
			var price = req.body.price;
			var image = req.body.image;
			var website = req.body.website;
			var desc = req.body.desc;
			var updatedCampground = {name:name, address: address, lat: lat, lng: lng, price:price, image:image, website:website, desc:desc};
			Campground.findByIdAndUpdate(req.params.id, updatedCampground, function(err, campground){
				req.flash("successMsg","The campground was successfully updated");
				res.redirect("/campgrounds/" + req.params.id);	
			});
		}
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

// Search for Campgrounds
router.get("/campgrounds/search/", function(req,res){
	// eval(require('locus')); // locus is a debugging tool that let you see all the values of incoming parameters	
	var searchTerm = req.query.term;
	if(!searchTerm)
		searchTerm = "";
	else if(searchTerm.length > 0)
		searchTerm = escapeRegex(searchTerm);
	
	const regex = new RegExp(searchTerm, 'gi');
	Campground.find({"name": regex}).populate("comments").exec(function(err,campgroundsFromDB) {
		if(err) {
			req.flash("errorMsg", "We experiencing technical problems and can't show the available campgrounds");
			console.log("Could not retrieve campgrounds from the DB");
			res.redirect("/campgrounds");
		} else {
			if(campgroundsFromDB.length > 0) {
				// var reqCampgroundExt = reqCampground.toObject();
				var campgroundsExt = [];
				// console.log(campgroundsExt);
				campgroundsFromDB.forEach(function(campground) {
					var avgScore = 0;
					var total = 0;
					var reviewersCount = 0;
					for(var i = 0; i < campground.comments.length; i++) {
						if(campground.comments[i].score) {
							total = total + campground.comments[i].score;
							reviewersCount++;
						}
					}
					if(total > 0)
						avgScore = Number((total / reviewersCount).toFixed(1));
					
					var campgroundExt = campground.toObject();
					campgroundExt.stam = 4;
					// console.log(campgroundExt);
					campgroundExt.avgScore = avgScore;
					// campgroundExt.reviewersCount = reviewersCount;
					// console.log(campgroundExt);
					campgroundsExt.push(campgroundExt);
					// console.log(campgroundsExt.length);
				});
				
				res.render("campgrounds/search.ejs", {campgrounds:campgroundsExt, noResults:false, searchTerm: searchTerm});
			
			} else {
				// if empty search or could not find results, show all campgrounds				
				Campground.find( {},function(err,campgroundsFromDB) {
					if(err) {
						req.flash("errorMsg", "We experiencing technical problems and can't show the available campgrounds");
						console.log("Could not retrieve campgrounds from the DB");
						res.redirect("/");
					} else {
						res.render("campgrounds/search.ejs", {campgrounds:campgroundsFromDB, noResults:true, searchTerm: searchTerm});
					}
				});
			}
		}
	});
});

// Show Campground (must be the last one; otherwise the rest of the routes will not get catched)
router.get("/campgrounds/:id", function(req,res){
	Campground.findById({_id: req.params.id}).populate("comments").exec(function(err,reqCampground){
		if(err || !reqCampground) {
			req.flash("errorMsg", "We could not find the requested campground");
			console.log("Could not find the requested campground");
			res.redirect("/campgrounds");
		} else {
			var avgScore = 0;
			var total = 0;
			var reviewersCount = 0;
			for(var i = 0; i < reqCampground.comments.length; i++) {
				if(reqCampground.comments[i].score) {
					total = total + reqCampground.comments[i].score;
					reviewersCount++;
				}
			}
			if(total > 0)
				avgScore = Number((total / reviewersCount).toFixed(1));
			res.render("campgrounds/show.ejs", {campground: reqCampground, avgScore : avgScore});	
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
	
module.exports = router;


{
	// <!-- <div class="row text-center" style="display:flex, flex-wrap: wrap;">
	// 	<% campgrounds.forEach(function(campground) { 		%>
	// 		<div class="col-md-3 col-sm-6">
	// 			<div class="thumbnail">
	// 				<img src="<%= campground.image %>">				
	// 				<div class="caption">
	// 					<h4><%= campground.name %></h4>
	// 				</div>
	// 				<p>
	// 					<a class="btn btn-primary" href="/campgrounds/<%= campground._id %>">Learn More</a>
	// 				</p>
	// 			</div>
	// 		</div> 
	// 	<% }); %> 			
	// </div> -->
}
