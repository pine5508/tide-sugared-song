'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var feedbackSchema = Schema( {
  feedback:String,
  createdAt: Date,
  userId: ObjectId, 
} );

module.exports = mongoose.model( 'Feedback', feedbackSchema);
