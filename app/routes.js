module.exports = function(app, passport, express) {

var mongoose = require( 'mongoose' );
var Todo     = mongoose.model( 'Todo' );
// normal routes ===============================================================

	
	//
	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		Todo.find( function ( err, todos, count ){
	    res.render( 'index', {
	      title : 'Express Todo Example',
	      todos : todos
	    });
	  });
		
	});

	//app.get( '/', todo.list );

	// add this before app.use( express.json());
	app.use( express.bodyParser());
	
	// create a todo
	app.post( '/create',isLoggedIn, function ( req, res ){
		  new Todo({
		    content    : req.body.content,
		    updated_at : Date.now()
		  }).save( function( err, todo, count ){
		    res.redirect( '/profile' );
		  });
		});

	// delete a todo
	app.get( '/destroy/:id',isLoggedIn, function ( req, res ){
	  Todo.findById( req.params.id, function ( err, todo ){
	    todo.remove( function ( err, todo ){
	      res.redirect( '/profile' );
	    });
	  }); 
	});


	// edit the todo
	app.get( '/edit/:id', isLoggedIn, function ( req, res ){

	  Todo.find( function ( err, todos ){
	    res.render( 'edit', {
	        title   : 'Express Todo Example',
	        todos   : todos,
	        current : req.params.id
	    });
	  }); 
	 });


	// update the todo
	app.post( '/update/:id', isLoggedIn, function ( req, res ){
	  Todo.findById( req.params.id, function ( err, todo ){
	    todo.content    = req.body.content;
	    todo.updated_at = Date.now();
	    todo.save( function ( err, todo, count ){
	      res.redirect( '/profile' );
	    });
	  });
	});

	// view the individual todo
	app.get( '/view/:id',  function ( req, res ){
		
	   Todo.findById( req.params.id, function ( err, todo ){
	    res.render( 'view', {
	        title   : 'Express Todo Example',
	        todo    : todo,
	        current : req.params.id
	    });
	  }); 
	 });




	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
	
		Todo.find( function ( err, todos, count ){
	    res.render( 'profile.ejs', {
	      title : 'Express Todo Example',
	      todos : todos,
	      user : req.user
	    });
	  });

	});

	// LOGOUT ==============================
	app.get('/logout', isLoggedIn,function(req, res) {
		req.logout();
		res.redirect('/');
	});




	


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : '/profile',
				failureRedirect : '/'
			}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});


};









// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
