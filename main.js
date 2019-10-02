var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression')
var helmet = require('helmet')
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');

app.use(helmet())
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compression());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))
app.use(flash());

app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to req.flash().
  req.flash('info', 'Flash is back!')
  res.send('flash');
});

app.get('/flash-display', function(req, res){
  // Get an array of flash messages by passing the key to req.flash()
  var fmsg = req.flash();
  res.send(fmsg); 
});

var passport = require('./lib/passport')(app);

app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

 
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
app.listen(3000, function(){
  console.log('connected on port 3000')
});
