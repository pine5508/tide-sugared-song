'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var feedbackSchema = Schema( {
  feedback:String,
  userId: ObjectId, 
  createdAt: Date,
} );

module.exports = mongoose.model( 'Feedback', feedbackSchema );
