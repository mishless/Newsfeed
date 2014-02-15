var user = require('../models/user');
var feed = require('../models/feed');
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
function checkSession(session, res){
    if (session.user == null) {
        session.messages.push(['error',
            'Your session has expired. Please log in your account.']);
        res.redirect("/");
        return false;
    }
    else
        return true;

}
exports.home = function(req, res) {
    if(checkSession(req.session,res)){
		res.render("home", {
			title : "Welcome",
			userdata : req.session.user
		});
	}
};

exports.signout = function(req, res) {
	if(checkSession(req.session, res)){
		req.session.user = null;
		req.session.messages.push(['success', 'Your have successfully logged out.']);
		res.redirect("/");
	}
};


exports.editProfile = function(req, res) {
	if (checkSession(req.session, res)){
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
							id: req.session.user._id,
							username: req.session.user.username,
							firstname: req.session.user.firstname,
							lastname: req.session.user.lastname,
							email: req.session.user.email,
							birthdate: formattedBirthdate,
							address: req.session.user.address,
							users: allUsers,
							blockedUsers: result.blockedUsers,
							thumbImg: req.session.user.imgThumbPath,
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
	if (checkSession(req.session, res)) {
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

exports.viewProfile = function(req, res) {
	if (checkSession(req.session, res)) {
		var userData = user.getUserById(req.params.id, function(error, result) {
			if (result) {
				//req.session.userToView = result;
				res.render("profile", {userToView : result, thumbImg: req.session.user.imgThumbPath, firstname: req.session.user.firstname, lastname: req.session.user.lastname});
			} else {
				
			}
		});
	}
};

exports.feeds = function(req, res){
    if (checkSession(req.session, res)) {
        var skip = parseInt(req.query.skip);
        var feedsCount = 3;
        if(!skip||skip<0)
            skip = 0;
	    res.render("feeds", {user:req.session.user._id, blockedUsers:req.session.user.blockedUsers});

       /* feed.getNextNFeeds(feedsCount, skip, function (error, result) {
	        if(error){
	           session.messages.push(["error", error]);
           }else{
            //console.log(result);
	        var nextSkip = skip + feedsCount;
            //res.render("feeds", {feeds: result, nextSkip:(skip + feedsCount), prevSkip:(skip - feedsCount)});

           }
        });*/
    }
}
exports.postFeed = function(req, res){
   /* if(checkSession(req.session, res)){
		feed.addFeed({content:req.param("feed-content"),user:req.session.user._id},function(error){
			if(error){
				session.messages.push(["error", error]);//Should show internal server error...
			}
			else{
				const feedsCount = 3;
				feed.getFirstNFeeds(feedsCount,function(error, result){
					if(error){
						session.messages.push(["error", error]);//Should show internal server error...
					}
					else{
						res.render("feeds", {feeds: result, nextSkip:feedsCount});
					}
				})
			}
		});
    }*/
}
exports.notFound = function(req, res) {
	res.render("404");
};
