/**
 * Created by daniel on 2/7/14.
 */
var user = require('../models/user');
var feed = require('../models/feed');
var mongoose = require("mongoose");
const feedCount = 20;
var ioServer;
exports.createSocketIoServer = function createSocketIoServer(io)
{
	var ioServer = io;
	io.sockets.on('connection', function (socket) {
		socket.emit('init');
		socket.on('getFeeds', function (skip,blockedUsers) {
			var s = parseInt(skip);
			if(!skip||skip <0)
			{
				skip = 0;
			}

			feed.getNextNFeedsWithoutBlocked(feedCount,skip, blockedUsers.split(","), function(err,result){
				if(err){
					socket.emit('error', {error:err});
				}
				else{
					socket.emit('feeds',result);
				}
			})
		});
		socket.on('sendFeed', function(usr, content){
			var u = mongoose.Types.ObjectId(usr);
			user.getUserById(u,function(err,result){
				if(err){
					socket.emit('error',err);
				}
				else{
					feed.addFeed({content:content,user:result},function(error, feed){
						if(error){
							socket.emit('error',error);
						}
						else{
							socket.emit('feed',feed,result);
							socket.broadcast.emit('feed', feed, result);
						}
					})
				}
			});

		});
	});
}
