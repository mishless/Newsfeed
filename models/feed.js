/**
 * Created by daniel on 2/3/14.
 */
var mongoose = require("mongoose");
var user = require("../models/user");

exports.getAllFeeds  = function(callback){
    var message = mongoose.model("feed");
    message.find().populate("user").exec( function(error, result){
        if(error){
            callback(error);
        }
        else{
            callback(null, result);
        }
    });
};
exports.getFirstNFeeds = function(count, callback){
    var feed = mongoose.model("feed");
    feed.find({},{},{limit:count, sort:{creationDate:-1}}).populate("user").exec(function(error, result){
        if(error){
            callback(error);
        }
        else{
            callback(null, result);
        }
    });
}
exports.getNextNFeeds = function(count, skip, callback){
    var feed = mongoose.model("feed");
    feed.find({},{},{limit:count,skip:skip, sort:{creationDate:-1}}).populate("user").exec(function(error, result){
        if(error){
            callback(error);
        }
        else{

            callback(null, result);
        }
    });
}
exports.getNextNFeedsWithoutBlocked = function(count, skip, blocked, callback){
	var feed = mongoose.model("feed");
	feed.find({user:{$nin:blocked}},{},{limit:count,skip:skip, sort:{creationDate:-1}}).populate("user").exec(function(error, result){
		if(error){
			callback(error);
		}
		else{

			callback(null, result);
		}
	});
}
exports.addFeed = function(data, callback){
    if(data && data.content && data.user){
        var feed = mongoose.model("feed");
        var newFeed = new feed({
            content:data.content,
            user:data.user,
            creationDate:new Date()
        });
        newFeed.save(function(error){
            if(error){
                console.log(error);
                callback(error)
            }
            else{
                callback(null,newFeed);
            }
        })
    }
	else{
	    callback("Invalid argument");
    }
}

exports.getAllFeedsFromUserById  = function(userId, callback){
    var message = mongoose.model("feed");
    message.find({user: userId}).populate("user").exec( function(error, result){
        if(error){
            callback(error);
        }
        else{
            callback(null, result);
        }
    });
};
