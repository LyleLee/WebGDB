
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*下面这一行非常重要,并且要放在*/

//app.use(express.bodyParser({ uploadDir: "./public/upload/" }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/users', user.list);
app.post('/upfile',user.postFile);
app.get('/',user.compiler);
app.get('/chat',user.chat);
app.get('/test',user.test);


httpApp = http.createServer(app);
httpApp.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



var work = require('work');//在node_module中的模块(包)不需要添加路径,除此之外需要添加
work.begin(httpApp);
