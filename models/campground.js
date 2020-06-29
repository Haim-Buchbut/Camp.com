
var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: String,
	website: String,
	image: String,
	desc: String,
	address: String,
	lat: Number,
	lng: Number,
	price: String,
	createdBy: {
		id: { 
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}, 
		username: String
	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});
campgroundSchema.index({name: 'text'}); // see https://stackoverflow.com/questions/28775051/best-way-to-perform-a-full-text-search-in-mongodb-and-mongoose


module.exports 	= mongoose.model("Campground",campgroundSchema);
