module.exports = function(app, express) {
	var config = this;
  
   app.configure(function () {

   		app.imap = {};
      app.encryptionkey = "this is my cipherstring yes!";
   app.imap.options = {};
   app.imap.options.readOnly = true;
   app.imap.options.debug = true;
       // app.use(express.logger());
//	   
	   
	//   app.use(passport.initialize());
	//   app.use(passport.session());
    });
   return config;
};
