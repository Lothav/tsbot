var request = require('request'),
    config = require('config');

const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
    (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
    config.get('pageAccessToken');

var TracksaleMessage = function(){};

TracksaleMessage.prototype.receivedMessage = function(event, user) {
    var senderID = user.getId();
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    if(message !== undefined){
        console.log("Received message for user %d and page %d at %d with message:",
            senderID, recipientID, timeOfMessage);
        console.log(JSON.stringify(message));

        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;

        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;

        if (isEcho) {
            // Just logging message echoes to console
            console.log("Received echo for message %s and app %d with metadata %s",
                messageId, appId, metadata);
            return;
        } else if (quickReply) {
            var quickReplyPayload = quickReply.payload;

            switch (quickReplyPayload){
                case "HIT_YES":
                    user.setMessageCounter(1);
                    break;
            }

            console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
            messageText = true;
        }

        if (messageText) {
            var msg = "Olá abiguinho!";
            switch (user.getMessageCounter()){
                case 0:
                    msg = "Oler";
                    sendTextMessage(senderID, msg);
                    break;
                case 1:
                    msg = "Em que posso te ajudar?";
                    sendTextMessage(senderID, msg);
                    break;
                case 2:
                    msg = "Entre em contato com dev@tracksale.co";
                    sendTextMessage(senderID, msg);
                    break;
                case 3:
                    msg = "Mais alguma dúvida?";
                    sendQuickReply(senderID, msg);
                    break;
                case 4:
                    sendButtonMessage(senderID);
                    break;
                case 5:
                    msg = "Deixe um comentário:";
                    sendTextMessage(senderID, msg);
                    break;
                case 6:
                    msg = "Obrigado :V";
                    sendTextMessage(senderID, msg);
                    user.setMessageCounter(0);
                    break;
            }
            user.incrementMessageCounter();
        } else if (messageAttachments) {
            sendTextMessage(senderID, "Message with attachment received");
        }
    }
};


TracksaleMessage.prototype.constructor = TracksaleMessage;
module.exports = TracksaleMessage;

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
}

function sendButtonMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Em uma escala de 0 a 10, o quanto você indicaria a Tracksale a um amigo ou familiar?",
            quick_replies: []
        }
    };

    for (var i = 0; i <= 10; i++) {
        messageData.message.quick_replies.push({
            "content_type" : "text",
            "title": i,
            "payload" : "NPS_" + i
        });
    }
    callSendAPI(messageData);
}

function sendQuickReply(recipientId, msg) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: msg,
            quick_replies: [
                {
                    "content_type":"text",
                    "title": "Sim",
                    "payload":"HIT_YES"
                },
                {
                    "content_type":"text",
                    "title":"Não",
                    "payload":"HIT_NO"
                }
            ]
        }
    };

    callSendAPI(messageData);
}


function callSendAPI(messageData) {

    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s", recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}
