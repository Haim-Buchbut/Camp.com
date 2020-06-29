
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// Add Comment
router.get("/campgrounds/:campgroundId/comments/new", middleware.isLoggedIn, function(req,res) {
	Campground.findById({_id : req.params.campgroundId},function(err,campground){
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground : campground});		
		}
	});
});

router.post("/campgrounds/:campgroundId/comments", middleware.isLoggedIn, function(req,res) {
	console.log("Score accepted in the adding comment handler: " + req.body.score);
	Campground.findById(req.params.campgroundId, function(err,campground) {
		if( err )
		{
			console.log(err);
			res.redirect("campgrounds/");
		} else {
			var comment = Comment( {
				text : req.body.review,
				score : req.body.score,
			});
			Comment.create(comment,function(err,newComment) {
				if(err) {
					console.log(err);
					req.flash("errorMsg", "We could not add your review. Please try again later.");
					res.redirect("campgrounds/" + req.params.campgroundId);					
				} else {
					console.log("After updating the DB: " + newComment.score);
					comment.author._id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(newComment);
					campground.save();
					req.flash("successMsg","Your review successfully submitted.");
					res.redirect("/campgrounds/" + campground._id);					
				}				
			});
		}
	});
});

module.exports = router;
