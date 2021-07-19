'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var locationSchema = Schema( {
  name:String,
  reupcycle:String,
  address1:String,
  address2:String,
  city:String, 
  state:String,
  zip:String,
  imgURL:String, 
  details:String,
  phone:String,
  hrs:String,
  createdAt: Date,
  userId: ObjectId,
} )

module.exports = mongoose.model( 'Location', locationSchema );
