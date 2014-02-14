/**
 * Created by daniel on 2/7/14.
 */
function feedContainer(size)
{
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
		if(data.length() >= size){
			data[ptr].remove();
		}
		data[ptr] = elem;
		ptr = nextPtr();
	}

}