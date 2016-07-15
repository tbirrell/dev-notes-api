var express = require('express'),
    app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/devnotes';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, function(){
  console.log('App listening on port 5000!');
});

/**
 * Listens for GET requests from extention
 */
app.get('/', function (req, res) {
  if ('url' in req.headers) { //verify url was sent
    getNotes(req.headers, res)
  } else if ('url' in req.query) { //check backup location incase its being wierd
    getNotes(req.query, res)
  }
});

/**
 * Listens for POST requests from extention
 */
app.post('/', function (req, res) {
  if (req.body.api == 'post') { //check if insert/update
    setNotes(req.body, res);
  } else if (req.body.api == 'delete') { //check if delete
    killNotes(req.body, res);
  }
});

/**
 * Gets notes from DB and sends to extention
 */
var getNotes = function(data, res) {
  MongoClient.connect(url, function(err, db) {
    var cursor = db.collection('devnotes').find({
      "url": data.url
    }).toArray(function(err, result){
      res.send(result); // return results
    });
    console.log("Retrived devnotes for " + data.url); //log action in terminal
  });
}

/**
 * Insert or update note in DB
 */
var setNotes = function(data, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('devnotes').update(
      {
        "id" : data.id
      },
      {
        "id" : data.id,
        "topval" : data.top,
        "leftval" : data.left,
        "textval" : data.text,
        "url" : data.url,
      },
      {
        "upsert" : true
      }, function(err, count, result) {
         assert.equal(err, null);
         console.log("Saved a devnote"); //log action in terminal
         res.send("saved"); //send response to extention
      }
    );
  });
}

/**
 * Delete Note from DB
 */
var killNotes = function(data, res) {
  MongoClient.connect(url, function(err, db) {
    db.collection('devnotes').deleteOne({
      "id": data.id
    }, function(err, results) {
       assert.equal(err, null);
       console.log("Deleted a devnote"); //log action in terminal
       res.send("deleted"); //send response to extention
    });
  });
}