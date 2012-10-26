var inbox = require("inbox")
	, util = require("util")
	, MailParser = require("mailparser").MailParser 
	, Sink = require('pipette').Sink
	, Pipe = require('pipette').Pipe
	, dateFormat = require('dateformat');

dateFormat.masks.hammerTime = 'HH:MM d/mm/yyyy';

exports.inbox = function(req, res){
	var mail = {};

	var client = inbox.createConnection(false, req.app.imap.server, {
	    secureConnection: req.app.imap.secureConnection,
	    auth:{
	        user: req.app.imap.username,
	        pass: req.app.imap.password
	    }
	});


	client.connect();


	//client.on("new", function(message){
	//    console.log("New incoming message " + message.title);
	//});
	client.on("error", function(error) {
		console.log(error);
		res.send({"error" : "something bad happened"});
	});
	client.on("connect", function(){

	    client.openMailbox("INBOX", req.app.imap.options, function(error, info){
	        if(error) console.log("connect: " + error);

	        client.listMessages(-20, function(err, messages){

	        	//
	        	for(var i=0; i<messages.length; i++) {
	        		messages[i].date = dateFormat(messages[i].date, "hammerTime");
	        	}

	        	res.send(messages);
	        });

	    });
	});

};

exports.mailboxes = function(req,res) {

	var client = inbox.createConnection(false, req.app.imap.server, {
	    secureConnection: req.app.imap.secureConnection,
	    auth:{
	        user: req.app.imap.username,
	        pass: req.app.imap.password
	    }
	});


	client.connect();


	//client.on("new", function(message){
	//    console.log("New incoming message " + message.title);
	//});

	client.on("connect", function(){

		client.listMailboxes(function(error, mailboxes){
		    for(var i=0, len = mailboxes.length; i<len; i++){
		        if(mailboxes[i].hasChildren){
		            mailboxes[i].listChildren(function(error, children){
		                res.send(children);
		            });
		        }
		    }
		});
	});


}


exports.body = function(req, res) {

	req.app.imap.uuid = req.params.UUID;
	var mail = {};

	var data = new Pipe();

  	var postData = new Sink(data.reader);
	postData.on("data", onPostData);

	function onPostData(data) {

		message = mailparser.write(data.toString());
		mailparser.end();
	}

	var mailparser = new MailParser();
	mailparser.on("end", function(mail_object){
		res.send(mail_object);

	});


	var client = inbox.createConnection(false,req.app.imap.server, {
	    secureConnection: req.app.imap.secureConnection,
	    auth:{
	        user: req.app.imap.username,
	        pass: req.app.imap.password
	    }
	});

	client.connect();

	client.on("connect", function(){


		client.openMailbox("INBOX", req.app.imap.options, function(error, info){
			if(error) throw error;

			client.createMessageStream(req.app.imap.uuid).pipe(data.writer, {end: true});


		});
	});





};


