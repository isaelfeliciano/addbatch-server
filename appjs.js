var MongoClient = require('mongodb').MongoClient;
var mongoDbObj;
var assert = require('assert');

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
