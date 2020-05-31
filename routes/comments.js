
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// Add Comment
router.get("/campgrounds/:campgroundId/comments/new", function(req,res) {
	Campground.findById({_id : req.params.campgroundId},function(err,campground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground : campground});		
		}
	});
	// 
});

router.post("/campgrounds/:campgroundId/comments", function(req,res) {
	Campground.findById(req.params.campgroundId, function(err,campground) {
		if( err )
		{
			console.log(err);
			res.redirect("campgrounds/");
		} else {
			console.log("Found the campground");
			var comment = Comment( {
				text : req.body.comment,
				author : req.body.name
			});
			Comment.create(comment,function(err,newComment) {
				if(err) {
					console.log(err);
					res.redirect("campgrounds/" + req.params.campgroundId);					
				} else {
					campground.comments.push(newComment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);					
				}				
			});
		}
	});
});

module.exports = router;
