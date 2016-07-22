var express = require('express'),
    app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var mongourl = process.env.MONGO_URL || 'mongodb://localhost:27017/devnotes';
var collection;
MongoClient.connect(mongourl, function(err, db) {
  collection = db.collection('devnotes');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('App listening on port ' + port);
});

/**
 * Listens for GET requests from extention
 */
app.get('/page/:urlhash', function (req, res) {
  console.log(req.params);
  assert.ok(req.params.urlhash);
  collection.find({
    "urlhash": req.params.urlhash
  }).toArray(function(err, result){
    console.log(result);
    res.send(result); // return results
  });
});

/**
 * Listens for POST requests from extention
 */
app.put('/page/:urlhash/note/:noteid', function (req, res) {
  collection.update({
    urlhash: req.params.urlhash,
    timestamp: req.params.noteid
  }, {
    urlhash: req.params.urlhash,
    timestamp: req.params.noteid,
    top: req.body.top,
    left: req.body.left,
    text: req.body.text
  }, {
    upsert: true
  }, function(err, count, result) {
    assert.equal(err, null);
    res.send({success: true});
  });
});

app.delete('/page/:urlhash/note/:noteid', function(req, res) {
  collection.deleteOne({
    urlhash: req.params.urlhash,
    timestamp: req.params.noteid
  }, function(err, results) {
    assert.equal(err, results);
    res.send({success: true});
  });
});

