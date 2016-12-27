var TracksaleMessage = require("./TracksaleMessage");
var TracksaleUser = require("./TracksaleUser");
var TracksaleConfig = require("./TracksaleConfig");

var TracksaleBot = function(){

    /**
     * @private
     * @property {TracksaleMessage} - message object
     * */
    this._message = new TracksaleMessage();

    /**
     * @private
     * @property {TracksaleUser[]} - _users on conversation
     * */
    this._users = [];

    /**
     * @private
     * @property {TracksaleConfig} - _config envs
     * */
    this._config = TracksaleConfig;
};

TracksaleBot.prototype.TracksaleWebhook = function (req, res) {

    var data = req.body;

    if (data.object == 'page') {
        data.entry.forEach(function(pageEntry) {
            pageEntry.messaging.forEach(function(messagingEvent) {
                this.addUser(messagingEvent.sender.id);

                var user_i = null;
                this._users.forEach(function(u, i){
                    if(u.getId() == messagingEvent.sender.id){
                        user_i = i;
                    }
                });
                if(user_i !== null){
                    this._message.receivedMessage(messagingEvent, this._users[user_i]);
                }
            }.bind(this));
        }.bind(this));
        res.sendStatus(200);
    }
};

TracksaleBot.prototype.addUser = function(id){
    var new_user = true;
    this._users.forEach(function(u, i) {
        if(this._users[i].getId() == id){
            new_user = false;
        }
    }.bind(this));
    if(new_user) {
        this._users.push(new TracksaleUser(id));
    }
};

TracksaleBot.prototype.getConfig = function () {
    return this._config;
};

TracksaleBot.prototype.constructor = TracksaleBot;

module.exports = TracksaleBot;