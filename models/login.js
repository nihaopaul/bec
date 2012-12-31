var AM = {}; 
var inbox = require("inbox");
var crypto = require("crypto");

module.exports = AM;

// logging in //


AM.Login = function(user, pass, server, secure,  callback)
{
	var client = inbox.createConnection(false, server, {
	    secureConnection: secure,
	    auth:{
	        user: user,
	        pass: pass
	    }
	});

	var data = {};
	data.user = user;
	data.pass = pass;
	data.server = server;
	data.secure = secure;

	client.on("connect", function(){
	    //callback("true", data);
		client.listMailboxes(function(error, mailboxes){
			if (error) {
				console.log('error, something went wrong at listing mailboxes');
				console.log(error);
				callback(error);
			} else {
				if (count(mailboxes)) {
					callback(mailboxes[0].path, data);
				} else {
					callback("INBOX", data);
				}
				
			}
		});


	});

	client.on("error", function(error){
		try{
	  		callback(error);
		} catch (error) {
			console.log('almost crashed at login');
		}
	});
	try {
		client.connect();
	} catch (error) {
		console.log(error); 
	}
	

	
}

AM.Crypto = function(string, key, text) {
	if (!string || !key || !text) { 
		console.log("error in crypto");
		console.log("string: "+ string);
		console.log("key: " +key);
		console.log("text: "+text);
		return false; 
	}
    var cipher = crypto.createCipher("aes192", string + key),
        msg = [];
	msg.push(cipher.update(text, "binary", "hex"));
    msg.push(cipher.final("hex"));
    return msg.join("");
}

AM.decrypto = function(string, key, text){

	if (!string || !key || !text) { 
		return false; 
	}
	var decipher = crypto.createDecipher("aes192", string + key),
        msg = [];
	msg.push(decipher.update(text, "hex", "binary"));
    msg.push(decipher.final("binary"));
    return msg.join("");
}


AM.randomstring = function() {
	try {
	  var buf = crypto.randomBytes(12);
	  return buf.toString('hex');
	} catch (ex) {
	  console.log(ex);
	  return 'notrandom';
	}
}