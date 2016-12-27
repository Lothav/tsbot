/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  fs = require('fs');

var tsbot = require('./tracksale_bot');

var privateKey = fs.readFileSync('../ts.key').toString();
var certificate = fs.readFileSync('../ts.crt').toString();

var options = {
    key: privateKey,
    cert: certificate
};

var port = process.env.PORT || 3000;
var app = express();
var server = https.createServer(options, app).listen(port , function(){
    console.log("Express server listening on port " + port);
}.bind(this));

app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

var TracksaleBot = new tsbot();
var TracksaleConfig = TracksaleBot.getConfig();

if (!(TracksaleConfig.APP_SECRET && TracksaleConfig.VALIDATION_TOKEN && TracksaleConfig.PAGE_ACCESS_TOKEN && TracksaleConfig.SERVER_URL)) {
    console.error("Missing config values");
    process.exit(1);
}

app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === TracksaleConfig.VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

app.post('/webhook', TracksaleBot.TracksaleWebhook.bind(TracksaleBot));

function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', TracksaleConfig.APP_SECRET).update(buf).digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

module.exports = app;

