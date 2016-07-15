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

app.get('/', function (req, res) {
  if ('url' in req.headers) {
    getNotes(req.headers, res)
  } else if ('url' in req.query) {
    getNotes(req.query, res)
  }
});

app.post('/', function (req, res) {
  if (req.body.api == 'post') {
    setNotes(req.body, res);
  } else if (req.body.api == 'delete') {
    killNotes(req.body, res);
  }
});

var getNotes = function(data, res) {
  MongoClient.connect(url, function(err, db) {
    var cursor = db.collection('devnotes').find({
      "url": data.url
    }).toArray(function(err, result){
      // return results;
      res.send(result);
    });
    console.log("Retrived devnotes for " + data.url);
  });
}

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
         console.log("Saved a devnote");
         res.send("saved");
      }
    );
  });
}

var killNotes = function(data, res) {
  MongoClient.connect(url, function(err, db) {
    db.collection('devnotes').deleteOne({
      "id": data.id
    }, function(err, results) {
       assert.equal(err, null);
       console.log("Deleted a devnote");
       res.send("deleted");
    });
  });
}