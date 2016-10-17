'use strict';

const async = require('async');
const fs = require('fs');
const unirest = require('unirest');

const DATA_DIR = "./data";
const AWAKENINGS_DATA_DIR = "./data/star-wars-destiny/sets/awakenings";

const WEB_APP_URL = "https://fsxz0udkr1.execute-api.eu-central-1.amazonaws.com/dev/card";

var self = this;

async.waterfall([
    _loadCardsFromDataDirectory,
    _processCards
  ], function (err, res) {
  console.log("Loaded a total of [%s] cards.", numberLoaded);
});

function _processCards(cardFilePaths, callback) {
  for (var j = 0; j < cardFilePaths.length; j++) {
    var cardFilePath = cardFilePaths[j];

    fs.readFile(cardFilePath, 'utf8', function (err, data) {
      if (err) {
        throw err; // we'll not consider error handling for now
      } else {
        var card = JSON.parse(data);
        if (card.code && card.name) {
          console.log("Uploading [%s] with name [%s]", card.code, card.name);
          var cardUrl = WEB_APP_URL + "/" + card.code;
          console.log("Attempting a GET of [%s]", cardUrl);

          unirest.get(cardUrl)
            .end(function (response) {
              if (response.statusCode === 404) {
                // send a POST
                console.log("Will send a POST");
              } else {
                // send a PUT
                console.log("Will send a PUT");
              }
            });
        }
      }
    });
  }
}

function _loadCardsFromDataDirectory(callback) {
  var cardFilePaths = [];

  fs.readdir(AWAKENINGS_DATA_DIR, function (err, gameDirectories) {
    if (err) {
      console.log("Please run via \"node scripts/seed\" from the root directory.")
    } else {
      for (var i = 0; i < gameDirectories.length; i++) {
        console.log("Found card file [%s]", AWAKENINGS_DATA_DIR + "/" + gameDirectories[i]);
        cardFilePaths.push(AWAKENINGS_DATA_DIR + "/" + gameDirectories[i]);
      }
      callback(null, cardFilePaths);

      // for(var i = 0; i < gameDirectories.length; i++) {
      //   var gameDirectory = gameDirectories[i];
      //   console.log("Discovered the game [%s]", gameDirectory);
      //   fs.readdir(DATA_DIR + "/" + gameDirectory, function(err, gameSubDirectories) {
      //     if(!err) {
      //       gameSubDirectories.forEach(function(gameSubDirectory) {
      //         if(gameSubDirectory === "sets") {
      //           fs.readdir(DATA_DIR + "/" + gameDirectory + "/" + gameSubDirectory, function(err, sets) {
      //             if(!err) {
      //               for(var k = 0; k < sets.length; k++) {
      //                 var set = sets[k];
      //                 if(set.endsWith(".json")) {
      //                   console.log("Found the set [%s]", set);
      //                   setFiles.push(DATA_DIR + "/" + gameDirectory + "/" + gameSubDirectory + "/" + set);
      //                 }
      //               };
      //               // todo : This is in the wrong place
      //               callback(null, setFiles);
      //             }
      //           });
      //         }
      //       });
      //     }
      //   });
      // };
    }
  })
}
