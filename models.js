
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * Schema definition

    String
    Number
    Boolean | Bool
    Array
    Buffer
    Date
    ObjectId | Oid
    Mixed


 */

var Inbox = new Schema({
    accountname      : String
  , uuid : String
  , body   : [Message]
});

var Message = new Schema({
    headers 	: Array
  , subject     : String 
  , priority 	: String
  , from 		: Array
  , to 			: Array
  , attachments : Array
  , html 		: String
  , text 		: String
});

var Files = new Schema({
	contentType 	: String
  , fileName 		: String
  , trasferEncoding : String
  , contentDisposition : String
  , generatedFileName 	: String
  , checksum 		: String
  , length 			: Number
  , content 		: Buffer
});

/**
 * Models
 */

mongoose.model('Inbox', Inbox);
exports.Inbox = function(db) {
  return db.model('Inbox');
};

mongoose.model('Message', Message);
exports.Message = function(db) {
    return db.model('Message');
};



