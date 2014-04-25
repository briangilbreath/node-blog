var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Todo = new Schema({
    user_id    : String,
    title      : String,
    content    : String,
    updated_at : Date,
    slug       : String,
    image_path_full: String,
    image_path: String
});
 
mongoose.model( 'Todo', Todo );
// create the model for users and expose it to our app module.exports = 