
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var locationSchema = Schema( {
  namePlace:String,
  reupcycle:String,
  inputAddress1:String,
  inputAddress2:String,
  inputAddress3:String,
  inputCity:String, 
  inputState:String,
  inputZip:String,
  createdAt: Date,
  userId: ObjectId,
} );

module.exports = mongoose.model( 'Location', locationSchema );
