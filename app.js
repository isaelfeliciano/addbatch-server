var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var mongoDbObj;
var assert = require('assert');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// DB Setup
MongoClient.connect('mongodb://localhost:27017/addbatch', function(err, db) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("Connected to DB");
    mongoDbObj = {db: db,
      batchCollection: db.collection('batchCollection')
    }
  }
});

var insertDocument = function(filter, doc, callback) {
  mongoDbObj.batchCollection.updateOne(filter, 
    {$set: doc}, 
    {upsert: true},
    function (err, result){
      callback(err, result);
    });
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', routes);
app.use('/users', users);


app.use('/saveBatchAndPrint', (req, res) => {
    console.log(req.body);
  insertDocument({'id': req.body.id}, req.body, (err, result) => {
    if (err) {
      console.log(err);
      res.json({'msg': 'error-saving'})
    } else {
      console.log('Batch saved to DB');
      res.json({'msg': 'saved'});
    }
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
  message: err.message,
  error: {}
  });
});


module.exports = app;
