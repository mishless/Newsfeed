var user = require('../models/user');

exports.index = function(req, res) {
	res.render('index', {title : "Newsfeed"});
};

exports.loginView = function(req, res) {
	if (req.cookies.user == undefined || req.cookies.pass == undefined) {
		var errorMsg;
		var successMsg;
		if (req.query.error && req.query.error == "wrong-user") {
			errorMsg = "The username/password you tried to log in with are wrong.";
		} else if (req.query.error && req.query.error == "other") {
			errorMsg = "There was a problem signing you in. Why don't you try again later?";
		} else if (req.query.error && req.query.error == "invalid-credentials") {
			errorMsg = "Username and password are mandagtory and have to be between 5 and 50 characters.";
		} else if (req.query.success && req.query.success == "true") {
			successMsg = "You have registered successfully. Please log in to your account.";
		}
		res.render("login", {title: "Log In to Newsfeed application.", error: errorMsg, success: successMsg});
	} else {
		user.autoLogin(req.cookies.user, req.cookies.pass, function(o) {
			if (o != null) {
				req.session.user = o;
				req.session.messages.push(['success', 'You have logged in successfully.']);
				res.redirect("/home");
			} else {
				res.render("login", {title: "Log In to Newsfeed application."});
			}
		});
	}
};

exports.login = function(req, res) {
	user.manualLogin(req.param("username"), req.param("password"), function(
			error, result) {
		if (!result) {
			res.send(error, 400);
		} else {
			req.session.user = result;
			if (req.param('remember-me')) {
				res.cookie("user", req.param("username"), {
					maxAge : 900000
				});
				res.cookie("pass", req.param("password"), {
					maxAge : 900000
				});
			}
			req.session.messages.push(['success', 'You have logged in successfully.']);
			res.send("ok", 200);
		}
	});
};

exports.signup = function(req, res) {
	res.render('signup', {
		title : "Sign up"
	});
};

exports.register = function(req, res) {
	user.addNewUser(req.body,
					function(error) {
						if (error != null) {
							req.session.messages.push(['error', error]);
							res.send(error, 400);
						} else {
							req.session.messages.push(['success',
								'You have registered successfully. Please log in your account.']);
							res.send("ok", 200);
						}
					});
};

exports.home = function(req, res) {
	if (req.session.user == null) {
		req.session.messages.push(['error',
				'Your session has expired. Please log in your account.']);
		res.redirect("/");
	} else {
		res.render("home", {
			title : "Welcome",
			userdata : req.session.user
		});
	}
};

exports.signout = function(req, res) {
	if (req.session.user == null) {
		req.session.messages.push(['error',
				'Your session has expired. Please log in your account.']);
		res.redirect("/");
	} else {
		req.session.user = null;
		req.session.messages.push(['success', 'Your have successfully logged out.']);
		res.redirect("/");
	}
};


exports.editProfile = function(req, res) {
	if (req.session.user == null) {
		req.session.messages.push(['error',
				'Your session has expired. Please log in your account.']);
		res.redirect("/login");
	} else {
		var birthdate = new Date(req.session.user.birthdate);
		var formattedBirthdate =  ('0' + (birthdate.getMonth() + 1)).slice(-2) + '/' + ('0' + birthdate.getDate()).slice(-2) + '/' +  birthdate.getFullYear();
		user.getAllUsersExceptOneself(req.session.user.username, function(error, allUsers) {
			if (error) {
				req.session.messages.push(['error', 'There was a problem retrieving users.']);
				res.redirect("/home");
			} else {
				user.getUserByUsername(req.session.user.username, function(error, result) {
					if (error) {
						req.session.messages.push(['error', 'There was a problem retrieving blocked users.']);
						res.redirect("/home");
					} else {
						console.log(result);
						res.render('editProfile', {
							title: "Edit profile",
							username: req.session.user.username,
							firstname: req.session.user.firstname,
							lastname: req.session.user.lastname,
							email: req.session.user.email,
							birthdate: formattedBirthdate,
							address: req.session.user.address,
							users: allUsers,
							blockedUsers: result.blockedUsers,
							medImg: req.session.user.imgMediumPath,
							bigImg: req.session.user.imgFullSizePath
						});
					}
				});
				
			}
		});
	}
};

exports.updateProfile =  function(req, res) {
	if (req.session.user == null) {
		req.session.messages.push(['error',
				'Your session has expired. Please log in your account.']);
		res.redirect("/");
	} else {
		console.log(req.body);
		console.log(req.files);
		user.updateAccount(req.session.user._id, req.body, req.files, function(error, result) {
			if (error) {
				console.log(error);
				req.session.messages.push(['error',
							           				'There was a problem updating your account. Please try again later.']);
				res.redirect("/edit-profile");
			} else {
				user.getUserById(req.session.user._id, function(error, result) {
					if (result) {
						req.session.user = result;
						req.session.messages.push(['success',
						           				'You have successfully updated your account!']);
						res.redirect("/edit-profile");
					} else {
						console.log(error);
						req.session.messages.push(['error',
								           				'There was a problem updating your account. Please try again later.']);
						res.redirect("/edit-profile");
					}
				});
			} 
		});
	}
};

exports.notFound = function(req, res) {
	res.render("404");
};