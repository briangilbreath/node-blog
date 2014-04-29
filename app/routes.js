module.exports = function(app, passport, express) {

var fs = require('fs');
var im = require('imagemagick');

//var mongoose = require( 'mongoose' );
var mongoose = require( 'mongoose-paginate' );
var Todo     = mongoose.model( 'Todo' );

var pageCount = 1;
// normal routes ===============================================================



		// show the home page (will also have our login links)
	app.get('/', templateLoggedIn, function(req, res) {

		Todo.paginate({}, 1, pageCount, function(error, pageCount, todos, itemCount) {

		    res.render( 'index', {
		      title : 'Express Todo Example',
		      todos : todos
		    });

		     if (error) {
   				console.error(error);
			  } else {
			      console.log('Pages:', pageCount);
			    console.log(todos);
			  }

	  	});

	});


	//show paginated homepage
	app.get('/page/:pagenum', templateLoggedIn, function(req, res) {

		pageNum = req.params.pagenum;
		pageNum = Number(pageNum) + 1;

		Todo.paginate({}, pageNum, pageCount, function(error, pageCount, todos, itemCount) {

		    res.render( 'index', {
		      title : 'Express Todo Example',
		      todos : todos
		    });

		     if (error) {
   				console.error(error);
			  } else {
			      console.log('Pages:', pageCount);
			    console.log(todos);
			  }

	  	});

	
	});



	// show the home page (will also have our login links)
	/*app.get('/', templateLoggedIn, function(req, res) {
		Todo.find( function ( err, todos, count ){
	    res.render( 'index', {
	      title : 'Express Todo Example',
	      todos : todos
	    });
	  });

	});*/

	// add this before app.use( express.json());
	app.use( express.bodyParser());
	
	// create a todo
	app.post( '/create', isLoggedIn, function ( req, res ){


		//console.log(req);
	  	fs.readFile(req.files.image.path, function (err, data) {
	  	//console.log('file read error: ' + err)
		var imageName = req.files.image.name;
		//console.log('image name: ' + imageName);
			/// If there's an error
			if(!imageName){

				console.log("There was an error")
				newPath = '';

			} else {

			  var newPath = global.dirPath + "/uploads/fullsize/" + imageName;
			  var thumbPath = global.dirPath + "/uploads/thumbs/" + imageName;
			  console.log(data);
			  console.log('newPath: ' + newPath);
			  /// write file to uploads/fullsize folder
			  fs.writeFile(newPath, data, function (err) {

			  	/// write file to uploads/thumbs folder
			  im.resize({
				  srcPath: newPath,
				  dstPath: thumbPath,
				  width:   200
				}, function(err, stdout, stderr){
				  if (err) throw err;
				  console.log('resized image to fit within 200x200px');
				});

			  	if(err){
			  			console.log('file write error: ' + err);
			  	}
			  
			  });
			}


			
			new Todo({
			  	title      : req.body.title,
			    content    : req.body.content,
			    updated_at : Date.now(),
			    image_path_full : newPath,
			    image_path : imageName,
			    slug: convertToSlug(req.body.title)
			  		}).save( function( err, todo, count ){
			    res.redirect( '/profile' );
			});
		  


		});

	});




	/// Show files/ routes for getting files
	app.get('/uploads/fullsize/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(global.dirPath + "/uploads/fullsize/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});

	app.get('/uploads/thumbs/:file', function (req, res){
		file = req.params.file;
		var img = fs.readFileSync(global.dirPath + "/uploads/thumbs/" + file);
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(img, 'binary');

	});


	// delete a todo
	app.get( '/destroy/:slug',isLoggedIn, function ( req, res ){
	  Todo.findOne( {'slug' : req.params.slug}, function ( err, todo ){
	    todo.remove( function ( err, todo ){
	      res.redirect( '/profile' );
	    });
	  }); 
	});


	// edit the todo
	app.get( '/edit/:slug', isLoggedIn, function ( req, res ){

	 Todo.findOne( {'slug' : req.params.slug}, function ( err, todo ){
	    res.render( 'edit', {
	        title   : 'Express Todo Example',
	        todo   : todo,
	        current : req.params.slug
	    });
	  }); 
	 });


	// update the todo
	app.post( '/update/:slug', isLoggedIn, function ( req, res ){



		//console.log(req);
	  	fs.readFile(req.files.image.path, function (err, data) {
	  	//console.log('file read error: ' + err)
		var imageName = req.files.image.name;



		console.log('image name: ' + imageName);
			/// If there's an error
			if(!imageName){

			    Todo.findOne( {'slug' : req.params.slug}, function ( err, todo ){
			  	todo.title    = req.body.title;
			    todo.content    = req.body.content;
			    todo.updated_at = Date.now();
			    todo.save( function ( err, todo, count ){
			      res.redirect( '/profile' );
			    });
			  });


			} else {

			  var newPath = global.dirPath + "/uploads/fullsize/" + imageName;
			  var thumbPath = global.dirPath + "/uploads/thumbs/" + imageName;
			  console.log(data);
			  console.log('newPath: ' + newPath);
			  /// write file to uploads/fullsize folder
			  fs.writeFile(newPath, data, function (err) {

			  	/// write file to uploads/thumbs folder
			  im.resize({
				  srcPath: newPath,
				  dstPath: thumbPath,
				  width:   200
				}, function(err, stdout, stderr){
				  if (err) throw err;
				  console.log('resized image to fit within 200x200px');
				});

			  	if(err){
			  			console.log('file write error: ' + err);
			  	}
			  
			  });



			  Todo.findOne( {'slug' : req.params.slug}, function ( err, todo ){
			  	todo.title    = req.body.title;
			    todo.content    = req.body.content;
			    todo.updated_at = Date.now();
			    todo.image_path_full = newPath;
			    todo.image_path = imageName;
			    todo.save( function ( err, todo, count ){
			      res.redirect( '/profile' );
			    });
			  });




			}





		});	






	});

	// view the individual todo
	/*app.get( '/view/:id',  function ( req, res ){
		
	   Todo.findById( req.params.id, function ( err, todo ){
	    res.render( 'view', {
	        title   : 'Express Todo Example',
	        todo    : todo,
	        current : req.params.id
	    });
	  }); 
	 });*/

	 app.get( '/view/:slug',  function ( req, res ){
		
	   Todo.findOne( {'slug' : req.params.slug}, function ( err, todo ){
	    res.render( 'view', {
	        title   : 'Express Todo Example',
	        todo    : todo
	    });
	  }); 
	 });






	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, templateLoggedIn, function(req, res) {
	
	 Todo.find().sort( '-updated_at' ).exec( function ( err, todos ){
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
	/*
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

	*/

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

	/*
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

	*/

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

	/*
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

*/


};






function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}

// route middleware to ensure user is logged in
function templateLoggedIn(req, res, next) {
	 res.locals.login = req.isAuthenticated();
  	 next();
}
