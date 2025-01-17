
var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
	text: String,
	score: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}, 
		username: String
	}
	// created: {type:Date, default: Date.now()}
});

module.exports = mongoose.model("Comment", commentSchema); 