var linkedin_client = require('linkedin-js')('32zm8jbtqqp6', 'wLcSHXF8xGcaavOf', 'http://127.0.0.1:3000/li-auth')



exports.people = function(req, res){
 	
 	if (!req.session.token) {
 		console.log("no token, authenticate");
 	//	res.redirect('/li-auth');
 	}


	linkedin_client.apiCall('POST', '/people-search', {
		token: {
	    	oauth_token_secret: req.session.token.oauth_token_secret, oauth_token: req.session.token.oauth_token
		}, search: {
	    	'first-name': 'paul', 'last-name': 'adams'
	 	}
	}, function (error, result) {
	  //res.render('message_sent');
	  console.log(result);
	});


};


exports.auth = function(req,res) {
  linkedin_client.getAccessToken(req, res, function (error, token) {
    // will enter here when coming back from linkedin
    req.session.token = token;

    //res.render('auth');
    //res.render('layout');
    //console.log(token);
    res.redirect('/api/people');
  });

};


