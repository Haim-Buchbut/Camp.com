var Campground = require("../models/campground");

module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("errorMsg", "You must log in first");
        res.redirect("/login");
    },
	hasPermissionForCampground: function(req, res, next) {
		if( req.isAuthenticated() ) {
			Campground.findById({_id : req.params.id}, function(err, campground) {
				if(err || !campground) {
					console.log(err);
			        req.flash("errorMsg", "We could not find this campground");
					res.redirect("/campgrounds");
				} else {
					if( campground.createdBy.id.equals(req.user._id)) {
						// req.flash("successMsg", "You must log in first");
						return next();					
					} else {
						req.flash("errorMsg", "You don't have a permission to do that");
						res.redirect("/campgrounds/" + req.params.id);
					}
				}
			});		
		} else {
	        req.flash("errorMsg", "You must log in first");
			res.redirect("/login");
		}
    }
}



