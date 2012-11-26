var inbox = require("inbox")
	, util = require("util")
	, MailParser = require("mailparser").MailParser 
	, Sink = require('pipette').Sink
	, Pipe = require('pipette').Pipe
	, moment = require('moment')
	, AM = require('../models/login.js');




function has_session(req, res) {
	if (!req.session.imap) {
		return {error: 'not logged in'};

	} else {
		return {error: false};
	}
}


function has_cookies(req, res) {

	var cookies = req.cookies;
	return function(req, res, callback) {


		try {
			var string = cookies.st;
			var user = cookies.us ? AM.decrypto(req.app.encryptionkey, string, cookies.us) : null;
			var pass = cookies.pa ? AM.decrypto(req.app.encryptionkey, string, cookies.pa) : null;
			var server = cookies.se ? AM.decrypto(req.app.encryptionkey, string, cookies.se) : null;
			var secure = cookies.sec ? AM.decrypto(req.app.encryptionkey, string, cookies.sec) : true;

		} catch(e) {
			res.clearCookie('cookies.us');
			res.clearCookie('cookies.st');
			res.clearCookie('cookies.pa');
			res.clearCookie('cookies.se');
			res.clearCookie('cookies.sec');
			var user,pass,server = null;
			callback(false);
		}



		if (user && pass && server) {
			console.log("cookies are working");
			AM.Login(user, pass, server, secure, function(e, o){
				if (!o){
					callback(false);
				} else {
					callback(o);
				}
			});
		} else {
			callback(false);
		}



	};

}




exports.inbox = function(req, res){

	/* cache a copy 
	new_thread = new Inbox({title: req.body.title, messages: blah});
    new_thread.save();
    */

	var session = has_session(req,res) || {error: false};

	if (session.error) {
		res.send(session);
		return true;		
	}


	var mail = {};
	var folder = 'INBOX';
	var limit = 100;

	var client = inbox.createConnection(false, req.session.imap.server, {
	    secureConnection: req.session.imap.secure ? false : true,
	    auth:{
	        user: req.session.imap.user,
	        pass: req.session.imap.pass
	    }
	});


	client.connect();



	client.on("error", function(error) {
		res.send({error: error}) ;
	});
	client.on("connect", function(){

		if (req.query.folder) {
			folder = req.query.folder;
		}
		if (req.query.limit) {
			limit = req.query.limit;
		}
	    client.openMailbox(folder, req.app.imap.options, function(error, info){
	        if(error) { 
	        	console.log("inbox: " + error);
	        	res.send({error: error}) ;
	        }
	        client.listMessages(-parseFloat(limit), function(err, messages){
	        	if (err) {
	        		res.send({error: error});
	        	}
	        	if (messages) {
	        		messages.reverse();
	        	}
	        	res.send( messages);
	        	client.close();
				console.log('closed inbox');
	        });


	    });
	});


};

exports.mailboxes = function(req,res) {

	var session = has_session(req,res) || {error: false};

	if (session.error) {
		res.send(session);
		return true;		
	}

	var client = inbox.createConnection(false, req.session.imap.server, {
	    secureConnection: req.session.imap.secure ? false : true,
	    auth:{
	        user: req.session.imap.user,
	        pass: req.session.imap.pass
	    }
	});

	client.connect();

	client.on("connect", function(){

		client.listMailboxes(function(error, mailboxes){
	        if(error) { 
	        	console.log("mailbox: " + error);
	        	res.send({error: error}) ;
	        }
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

exports.login = function(req,res) {
	res.send({error:'error'});
	//req.session.imap = { username : '', password: '', server: ''};
}


exports.body = function(req, res) {

	var session = has_session(req,res) || {error: false};

	if (session.error) {
		res.send(session);
		return true;		
	}


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


	var client = inbox.createConnection(false, req.session.imap.server, {
	    secureConnection: req.session.imap.secure ? false : true,
	    auth:{
	        user: req.session.imap.user,
	        pass: req.session.imap.pass
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


