'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var commentSchema = Schema( {
  title:String,
  text:String,
  rating:String,
  createdAt: Date,  // when they left the comment
  userId: ObjectId,   // who left the comment
} );

module.exports = mongoose.model( 'CommentForRahma', commentSchema );