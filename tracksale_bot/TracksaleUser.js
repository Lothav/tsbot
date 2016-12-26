var TracksaleUser = function(id){
    this._id = id;
    this.message_counter = 0;
};
TracksaleUser.prototype.getId = function(){
    return this._id;
};
TracksaleUser.prototype.constructor = TracksaleUser;

module.exports = TracksaleUser;