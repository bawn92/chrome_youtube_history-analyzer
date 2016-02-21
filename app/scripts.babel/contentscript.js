console.log('\'Allo \'Allo! Content script');

var count = 0;
var count2 = 0;
var timeWatched = '00:00:00';
var newTimeWatched = '00:00:00';
var newCount = 0;
var videosMap = {};
var channelNameLink = {};
var localStorageDownload;
var localStorageStats;
var port;
var lastPoint;
var newVideoMap = {};
var totalViews = 0;
var url;
var userName;
// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp('href=\"/watch\\?v=.[^\"]{0,40}');
var channelLink = new RegExp('href=\"/\(user\|channel\)/.[^\"]{1,40}');
var channelName = new RegExp('\">.{1,150}</a>');
var titleName = new RegExp('title=\".[^\"]{0,}');// Checks for links like https://www.youtube.com/embed/0B0112bvG1s
var duration = new RegExp('- Duration: [0-9]{0,3}:{0,1}[0-9]{0,2}:{0,1}[0-9]{0,2}.');
var viewsRegex = new RegExp('<li>.{0,20}views</li>');
var nameRegex = new RegExp('class="yt-masthead-picker-name" dir="ltr">.{0,50}</div>');
var imageURL = new RegExp('src="https://.*jpg');
var searchOnGoing = false;


getLocalStorage();
//clickPlanet();


function getLocalStorage(){



	var firstRun;
	//send message to backroundpage to get localstorage object

	port = chrome.runtime.connect({name: 'contentConv'});
	port.postMessage({map: 'getLocalStorage'});
	window.onbeforeunload = function(event) {
			if(searchOnGoing){
				event.returnValue = 'If you leave the Youtube History page now the application will not finish';
				console.log(event.returnValue);
			}
	};

	window.onunload = function(event){
			port.postMessage({map: 'updateState', values: '0'});
	}


	port.onMessage.addListener(function(msg){
		if(msg.answer === null ){
			searchOnGoing = true;
			firstRun = true;
			clickPlanet(firstRun);
		}else if (msg.answer !== null){
			firstRun = false;
			searchOnGoing = true;
			localStorageDownload = JSON.parse(msg.answer);
			localStorageStats = JSON.parse(msg.details);
			clickPlanet(firstRun);
		}
		});



	}


function clickPlanet(firstRun) {
		var num = 0;
		url = getImageUrl();
		userName = getUserName();
		var checker = function(){
			var number = document.getElementsByClassName('yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button').length;
	    var pictures;
			var oldHistory;
			if( number === 1){
				num = num + 1;
				document.getElementsByClassName('yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button')[0].click();
				pictures = document.getElementsByClassName('yt-lockup-thumbnail contains-addto');
				if(!firstRun & num === 6){
					//verify if any of first 100 videos are not in localstoge stop

					doSearch(document.body.innerHTML);
					oldHistory = verifyVideos();
					// need to edit totla count varaibles etc before sending to local stoarge
					if(oldHistory === true){
						clearInterval(timer);
						var tmpTime = timeAdd(localStorageStats[1],newTimeWatched);
						var tmpCount = newCount + localStorageStats[0];

						var tmpArray = [tmpCount,tmpTime,totalViews,url,userName];
						port.postMessage({map: 'stats', values: JSON.stringify(tmpArray)});
						port.postMessage({map: 'sendingVideoMap', values: JSON.stringify(localStorageDownload)});
						port.postMessage({map: 'updateState', values: '0'});
						searchOnGoing = false;
					}

				}
				if( num % 50 === 0 || num === 8){
	        for (var i = 0; i < pictures.length; i++){
	               pictures[i].style.display = 'none';
	             }
	           }

			}else if (number === 0 ){
				//once end of page reached search
				clearInterval(timer);
				pictures = document.getElementsByClassName('yt-lockup-thumbnail contains-addto');
				for (var x = 0; i < pictures.length; x++) {
					pictures[x].style.display = 'none';
				}
				videosMap = {};
				timeWatched = '00:00:00';
				count = 0;
				totalViews = 0;
				doSearch(document.body.innerHTML);

				sendDetails();

			}
	};
	var timer = setInterval(checker, 1000);

}

function sendDetails(){
	console.log(' Number Of videos watched: ' + count + ' Hours watched: ' + timeWatched);
	port.postMessage({map: 'stats', values: JSON.stringify([count,timeWatched, totalViews, url,userName])});
	port.postMessage({map: 'sendingVideoMap', values: JSON.stringify(videosMap)});
	port.postMessage({map: 'updateState', values: '0'});
	searchOnGoing = false;
	location.reload();
}

function getUserName(){
	var doc = document.body.innerHTML;
	name = doc.match(nameRegex)[0];

	name = name.substring(42, name.length - 6);
	return name;
}


function getImageUrl(){
	var doc = document.body.innerHTML;
	name = doc.match(imageURL)[0];
	name = name.substring(5, name.length);
	return name;
}

function verifyVideos(){
	var oldVideoCount = 0;
	// first check if new channel, then if channels contain video
	var oldHistory = false;
	var newNumberhours = '00:00:00';
	firstLoop:
	for(var channel in videosMap){

		if(!(channel in localStorageDownload)){
			//run test again for next 50
			oldVideoCount = 0;
			//add to map
			localStorageDownload[channel] = videosMap[channel];

			for(var i = 0; i < videosMap[channel].length; i++){
				newCount = newCount + 1;
				newTimeWatched = timeAdd(newTimeWatched,videosMap[channel][i][2]);
			}
		}else{
			// test if new video from channels
			for(var x = 0; x < videosMap[channel].length; x++){
				var channelVideoArray = [];
				for(var y = 0; y < localStorageDownload[channel].length; y ++){
					channelVideoArray.push(localStorageDownload[channel][y][0]);
					//need to generate array of videos urls
				}
					//console.log(channelVideoArray);
				//	console.log(videosMap[channel][x][0]);


					if(channelVideoArray.indexOf(videosMap[channel][x][0]) > -1){


						oldVideoCount = oldVideoCount + 1;
						if(oldVideoCount >= 50){
							oldHistory = true;
							break firstLoop;
						}
					}else{
						//run test again for next 50
						oldVideoCount = 0;
						//add to video to map, check if channel exits and create if it dosent
						newCount = newCount + 1;
						newTimeWatched = timeAdd(newTimeWatched,videosMap[channel][x][2]);
						localStorageDownload[channel].push(videosMap[channel][x]);

					}
			}
		}
	}
return oldHistory;
}

function accumlateNewVideoDetails(videoDetails){


}

function findMostViewedChannels()
{
		var sortable = [];
		for(var video in videosMap){
			sortable.push([video, videosMap[video].length]);
    }
		sortable.sort(function(a, b) {return b[1] - a[1]});

		/*
		for(var link in sortable){
			//console.log(channelNameLink[link[0]]+" Videos watched"+link[1]);
			console.log(link);
			console.log(link[0]);
			console.log(link[1]);
		}*/
		// 73:28 -- 74:43 -- 76:28

		for (var i = 0; i < sortable.length; i++) {
				if(sortable[i][1] > 10){
					console.log(channelNameLink[sortable[i][0]] + ' channel videos watched ' + sortable[i][1]);
				}
		}

}



function doSearch(searchString)
{
		Object.size = function(obj) {
				var size = 0, key;
				for (key in obj) {
						if (obj.hasOwnProperty(key)){
              size++;
            }
				}
				return size;
		};


		//search for title name, link and video length
		while(searchString.match('<h3.{100,}</h3>')[0]){

				var h3tag = searchString.match('<h3.{100,}</h3>')[0];
				var channelNames;
				var channelLinks;
				var videoUrl;
				var videoDuration;
				var videoTitle;




				//verify h3 tags contain information we need to extract
				if(h3tag.search(titleName) !== -1 && h3tag.search(hrefLink) !== -1 && h3tag.search(duration) !== -1){
					count = count + 1;
					timeWatched = timeAdd(timeWatched, cleanDuration(h3tag.match(duration)[0]));
					videoUrl = h3tag.match(hrefLink)[0];
					videoDuration = cleanDuration(h3tag.match(duration)[0]);
					videoTitle = h3tag.match(titleName)[0];
					totalViews = totalViews + cleanViews(searchString.match(viewsRegex)[0]);

				}else {
					count2 = count2 + 1;
				}

				//search for div tag containing channel link and name
				var channeldetailsPostion = searchString.search('<div class="yt-lockup-byline">.{0,}</div>');

				var channeldetails = searchString.match('<div class="yt-lockup-byline">.{0,}</div>')[0];
				if(channeldetails !== null){

					channelLinks = channeldetails.match(channelLink)[0];
					channelNames = cleanChannelName(channeldetails.match(channelName)[0]);
					channelNameLink[channelLinks] = channelNames;
				}

				addVideo(videoUrl, channelLinks + ':::' + channelNames, videoDuration, videoTitle);
				//verifyFirst50Videos();
			//	lastPoint = channeldetailsPostion + channeldetails.length;

				searchString = searchString.substring(channeldetailsPostion + channeldetails.length, searchString.length);

				if(!searchString.match('<h3.{100,}</h3>')){
					break;
				}
		}

		//findMostViewedChannels();


}


function addVideo(videoUrl, channelLinks, videoDuration, videoTitle)
{

  var chanMap = {};
  var chanVids = [];
  if(!(channelLinks in videosMap)){
		var inner = [];
		inner.push(videoUrl);
		inner.push(videoTitle);
		inner.push(videoDuration);
		chanVids.push(inner);
    videosMap[channelLinks] = chanVids;
  }else{
		var countChanVids = 0;
		chanVids = videosMap[channelLinks];
		inner = [];
		inner.push(videoUrl);
		inner.push(videoTitle);
		inner.push(videoDuration);
		for(var video in chanVids){
			if(video[0] !== videoUrl){
				countChanVids = countChanVids +1;
			}
		}
		if(countChanVids === chanVids.length){
			chanVids.push(inner);
		}
		videosMap[channelLinks] = chanVids;
  }



}




//adding two times, hours and minutes only
function timeAdd(s1, s2)
{
	var sec = toSeconds(s1) + toSeconds(s2);
	return fill(Math.floor(sec / 3600), 2) + ':' +
		fill(Math.floor(sec / 60) % 60, 2) + ':' +
		fill(sec % 60, 2);
}


function toSeconds(s){
	var p = s.split(':');
	return (parseInt(p[0]) * 3600) + (parseInt(p[1]) * 60) + parseInt(p[2]);
}

function fill(s, digits){
	s = s.toString();
	while (s.length < digits) s = '0' +s;
	return s;
}

//Cleans duration
function cleanDuration(durationTime)
{

		durationTime = durationTime.substring(12, durationTime.length - 1);
		if (durationTime.length === 1) {
			durationTime = '00:00:0'.concat(durationTime);

		}else if (durationTime.length === 2){
			durationTime = '00:00:'.concat(durationTime);
		}else if (durationTime.length === 4){
			durationTime = '00:0'.concat(durationTime);
		}else if (durationTime.length === 5){
			durationTime = '00:'.concat(durationTime);
		}else if(durationTime.length === 7){
			durationTime = '0'.concat(durationTime);
		}
		return durationTime;

}


function cleanViews(viewsString){

		viewsString = viewsString.substring(4, viewsString.length - 11);
		return parseInt(viewsString.replace(/,/g, ''));

}



function cleanChannelName(name)
{
		return name.substring(2, name.length - 4);

}
