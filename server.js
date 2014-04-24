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
var http     = require('http');
var path     = require('path');

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
	app.use(express.bodyParser()); // get information from html forms

	app.engine('ejs', engine);
	app.set('view engine', 'ejs'); // set up ejs for templating


	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

	//todos
	app.use( express.favicon());
	app.use( express.logger( 'dev' ));
	app.use( express.json());
	app.use( express.urlencoded());
	app.use( express.methodOverride());
	app.use( app.router );
	app.use( express.static( path.join( __dirname, 'public' )));

});

// routes ======================================================================
require('./app/routes.js')(app, passport, express); // load our routes and pass in our app and fully configured passport
//require('./app/routes.js')(app, passport, express, todo); 










// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
