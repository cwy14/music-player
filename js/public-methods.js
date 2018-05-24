function getByClass(parent,clsName){
	var results = new Array();
	var elements = parent.getElementsByTagName('*');
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].className == clsName) {
			results.push(elements[i]);
		}
	}
	return results;
}

function getStyle(element,attr) {
	if(element.currentStyle){
		return element.currentStyle[attr];
	}else{
		return getComputedStyle(element,false)[attr];
	}
}

function addEvent(ele,type,hander){
    // 执行代码
    if (ele.addEventListener) {
     ele.addEventListener(type,hander,false);
    } else if (ele.attachEvent) {
     ele.attachEvent("on"+type,hander);
    } else {
     ele["on"+type] = hander;
    }  
}

function removeEvent(ele,type,handle) {
	if (ele.removeEventListener) {
		ele.removeEventListener(type,handle,false);
	} else if (ele.deattachEvent) {
		ele.deattachEvent("on"+type,handle);
	} else {
		ele["on"+type] = null;
	}
}

function stopPropagating(event){
	if(event.stopPropagation){
		event.stopPropagation();
	}else{
		event.cancelBubble=true;
	}
}