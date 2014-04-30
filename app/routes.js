module.exports = function(app, passport, express) {

var fs = require('fs');
var im = require('imagemagick');

var mongoose = require( 'mongoose' );
//var mongoose = require( 'mongoose-paginate' );
var Todo     = mongoose.model( 'Todo' );

var pageCount = 2; //posts per page

// normal routes ===============================================================



	// show the home page (will also have our login links)
	app.get('/', templateLoggedIn, function(req, res) {

		 Todo.find().sort( '-updated_at' ).skip(0).limit(pageCount).exec( function ( err, todos ){

		    res.render( 'index', {
		      title : 'Express Todo Example',
		      todos : todos,
		      pageNum: 0
		    });
   
	  	});

	});


	//show paginated homepage
	app.get('/page/:pagenum', templateLoggedIn, function(req, res) {

		pageNum = Number(req.params.pagenum);
		console.log(pageNum);
		skip = pageNum * pageCount;

		 Todo.find().sort( '-updated_at' ).skip(skip).limit(pageCount).exec( function ( err, todos ){

		    res.render( 'index', {
		      title : 'Express Todo Example',
		      todos : todos,
		      pageNum: pageNum
		    });

	  	});

	
	});

	
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


			// TODO: see if slug exists before save.
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
