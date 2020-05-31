
var mongoose = require("mongoose");
var comment = require("./comment");

var userSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	comments: [Comment.Schema]
});

module.exports = mongoose.model("User", userSchema);