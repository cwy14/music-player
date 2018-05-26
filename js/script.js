window.onload = function () {
	var audio = document.getElementsByTagName('audio')[0];
	var container = document.getElementById('container');
	var songsLists = ["坂本真綾 - 色彩.mp3",
					"茶太 - ？？.mp3",
					"野中藍 - 黒ネコのタンゴ ／ やよゐ.mp3",
					"南里侑香 - 焔の扉.mp3",
					"南里侑香 - 暁の车.mp3"];
	var songIndex = 0;
	var songName = getByClass(document,"song-name")[0];
	var remainTime = getByClass(document,"remain-time")[0];
	var singerInfo = getByClass(document,"singer-info")[0];

	var timeControl = getByClass(container,"time-control")[0];//进度条拖动按钮
	var currentTime = getByClass(container,"current-time")[0];//已播放的进度条
	var controlBar = getByClass(container,"control-bar")[0];//下方控件栏整体
	var controlBarLeft = 0;//控件栏和窗口左边缘的距离
	var totalTime = getByClass(container,"total-time")[0];//进度条
	var totalTimeWidth = totalTime.offsetWidth;//进度条总长度

	var volumeControl = getByClass(container,"volume-control")[0];//音量拖动按钮
	var volume = getByClass(document,"volume")[0];//音量显示、隐藏按钮
	var maxVolume = getByClass(document,"max-volume")[0];//音量条
	var maxVolumeWidth = 0;//音量条总长度
	var maxVolumeLeft = 0;//音量条
	var currentVolume = getByClass(document,"current-volume")[0];//当前音量条

	var playList = getByClass(document,"playlist")[0];
	var mode = getByClass(document,"mode")[0];//切换播放模式
	var modeCode = 0;
	var play = getByClass(document,"play")[0];//开始/暂停
	var prev = getByClass(document,"prev")[0];//上一曲
	var next = getByClass(document,"next")[0];//下一曲
	
	var flag = false;//flag标志用于判断mouseup之前是否触发了拖动按钮的mousedown
	var timer = null;

	init();

	/*
		歌曲加载完成可以播放时,显示控件上方歌曲信息
	*/
	addEvent(audio,"canplay",function () {
		var name = songsLists[songIndex].split(/ - |\./)[1];
		var singer = songsLists[songIndex].split(/ - |\./)[0];
		remainTime.innerHTML = "-"+Math.floor((audio.duration-audio.currentTime)/60)+":"
								+Math.floor((audio.duration-audio.currentTime)%60/10)
								+Math.floor((audio.duration-audio.currentTime)%60%10);
		songName.innerHTML = name+" -- "+singer;
		singerInfo.getElementsByTagName('img')[0].src = "image/"+singer+".jpg";
		singerInfo.getElementsByTagName('span')[0].innerHTML = singer;
	});

	/*
		开始播放时触发事件
	*/
	addEvent(audio,"play",function () {
		currentTimeClock();
		play.getElementsByTagName('i')[0].innerHTML = "&#xe61e;";
		playList.getElementsByTagName('span')[0].innerHTML = "正在播放"+(songIndex+1)+"/"+songsLists.length;
		for (var i = 0; i < getByClass(playList,"name").length; i++) {
			if (i === songIndex) {
				getByClass(playList,"name")[i].style.color = "#fff";
				getByClass(playList,"singer")[i].style.color = "#fff";
			} else {
				getByClass(playList,"name")[i].style.color = "#ccc";
				getByClass(playList,"singer")[i].style.color = "#ccc";
			}
		}
		
	});

	/*
		暂停时触发事件
	*/
	addEvent(audio,"pause",function () {
		clearInterval(timer);
		play.getElementsByTagName('i')[0].innerHTML = "&#xe61d;";
	});

	/*
		播放结束时切歌
	*/
	addEvent(audio,"ended",function () {
		// clearInterval(timer);
		currentTime.style.width = 0;
		timeControl.style.left = 0;
		if (modeCode === 0) {
			/*
				列表循环
			*/
			if (songIndex === songsLists.length-1) {
				songIndex = 0;
			} else {
				songIndex += 1;
			}
			audioLoad(songIndex);
			audio.play();
		} else if (modeCode === 1) {
			/*
				单曲循环
			*/
			audio.play();
		} else {
			/*
				随机播放
			*/
			var temp = songIndex;
			while(songIndex === temp){
				songIndex = Math.floor(Math.random()*songsLists.length);
			}
			audioLoad(songIndex);
			audio.play();		
		}
	});

	/*
		切换播放模式状态码modeCode
	*/
	addEvent(mode,"click",function () {
		if (modeCode === 2) {
			modeCode = 0;
		} else {
			modeCode += 1;
		}
		switch(modeCode){
			case 0:
				mode.getElementsByTagName('i')[0].innerHTML = "&#xe630;";
				break;
			case 1:
				mode.getElementsByTagName('i')[0].innerHTML = "&#xe631;";
				break;
			default:
				mode.getElementsByTagName('i')[0].innerHTML = "&#xe632;";
		}
	});

	addEvent(play,"click",function () {
		if (audio.paused) {
			audio.play();									
		} else {
			audio.pause();			
		}
	});

	addEvent(prev,"click",function () {
		var isPaused = audio.paused;
		if (songIndex === 0) {
			songIndex = songsLists.length-1;
		} else {
			songIndex -= 1;
		}
		audioLoad(songIndex);
		if (!isPaused) {
			audio.play();
		}
	});

	addEvent(next,"click",function () {
		var isPaused = audio.paused;
		if (modeCode === 2) {
			var temp = songIndex;
			while(songIndex === temp){
				songIndex = Math.floor(Math.random()*songsLists.length);
			}
		} else {
			if (songIndex === songsLists.length-1) {
				songIndex = 0;
			} else {
				songIndex += 1;
			}
		}	
		audioLoad(songIndex);
		if (!isPaused) {
			audio.play();
		}
	});

	addEvent(timeControl,"mousedown",timeMousedownHandle);

	addEvent(totalTime,"mouseover",function (e) {
		e = e || window.event;
		controlBarLeft = controlBar.offsetLeft;
		var targetTime = (e.clientX - controlBarLeft)/totalTimeWidth*audio.duration;
		totalTime.title = Math.floor(targetTime/60)+":"+Math.floor(targetTime%60/10)+Math.floor(targetTime%60%10);
	});

	addEvent(totalTime,"click",function (e) {
		e = e || window.event;
		controlBarLeft = controlBar.offsetLeft;
		var targetTime = (e.clientX - controlBarLeft)/totalTimeWidth*audio.duration;
		audio.currentTime = targetTime;
		timeControl.style.left = e.clientX - controlBarLeft + "px";
		currentTime.style.width = e.clientX - controlBarLeft + "px";
		remainTime.innerHTML = "-"+Math.floor((audio.duration-audio.currentTime)/60)+":"
									+Math.floor((audio.duration-audio.currentTime)%60/10)
									+Math.floor((audio.duration-audio.currentTime)%60%10);
	});

	addEvent(volume,"click",function () {
		if (getStyle(maxVolume,"display") === "none") {
			maxVolume.style.display = "block";
		} else {
			maxVolume.style.display = "none";
		}
	});

	addEvent(volumeControl,"mousedown",volumeMousedownHandle);
	
	function timeMousedownHandle(e) {
		e = e || window.event;
		// flag = flag || true;
		clearInterval(timer);

		//鼠标按下拖动时触发事件
		addEvent(document,"mousemove",timeMousemoveHandle);

		/*
			放开鼠标时根据flag判断是否快进快退,计时器重新启动,进度条前进
		*/
		addEvent(document,"mouseup",function () {
			removeEvent(document,"mousemove",timeMousemoveHandle);
			// if (flag) {
				audio.currentTime = currentTime.offsetWidth/totalTimeWidth*audio.duration;
				if (!audio.paused) {
					currentTimeClock();//只有播放状态下拖动,进度条才会继续前进
				}			
			/*}
			flag = false;*/
		});
	}
	
	function timeMousemoveHandle(e) {
		e = e || window.event;
		var mouseLeft = e.clientX;
		controlBarLeft = controlBar.offsetLeft;
		if (mouseLeft - controlBarLeft < 0) {
			timeControl.style.left = 0 ;
			currentTime.style.width = 0 ;
		} else if (mouseLeft - controlBarLeft > totalTimeWidth){
			timeControl.style.left = "100%";
			currentTime.style.width = "100%";
		} else {
			timeControl.style.left = mouseLeft - controlBarLeft + "px";
			currentTime.style.width = mouseLeft - controlBarLeft + "px";
		}
		remainTime.innerHTML = "-"+Math.floor(audio.duration*(1-currentTime.offsetWidth/totalTimeWidth)/60)+":"
									+Math.floor(audio.duration*(1-currentTime.offsetWidth/totalTimeWidth)%60/10)
									+Math.floor(audio.duration*(1-currentTime.offsetWidth/totalTimeWidth)%60%10);		
		//防止拖动时选中内容导致无法拖动
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); 
	}

	function currentTimeClock() {
		timer = setInterval(function () {
			currentTime.style.width = audio.currentTime/audio.duration*totalTimeWidth + "px";
			timeControl.style.left = audio.currentTime/audio.duration*totalTimeWidth + "px";
			remainTime.innerHTML = "-"+Math.floor((audio.duration-audio.currentTime)/60)+":"
									+Math.floor((audio.duration-audio.currentTime)%60/10)
									+Math.floor((audio.duration-audio.currentTime)%60%10);
		},1000);
	}

	function volumeMousedownHandle(e) {
		e = e || window.event;
		stopPropagating(e);

		addEvent(document,"mousemove",volumeMousemoveHandle);

		addEvent(document,"mouseup",function () {
			removeEvent(document,"mousemove",volumeMousemoveHandle);
		});
	}

	function volumeMousemoveHandle(e) {
		e = e || window.event;
		var mouseLeft = e.clientX;
		maxVolumeLeft = maxVolume.offsetLeft;
		maxVolumeWidth = maxVolume.offsetWidth;
		controlBarLeft = controlBar.offsetLeft;
		/*
			controlBar设置了定位导致maxVolunme.offsetLeft是相对于controlBar的左边缘
			所以要算上controlBar.offset
		*/
		if (mouseLeft - maxVolumeLeft - controlBarLeft < 0) {
			volumeControl.style.left = 0;
			currentVolume.style.width = 0;
		} else if (mouseLeft - maxVolumeLeft - controlBarLeft > maxVolumeWidth) {
			volumeControl.style.left = "100%";
			currentVolume.style.width = "100%";
		} else {
			volumeControl.style.left = mouseLeft - maxVolumeLeft - controlBarLeft + "px";
			currentVolume.style.width = mouseLeft - maxVolumeLeft - controlBarLeft + "px";
		}
		audio.volume = currentVolume.offsetWidth/maxVolumeWidth;
		if (audio.volume === 0) {
			volume.getElementsByTagName('i')[0].innerHTML = "&#xe620;";
		} else {
			volume.getElementsByTagName('i')[0].innerHTML = "&#xe61f;";
		}
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
	}

	function init() {
		audioLoad(0);
		for (var i = 0; i < songsLists.length; i++) {
			getByClass(playList,"name")[i].innerHTML = songsLists[i].split(/ - |\./)[1];
			getByClass(playList,"singer")[i].innerHTML = songsLists[i].split(/ - |\./)[0];
		}
		for (var i = 0; i < getByClass(playList,"name").length; i++) {
			getByClass(playList,"name")[i].i = i;
			addEvent(getByClass(playList,"name")[i],"click",function () {
				songIndex = this.i;
				audioLoad(this.i);
				audio.play();
			});
		}
		// console.log(audio.startDate);		
	}

	function audioLoad(index){
		audio.getElementsByTagName('source')[0].src = "source/"+songsLists[index];
		audio.getElementsByTagName('object')[0].data = "source/"+songsLists[index];
		audio.getElementsByTagName('object')[0].getElementsByTagName('param')[0].src = "source/"+songsLists[index];
		audio.load();
	}
}