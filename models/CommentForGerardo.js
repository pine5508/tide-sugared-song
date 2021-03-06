'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var commentSchema = Schema( {
  title:String,
  rating:String, 
  text:String,
  createdAt: Date,  // when they left the comment
  userId: ObjectId,   // who left the comment
} );

module.exports = mongoose.model( 'CommentForGerardo', commentSchema );
