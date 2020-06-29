var express = 			require("express");
var bodyParser = 		require("body-parser");
var mongoose = 			require("mongoose");
var passport =			require("passport");
var LocalStrategy = 	require("passport-local");
var flash =				require("connect-flash");
var Campground = 		require("./models/campground");
var Comment = 			require("./models/comment");
var User = 				require("./models/user");
var session = 			require("express-session"); 
var methodOverride = 	require("method-override");
// var seedDB = 		require("./seeds");

var app = express();

// Acquiring routes
var campgroundsRoutes 	= require("./routes/campgrounds");
var commentsRoutes 		= require("./routes/comments");
var indexRoutes      	= require("./routes/index");

// Connect to the Database (requires to setup DATABASEURL env. var)
mongoose.set('useUnifiedTopology', true);
var url = process.env.DATABASEURL || "mongodb://localhost/yelpcamp";
mongoose.connect(url, { 
	useNewUrlParser: true,
	useCreateIndex: true 
}, function() {
	console.log("Connected to DB!")
});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'))
// seedDB(); // Seeding the DB with initial data for testing
app.use(flash());

// Configuring passport for authentication
app.use(require("express-session")({
	secret: "Leo is fat",
	resave: false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passport.use(User.createStrategy()); enable using different username name (e.g. email). See here: https://www.npmjs.com/package/passport-local-mongoose#simplified-passportpassport-local-configuration
app.use(function(req,res,next){
   	res.locals.currentUser = req.user;
   	res.locals.successMsg = req.flash("successMsg");
   	res.locals.errorMsg = req.flash("errorMsg");
	next();
});


// Routes
app.use(indexRoutes);
app.use(campgroundsRoutes);
app.use(commentsRoutes);
// Default handling for unavailable pages  
app.get("*", function(req,res){
	res.send("This page is not available!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("YelpCamp server is up!");
});


