var mongoose = require("mongoose");
var crypto = require("crypto");
var mkdirp = require("mkdirp");
var fs = require("fs");
var im = require("imagemagick");
var feed = require("../models/feed");

exports.autoLogin = function(username, password, callback) {
	var user = mongoose.model('user');
	user.findOne({
		username : username
	}, function(error, result) {
		if (result) {
			if (result.password === password) {
				callback(result);
			} else {
				callback(null);
			}
		} else {
			callback(null, error);
		}
	});
};

exports.manualLogin = function(username, password, callback) {
	var user = mongoose.model('user');
	user.findOne({
		username : username
	}, function(error, result) {
		if (result === null) {
			callback('user-not-found');
		} else {
			validatePassword(password, result.password, function(res) {
				if (res) {
					callback(null, result);
				} else {
					callback('invalid-password');
				}
			});
		}
	});
};

exports.addNewUser = function(data, callback) {
	var user = mongoose.model("user");
	if (data.username === undefined) {
		callback("username-not-defined");
	} else if (data.password === undefined) {
		callback("password-not-defined");
	} else if (data.firstname === undefined) {
		callback("firstname-not-defined");
	} else if (data.lastname === undefined) {
		callback("lastname-not-defined");
	} else if (data.email === undefined) {
		callback("email-not-defined");
	} else if (data.birthdate === undefined) {
		callback("birthdate-not-defined");
	} else if (data.address === undefined) {
		callback("address-not-defined");
	}
	user.findOne({
		$or : [ {
			'username' : data.username
		}, {
			'email' : data.email
		} ]
	}, function(error, object) {
		if (object) {
			if (object.username == data.username) {
				callback('username-exists');
			} else if (object.email == data.email) {
				callback('email-exists');
			}
		} else {
			if (!data.blockedUsers) {
				data.blockedUsers = [];
			}
			saltAndHash(data.password, function(hash) {
				var birthdateInMilis = Date.parse(data.birthdate);
				var newUser = new user({
					'username' : data.username,
					'password' : hash,
					'firstname' : data.firstname,
					'lastname' : data.lastname,
					'email' : data.email,
					'birthdate' : birthdateInMilis,
					'address' : data.address,
					'blockedUsers' : data.blockedUsers,
					'creationDate' : new Date(),
					'modificationDate' : new Date()
				});
				newUser.save(function(error) {
					if (error) {
						console.log(error);
						callback(error);
					} else {
						callback(null);
					}
				});
			});
		}
	});
};

exports.updateAccount = function(id, data, files, callback) {
	var user = mongoose.model("user");
	if (data.username === undefined) {
		callback("username-not-defined");
	} else if (data.password === undefined) {
		callback("password-not-defined");
	} else if (data['first-name'] === undefined) {
		callback("firstname-not-defined");
	} else if (data['last-name'] === undefined) {
		callback("lastname-not-defined");
	} else if (data.email === undefined) {
		callback("email-not-defined");
	} else if (data.birthdate === undefined) {
		callback("birthdate-not-defined");
	} else if (data.address === undefined) {
		callback("address-not-defined");
	}
	user
			.findOne(
					{
						$or : [ {
							username : data.username,
							_id : {
								$not : id
							}
						}, {
							email : data.email,
							_id : {
								$not : id
							}
						} ]
					},
					function(error, result) {
						if (result) {
							if (result.username == req.session.user.username) {
								callback("username-exists");
							} else if (result.email == req.session.user.email) {
								callback("email-exists");
							}
						} else {
							if (files["profile-image"].name !== "") {
								fs
										.readFile(
												files["profile-image"].path,
												function(err, imgData) {
													if (err) {
														console.log("reading");
														callback(err);
													} else {
														var newPath = "./public/images/uploads/"
																+ data.username;
														mkdirp(
																newPath,
																function(err) {
																	if (err) {
																		console
																				.log("mkdirp");
																		callback(err);
																	} else {
																		var extension = files["profile-image"].name
																				.substr(
																						files["profile-image"].name
																								.lastIndexOf("."),
																						files["profile-image"].name.length);
																		var fullSize = "fullSize"
																				+ extension;
																		var thumb = "thumb"
																				+ extension;
																		var medium = "medium"
																				+ extension;
																		fs
																				.writeFile(
																						newPath
																								+ "/"
																								+ fullSize,
																						imgData,
																						function(
																								err) {
																							if (err) {
																								console
																										.log("writing");
																								callback(err);
																							} else {
																								im
																										.resize(
																												{
																													srcPath : newPath
																															+ "/"
																															+ fullSize,
																													dstPath : newPath
																															+ "/"
																															+ medium,
																													width : 100,
																													height : 100
																												},
																												function(
																														err,
																														stdout,
																														stderr) {
																													if (err) {
																														callback(err);
																													} else {
																														im
																																.resize(
																																		{
																																			srcPath : newPath
																																					+ "/"
																																					+ fullSize,
																																			dstPath : newPath
																																					+ "/"
																																					+ thumb,
																																			width : 50,
																																			height : 50
																																		},
																																		function(
																																				err,
																																				stdout,
																																				stderr) {
																																			if (err) {
																																				callback(err);
																																			} else {
																																				var birthdateInMilis = Date
																																						.parse(data.birthdate);
																																				var blockedUsers = (data.blockedUsers) ? data.blockedUsers
																																						: [];
																																				saltAndHash(
																																						data.password,
																																						function(
																																								hash) {
																																							user
																																									.update(
																																											{
																																												_id : id
																																											},
																																											{
																																												'username' : data.username,
																																												'password' : hash,
																																												'firstname' : data['first-name'],
																																												'lastname' : data['last-name'],
																																												'email' : data.email,
																																												'birthdate' : birthdateInMilis,
																																												'address' : data.address,
																																												'blockedUsers' : blockedUsers,
																																												'modifiedDate' : new Date(),
																																												'imgFullSizePath' : "/images/uploads/"
																																														+ data.username
																																														+ "/"
																																														+ fullSize,
																																												'imgMediumPath' : "/images/uploads/"
																																														+ data.username
																																														+ "/"
																																														+ medium,
																																												'imgThumbPath' : "/images/uploads/"
																																														+ data.username
																																														+ "/"
																																														+ thumb
																																											},
																																											function(
																																													error,
																																													result) {
																																												if (error) {
																																													console
																																															.log("update");
																																													callback(error);
																																												} else {
																																													callback(
																																															null,
																																															result);
																																												}
																																											});
																																						});
																																			}
																																		});
																													}
																												});
																							}
																						});
																	}

																});
													}
												});
							} else {
								var birthdateInMilis = Date
										.parse(data.birthdate);
								var blockedUsers = (data.blockedUsers) ? data.blockedUsers
										: [];
								saltAndHash(data.password, function(hash) {
									user.update({
										_id : id
									}, {
										'username' : data.username,
										'password' : hash,
										'firstname' : data['first-name'],
										'lastname' : data['last-name'],
										'email' : data.email,
										'birthdate' : birthdateInMilis,
										'address' : data.address,
										'blockedUsers' : blockedUsers,
										'modifiedDate' : new Date()
									}, function(error, result) {
										if (error) {
											console.log("update");
											callback(error);
										} else {
											callback(null, result);
										}
									});
								});
							}
						}
					});
};

exports.getAllUsers = function(callback) {
	var user = mongoose.model('user');
	user.find(function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
};

exports.getUserByUsername = function(username, callback) {
	var user = mongoose.model('user');
	user.findOne({
		username : username
	}, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	})
};

exports.getUserById = function(id, callback) {
	var user = mongoose.model('user');
	user.findOne({
		_id : id
	}, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	})
};
exports.getUserByIdBrief = function(id, callback) {
	var user = mongoose.model('user');
	user.findOne({
		_id : id
	}, {
		_id : 1,
		firstname : 1,
		lastname : 1,
		imgThumbPath : 1
	}, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	})
}
exports.getAllUsersExceptOneself = function(username, callback) {
	var user = mongoose.model('user');
	user.find({
		username : {
			$ne : username
		}
	}, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
}

exports.getRatingByUserId = function(userId, callback) {
	getAllLikesForUserById(userId, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
}
/* Private encryption and validation methods */
var generateSalt = function() {
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
};

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
};

var saltAndHash = function(pass, callback) {
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
};

var validatePassword = function(plainPassword, hashedPassword, callback) {
	var salt = hashedPassword.substr(0, 10);
	var validHash = salt + md5(plainPassword + salt);
	callback(hashedPassword === validHash);
};

var getAllLikesForUserById = function(userId, callback) {
	feed.getAllLikesFromUserById(userId, function(error, result) {
		if (error) {
			callback(error);
		} else {
			callback(null, result);
		}
	});
};