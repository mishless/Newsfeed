var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	username: {type: String, required: true, index: {unique: true}},
	password: {type: String, required: true},
	firstname: {type: String, required: true},
	lastname: {type: String, required: true},
	email: {type: String, required: true, index: {unique: true}},
	birthdate: {type: Number, required: true},
	address: {type: String, required: true},
	creationDate: {type: Date, required: true},
	modificationDate: {type: Date, required: true},
	blockedUsers: {type: [String]},
	imgFullSizePath: {type: String},
	imgMediumPath: {type: String},
	imgThumbPath: {type: String}
});

mongoose.model("user", userSchema, "user");

mongoose.connect('mongodb://localhost/newsfeed', function(err, res) {
	if (err) {
		console.log('Could not connect to newsfeed database. ' + err);
	} else {
		console.log('Successfully connected to newsfeed database.');
	}
});

