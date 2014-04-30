// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var engine = require('ejs-locals');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var http     = require('https');
var path     = require('path');
var helmet   = require('helmet');


global.dirPath = __dirname;

var configDB = require('./config/database.js');
require( './app/models/todo.js' );
//var todo     = require('./config/todos.js');	


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	//app.use(express.bodyParser()); // get information from html forms
	app.use(express.methodOverride());
	app.use(express.static( path.join( __dirname, 'public' )));

	app.use(helmet.xframe());
	app.use(helmet.iexss());
	app.use(helmet.contentTypeOptions());
	app.use(helmet.cacheControl());

	app.engine('ejs', engine);
	app.set('view engine', 'ejs'); // set up ejs for templating


	// required for passport
	app.use(express.session({ 
		secret: 'ilovescotchscotchyscotchscotch',
		cookie: {httpOnly: true},
	})); // session secret



	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session


	//todos
	app.use( express.favicon());
	app.use( express.json());
	app.use( express.urlencoded());


	//app.use(express.csrf());
	//middleware
	app.use(function(req,res,next){
		res.locals.session = req.session;
    	res.locals.login = req.isAuthenticated();
    	
    	//res.cookie('XSRF-TOKEN', req.csrfToken());
  		//res.locals.csrftoken = req.csrfToken();

  		//console.log(req.csrfToken());


  	 	next();
	});

   
	app.use( app.router );
	

});

// routes ======================================================================
require('./app/routes.js')(app, passport, express); // load our routes and pass in our app and fully configured passport
//require('./app/routes.js')(app, passport, express, todo); 










// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
