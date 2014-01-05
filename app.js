var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var index = require('./routes/index');
var flash = require('connect-flash');
var db = require("./models/db");
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
	secret : 'super-duper-secret-secret'
}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.configure(function() {
	app.use(function(req, res, next) {
		app.locals.messages = req.session.messages || (req.session.messages = []);
		next();
	});
	/*app.use(function(req, res, next){
		res.render('404', { status: 404, url: req.url });
	});*/
});
// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

require("./router")(app);

app.locals({
	nameVersionCredentials : function(name, version, credentials) {
		return name + ' v' + version + ' ' + credentials;
	},

	appName : 'Newsfeed',
	version : '0.1',
	credentials: 'Minions 2013',
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
