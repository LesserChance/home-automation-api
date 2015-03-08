// External Modules
var util         = require('util');
var eventEmitter = require('events').EventEmitter;

// App Modules
var config       = require("../../../util/config.js");
var request      = require('../../../util/request');

// Private vars
var api;
var url = "api.steampowered.com";
var friend_was_online = {};

var SteamHost = function () {

};
util.inherits(SteamHost, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
SteamHost.prototype.init = function init() {
    this.getFriendList();
}

SteamHost.prototype.getFriendList = function getFriendList() {
    request
        .perform(url, "/ISteamUser/GetFriendList/v0001/", "GET", {
            key: config.steam_api_key,
            steamid: config.steam_user_id,
            relationship: "friend"
        }, null, null, true)
        .then(function(data) {
            if (data) {
                for (var i = 0, iEnd = data.friendslist.friends.length; i < iEnd; i++) {
                    friend_was_online[data.friendslist.friends[i].steamid] = null;
                }

                // check every 2 minutes
                setInterval(this.getFriendStatus.bind(this), 2 * 60000);
            }
        }.bind(this));
};

SteamHost.prototype.getFriendStatus = function getFriendStatus() {
    request
        .perform(url, "/ISteamUser/GetPlayerSummaries/v0002/", "GET", {
            key: config.steam_api_key,
            steamids: Object.keys(friend_was_online).join(",")
        }, null, null, true)
        .then(function(data) {
            if (data) {
                for (var i = 0, iEnd = data.response.players.length; i < iEnd; i++) {
                    var friend = data.response.players[i],
                        friend_is_online = (friend.personastate == 1);

                    if (friend_was_online[friend.steamid] === null) {
                        friend_was_online[friend.steamid] = friend_is_online;
                    } else {
                        //we had player state, see if it changed
                        if (friend_is_online && !friend_was_online[friend.steamid]) {
                            friend_was_online[friend.steamid] = true;
                            this.emit("friend_signed_on", {friend: friend});
                        } else if (!friend_is_online && friend_was_online[friend.steamid]) {
                            friend_was_online[friend.steamid] = false;
                            this.emit("friend_signed_off", {friend: friend});
                        }
                    }
                }
            }
        }.bind(this));
};


/*****************************************
 * Private Methods                       *
 *****************************************/


module.exports = new SteamHost();