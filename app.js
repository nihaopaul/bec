
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , email = require('./routes/email')
  , http = require('http')
  , path = require('path');


var app = express();
var config = require('./config')(app);


var mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://localhost/inbox')
  , Inbox = require('./models.js').Inbox(db);


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'miao'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/api/inbox', email.inbox);
app.get('/api/body', email.body);
app.get('/api/mailboxes', email.mailboxes);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
