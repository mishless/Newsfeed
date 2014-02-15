/**
 * Created by daniel on 2/12/14.
 */
function feedContainer(size){
	function getSize(){
		return size;
	}
	var ptr = 0;
	var data = new Array();
	function nextPtr(){
		if(++ptr >= size)
			ptr = 0;
		return ptr;
	}
	this.insert = function(elem){
		if(data.length >= size){
			data[ptr].remove();
		}
		data[ptr] = elem;
		ptr = nextPtr();
	}
	return this;
}
var container = feedContainer(20);
var socket = io.connect('http://localhost:3000');
var elements = 0;
function addFeed(data,top){
	elements++;
	var content = data.content;
	if(data.deleted)
		content = "Deleted...";
	var imgSrc = data.user.imgThumbPath ? data.user.imgThumbPath : '/images/no-image-small.png';
	var feed = $("<div class='feed'> \
                <a href='/profile?id= " + data.user.id + "'> \
                    <img src ='"+ imgSrc +"'/>\
                    <h2> " + data.user.firstname + " " + data.user.lastname + "</h2> </a> \
                    <p> " + content + " \
                        <p><a href = '/like'> Like </a></p> \
                        <hr> \
                    </p> \
                </div>");
	container.insert(feed);
	$('#messageSection').children("#feeds").append(feed);

}
socket.on('init', function(){
	getFeeds(0,blockedUsers);
});
socket.on('feeds', function (dataArr) {
	dataArr.reverse();
	dataArr.forEach(function(data){
		addFeed(data);
	});
});
socket.on('feed', function(data,user){
	data.user = user;
	addFeed(data,true);
});
socket.on('error', function(error){
	alert(error);
});
function sendFeed(user,content){
	socket.emit('sendFeed', user, content);
}
function getFeeds(skip){
	socket.emit('getFeeds', skip, blockedUsers);
}
