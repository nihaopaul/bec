
var AM = require('../models/login.js');

exports.index = function(req, res){

	var cookies = req.cookies;
	var string, user, pass, server, secure;
	try {
		string = cookies.st;
		user = cookies.us ? AM.decrypto(req.app.encryptionkey, string, cookies.us) : null;
		pass = cookies.pa ? AM.decrypto(req.app.encryptionkey, string, cookies.pa) : null;
		server = cookies.se ? AM.decrypto(req.app.encryptionkey, string, cookies.se) : null;
		secure = cookies.sec ? AM.decrypto(req.app.encryptionkey, string, cookies.sec) : true;

	} catch(e) {
		console.log("cookies error");

		res.clearCookie('cookies.us');
		res.clearCookie('cookies.st');
		res.clearCookie('cookies.pa');
		res.clearCookie('cookies.se');
		res.clearCookie('cookies.sec');
		var user,pass,server = null;
	}



	if (user && pass && server) {
		console.log("cookies are working");
		AM.Login(user, pass, server, secure, function(e, o){
			if (!o){
				res.render('login', { title: 'Free Your Email' });
				res.clearCookie('cookies.us');
				res.clearCookie('cookies.st');
				res.clearCookie('cookies.pa');
				res.clearCookie('cookies.se');
				res.clearCookie('cookies.sec');
			} else {
				req.session.imap = o;
				res.redirect('/#/INBOX');
			}
		});
	} else {
		res.render('login', { title: 'Free Your Email' });
	}

};


exports.post = function(req,res) {

	var secure = req.param('secure') ? req.param('secure') : "true";

	AM.Login(req.param('user'), req.param('pass'), req.param('server'), secure, function(e, o){
		if (!o){
			res.redirect('/login');

		} else {
			req.session.imap = o;

			var string = AM.randomstring();

			res.cookie('st', string, { maxAge: 900000 }); //string

			res.cookie('us', AM.Crypto(req.app.encryptionkey, string, o.user), { maxAge: 900000 }); //user
			res.cookie('pa', AM.Crypto(req.app.encryptionkey, string, o.pass), { maxAge: 900000 }); //password
			res.cookie('se', AM.Crypto(req.app.encryptionkey, string, o.server), { maxAge: 900000 }); //server
			res.cookie('sec', AM.Crypto(req.app.encryptionkey, string, o.secure), { maxAge: 900000 }); //secure

			res.redirect('/#/INBOX');
		}
	});
};
