var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Root route
router.get("/", function(req, res){
    res.render("landing");
});

// Registration flow
router.get("/register", function(req, res){
   res.render("register"); 
});
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err.message);
            req.flash("errorMsg", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("successMsg", "Welcome " + req.body.username + "! We're happy you joined YelpCamp.");
           res.redirect("/campgrounds"); 
        });
    });
});

// Login / Logout flow
router.get("/login", function(req, res){
   res.render("login"); 
});
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});
router.get("/logout", function(req, res){
   req.logout();
   req.flash("successMsg", "Goodbye! Come back soon :-)");
   res.redirect("/campgrounds");
});


module.exports = router;

