var index = require('./routes/index');

module.exports = function(app) {
	app.get("/", index.index);
	app.get("/login", index.loginView);
	app.post("/login", index.login);
	app.get("/signup", index.signup);
	app.post("/signup", index.register);
	app.get("/home", index.home);
	app.get("/signout", index.signout);
	app.get("/edit-profile", index.editProfile);
	app.post("/edit-profile", index.updateProfile);
	app.get("/profile/:id", index.viewProfile);
    app.get("/feeds", index.feeds);
    app.post("/feeds", index.postFeed);
};