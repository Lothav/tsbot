var TracksaleUser = function(id){
    this._id = id;
    this._message_counter = 0;
};
TracksaleUser.prototype.getId = function(){
    return this._id;
};

TracksaleUser.prototype.getMessageCounter = function(){
    return this._message_counter;
};

TracksaleUser.prototype.incrementMessageCounter = function(){
    this._message_counter++;
};

TracksaleUser.prototype.setMessageCounter = function(message_counter_value){
    this._message_counter = message_counter_value;
};

TracksaleUser.prototype.constructor = TracksaleUser;

module.exports = TracksaleUser;