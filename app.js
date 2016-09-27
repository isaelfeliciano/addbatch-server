'use strict'

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

var getBatch = function(batchNumber, callback) {
  batchNumber = parseInt(batchNumber);
  var myCursor = mongoDbObj.batchCollection.findOne({"batchNumber": batchNumber}, function(err, doc) {
    if(err) {
      console.log("Error getting the batch info");
      return callback(err);
    }
    callback(null, doc);
  });
}

var deleteBatch = function(batchID, callback) {
  let myCursor = mongoDbObj.batchCollection.deleteOne({"id": batchID}, function(err, doc) {
    if (err) {
      return callback(err);
    }
    callback(null, doc);
  });
}


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

app.use('/searchBatch', (req, res) => {
  let batchNumber = req.param('batchid');
  getBatch(batchNumber, (err, data) => {
    if (data === null) {
      return res.json({'msg': 'batch-no-exist'});
    }
    if (err) {
      res.json({'msg': 'error-searching'});
    } else {
      res.send({'msg': 'batch-exist'});
    }
  });
});

app.use('/searchBatchGetJSON', (req, res) => {
  let batchNumber = req.param('batchid');
  console.log(batchNumber);
  getBatch(batchNumber, (err, data) => {
    if (data === null) {
      return res.json({'msg': 'batch-no-exist'});
    }
    if (err) {
      res.json({'msg': 'error-searching'});
    } else {
      res.json(data);
    }
  });
});

app.use("/deleteBatch", (req, res) => {
  let batchID = req.param('batchid');
  console.log(batchID);
  deleteBatch(batchID, (err, data) => {
    if (err) {
      console.log("error-deleting-batch");
      return res.send("error-deleting-batch");
    }
    console.log("batch-deleted");
    res.send("batch-deleted");
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
