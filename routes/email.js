var inbox = require("inbox")
	, util = require("util")
	, MailParser = require("mailparser").MailParser 
	, Sink = require('pipette').Sink
	, Pipe = require('pipette').Pipe
	, dateFormat = require('dateformat');


dateFormat.masks.hammerTime = 'HH:MM d/mm/yyyy';

exports.inbox = function(req, res){

	/* cache a copy 
	new_thread = new Inbox({title: req.body.title, messages: blah});
    new_thread.save();
    */

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
	});
	client.on("connect", function(){

	    client.openMailbox("INBOX", req.app.imap.options, function(error, info){
	        if(error) console.log("connect: " + error);

	        client.listMessages(-20, function(err, messages){

	        	//
	        	for(var i=0; i<messages.length; i++) {
	        		messages[i].date = dateFormat(messages[i].date, "hammerTime");
	        	}

	        	res.send( messages);
	        	client.close();
				console.log('closed inbox');
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

	client.on("connect", function(){

		client.listMailboxes(function(error, mailboxes){
		    for(var i=0, len = mailboxes.length; i<len; i++){
		        if(mailboxes[i].hasChildren){
		            mailboxes[i].listChildren(function(error, children){
		                res.send(children);
		            });
		        }
		        client.close();
				console.log("closed mailboxes");
		    }
		});
	});


}


exports.body = function(req, res) {

	req.app.imap.uuid = req.params.UUID;
	var mail, data, postData = {};


	var data = new Pipe();

  	//var postData = new Sink(data.reader);
	//postData.on("data", onPostData);
/*
	function onPostData(data) {

		message = mailparser.write(data.toString());
		mailparser.end();
	}*/

	var mailparser = new MailParser();

	mailparser.on("end", function(mail_object){
		mail_object.headers.date = dateFormat(mail_object.headers.date, "hammerTime");

		var send = {};
		send.headers = mail_object.headers;
		send.subject = mail_object.subject;
		send.from = mail_object.from;
		send.to = mail_object.to;
		send.html = mail_object.html;
		send.text = mail_object.text;

		res.send(send);

		client.close();
		console.log("closed body");

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


			client.createMessageStream(req.app.imap.uuid).pipe(mailparser);
			//client.createMessageStream(req.app.imap.uuid).pipe(data.writer, {end: true});
			//client.createMessageStream(req.app.imap.uuid).pipe(process.stdout, {end: false});

		});
	});


};


