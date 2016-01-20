console.log('\'Allo \'Allo! Content script');

var count = 0;
var count2 = 0;
var timeWatched = '00:00';
var videosMap = {};
var channelNameLink = {};
var localStorageDownload;
var port;
var lastPoint;


// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp('href=\"/watch\\?v=.[^\"]{0,40}');
var channelLink = new RegExp('href=\"/\(user\|channel\)/.[^\"]{1,40}');
var channelName = new RegExp('\">.{1,150}</a>');
var titleName = new RegExp('title=\".[^\"]{0,}');// Checks for links like https://www.youtube.com/embed/0B0112bvG1s
var duration = new RegExp('- Duration: [0-9]{0,3}:{0,1}[0-9]{0,2}:{0,1}[0-9]{0,2}.');

getLocalStorage();
//clickPlanet();


function getLocalStorage(){
	var firstRun;
	alert('sending inital message');
	//send message to backroundpage to get localstorage object

	port = chrome.runtime.connect({name: 'contentConv'});
	port.postMessage({map: 'getLocalStorage'});

	port.onMessage.addListener(function(msg){
		if(msg.answer === null ){
			firstRun = true;
			clickPlanet(firstRun);
		}else{
			firstRun = false;
			localStorageDownload = JSON.parse(msg.answer);
			clickPlanet(firstRun);
		}


		});
	}


function clickPlanet(firstRun) {
		var num = 0;
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
			}
			if( num % 50 === 0){
        for (var i = 0; i < pictures.length; i++){
               pictures[i].style.display = 'none';
             }
           }
		}else if (number === 0 || oldHistory === true){
			//once end of page reached search
			clearInterval(timer);
			alert('starting search');
			pictures = document.getElementsByClassName('yt-lockup-thumbnail contains-addto');
			for (var x = 0; i < pictures.length; x++) {
				pictures[x].style.display = 'none';
			}
			videosMap = {};
			doSearch(document.body.innerHTML);
			alert('Sending message');
			sendVideoMap();

		}
	};
	var timer = setInterval(checker, 1000);

}

function sendVideoMap(){

	port.postMessage({map: 'sendingVideoMap', values: JSON.stringify(videosMap)});

}


function verifyVideos(){
	var oldVideoCount = 0;
	// first check if new channel, then if channels contain video
	var oldHistory = false;
	firstLoop:
	for(var channel in videosMap){
		if(!(channel in localStorageDownload)){
			//run test again for next 50
			oldVideoCount = 0;
		}else{
			// test if new video from channels
			for(var videoArray in videosMap[channel]){
				for(var localVideoArray in localStorageDownload[channel]){
					if(videoArray[0] !== localVideoArray[0]){
						//run test again for next 50
						oldVideoCount = 0;
					}else{
						oldVideoCount = oldVideoCount + 1;
						alert(oldVideoCount);
						if(oldVideoCount === 50){
							alert('50 in a row');
							oldHistory = true;
							break firstLoop;

						}
					}
				}
			}
		}
	}
	return oldHistory;

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

				addVideo(videoUrl, channelLinks, videoDuration, videoTitle);
				//verifyFirst50Videos();
			//	lastPoint = channeldetailsPostion + channeldetails.length;

				searchString = searchString.substring(channeldetailsPostion + channeldetails.length, searchString.length);

				if(!searchString.match('<h3.{100,}</h3>')){
					break;
				}
		}

		//findMostViewedChannels();

		console.log('exit');
		console.log(' Number Of videos watched: ' + count + ' Hours watched: ' + timeWatched);

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
  var a1 = s1.split(/:/), a2 = s2.split(/:/);
  var v = new Array(parseInt(a1[0]) + parseInt(a2[0]), parseInt(a1[1]) + parseInt(a2[1]));
  return (v[0] + Math.floor(v[1] / 60)) + ':' + v[1] % 60;
}

//Cleans duration
function cleanDuration(durationTime)
{

		durationTime = durationTime.substring(12, durationTime.length - 4);
		if(durationTime.length === 4){
			durationTime = '0'.concat(durationTime);

		}else if (durationTime.length === 1) {
			durationTime = '00:0'.concat(durationTime);

		}else if (durationTime.length === 2){
			durationTime = '00:'.concat(durationTime);
		}
		return durationTime;

}




function cleanChannelName(name)
{
		return name.substring(2, name.length - 4);

}
