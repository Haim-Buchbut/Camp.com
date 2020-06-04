var Campground = require("../models/campground");

module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        //  req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
	hasPermissionForCampground: function(req, res, next) {
		if( req.isAuthenticated() ) {
			Campground.findById({_id : req.params.id}, function(err, campground) {
				if(err) {
					console.log(err);
					res.redirect("/campgrounds");
				} else {
					if( campground.createdBy.id.equals(req.user._id)) {
						return next();					
					} else {
						res.redirect("/campgrounds/" + req.params.id);
					}
				}
			});		
		} else {
			res.redirect("/login");
		}
    }
}



