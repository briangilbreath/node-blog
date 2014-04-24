/*require( '../app/models/todo.js' );

var mongoose = require( 'mongoose' );
var Todo     = mongoose.model( 'Todo' );

exports.create = function ( req, res ){
  new Todo({
    content    : req.body.content,
    updated_at : Date.now()
  }).save( function( err, todo, count ){
    res.redirect( '/profile' );
  });
};


// query db for all todo items
exports.list = function ( req, res ){
  Todo.find( function ( err, todos, count ){
    res.render( 'index', {
      title : 'Express Todo Example',
      todos : todos
    });
  });
};


// remove todo item by its id
exports.destroy = function ( req, res ){
  Todo.findById( req.params.id, function ( err, todo ){
    todo.remove( function ( err, todo ){
      res.redirect( '/profile' );
    });
  });
};
*/