var inbox = require("inbox")
	, util = require("util")
	, MailParser = require("mailparser").MailParser 
	, Sink = require('pipette').Sink
	, Pipe = require('pipette').Pipe
	, moment = require('moment');




exports.inbox = function(req, res){

	/* cache a copy 
	new_thread = new Inbox({title: req.body.title, messages: blah});
    new_thread.save();
    */

	var mail = {};
	var folder = 'INBOX';
	var limit = 20;

	var client = inbox.createConnection(false, req.app.imap.server, {
	    secureConnection: req.app.imap.secureConnection,
	    auth:{
	        user: req.app.imap.username,
	        pass: req.app.imap.password
	    }
	});


	client.connect();



	client.on("error", function(error) {
		console.log(error);
	});
	client.on("connect", function(){

		if (req.query.folder) {
			folder = req.query.folder;
		}
		if (req.query.limit) {
			limit = req.query.limit;
		}
	    client.openMailbox(folder, req.app.imap.options, function(error, info){
	        if(error) console.log("inbox: " + error);

	        client.listMessages(-parseFloat(limit), function(err, messages){

	        	messages.reverse();
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
			if(error) console.log("mailboxes: " + error);
			var root = mailboxes;

		    for(var i=0, len = mailboxes.length; i<len; i++){
		        if(mailboxes[i].hasChildren){
		            mailboxes[i].listChildren(function(error, children){
		            	children.unshift(root[0]);
		            	res.send(children);
					    client.close();
						console.log("closed mailboxes");
		            });
		        }
		    }
		});
	});
	client.on("end", function() {
		console.log("ended");
	});


}


exports.body = function(req, res) {

	//req.app.imap.uuid = req.params.UUID;
	var mail, data, postData = {};
	req.app.imap.folder = 'INBOX';
	if (req.query.folder) {
			req.app.imap.folder = req.query.folder;
	}
	if (req.query.UID) {
			req.app.imap.uuid = req.query.UID;
	}

	var data = new Pipe();



	var mailparser = new MailParser();

	mailparser.on("end", function(mail_object){
		//mail_object.headers.date =  mail_object.headers.date;//moment(mail_object.headers.date).format("ddd, h:mmA");

		var send = {};
		send.headers = mail_object.headers;
		send.subject = mail_object.subject;
		send.from = mail_object.from;
		send.to = mail_object.to;
		send.cc = mail_object.cc;
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


		client.openMailbox(req.app.imap.folder, req.app.imap.options, function(error, info){
			//if(error) throw error;
 			if(error) console.log("body: " + error);

			try{
				client.createMessageStream(req.app.imap.uuid).pipe(mailparser);
			}
			catch (e) {
				console.log(e);
			}
			
			//client.createMessageStream(req.app.imap.uuid).pipe(data.writer, {end: true});
			//client.createMessageStream(req.app.imap.uuid).pipe(process.stdout, {end: false});

		});
	});


};


