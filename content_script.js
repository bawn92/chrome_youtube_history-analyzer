var linkFound;
var regResult = false;
var videoIDs = new Array();
var count = 0;
var count2 =  0;
var time_watched = "00:00";
var videos_map ={};

// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp("href=\"/watch\\?v=.[^\"]{0,40}");
var channelLink = new RegExp("href=\"/user/.[^\"]{1,40}");
var channelName = new RegExp("\">.{1,150}</a>");
var titleName = new RegExp("title=\".[^\"]{0,}");// Checks for links like https://www.youtube.com/embed/0B0112bvG1s
var duration = new RegExp("- Duration: [0-9]{0,3}:{0,1}[0-9]{0,2}:{0,1}[0-9]{0,2}.");


clickPlanet();





function clickPlanet() {

	var checker = function(){
		number = document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button").length;
		if( number == 1){
					document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button")[0].click();
		}else if (number == 0){
			//once end of page reached search
			clearInterval(timer);
			alert("starting search");
			doSearch(document.body.innerHTML,'');
			alert("Finished");

		}
	};

	timer = setInterval(checker,1000);

}


function doSearch(searchString, details)
{
		Object.size = function(obj) {
				var size = 0, key;
				for (key in obj) {
						if (obj.hasOwnProperty(key)) size++;
				}
				return size;
		};
		//search for title name, link and video length
		while(searchString.match('<h3.{100,}</h3>')[0]){

				var h3tagPostion = searchString.search('<h3.{100,}</h3>');
				var h3tag = searchString.match('<h3.{100,}</h3>')[0];
				var channelName;
				var channelLink;
				var videoUrl;
				var videoDuration;
				var video_title;

				//verify h3 tags contain information we need to extract
				if(h3tag.search(titleName) != -1 && h3tag.search(hrefLink) != -1 && h3tag.search(duration) != -1){
					count = count+1;
					time_watched = timeAdd(time_watched,cleanDuration(h3tag.match(duration)[0]));
					videoUrl = h3tag.match(hrefLink)[0];
					videoDuration = cleanDuration(h3tag.match(duration)[0]);
					video_title = h3tag.match(titleName)[0];

				}else {
					count2 = count2+1;
				}

					//search for div tag containing channel link and name
					var channeldetailsPostion = searchString.search('<div class="yt-lockup-byline">.{0,}</div>');
					var channeldetails = searchString.match('<div class="yt-lockup-byline">.{0,}</div>')[0];
					if(channeldetails != null){

						channelLink = channeldetails.match(channelLink)[0];
						channelName = cleanChannelName(channeldetails.match(channelName)[0]);
					}

					addVideo(videoUrl,channelLink,videoDuration,video_title);
					//verifyFirst50Videos();

				searchString = searchString.substring(channeldetailsPostion+channeldetails.length,searchString.length);
				if(!searchString.match('<h3.{100,}</h3>')){
					console.log("in break");
					break;
				}
		}



		console.log("exit");
		console.log(Object.size(videos_map));
		alert(" Number Of videos watched: "+count+" Hours watched: "+time_watched);

}


function addVideo(videoUrl,channelLink,videoDuration,video_title)
{

	console.log(channelLink);
	console.log(videoUrl);
	 if(!(channelLink in videos_map)){
		 chan_map = [{videoUrl:{"Length":videoDuration, "Title":video_title}}];
		 videos_map[channelLink] = chan_map;
		 videos_map.channelLink = chan_map;
		console.log(videos_map);
	 }else{
		 chan_vids = videos_map[channelLink];
		 console.log(chan_vids.type);
		 var video = {"Length":videoDuration, "Title":video_title};
		 chan_vids.push({videoUrl:video});
		 videos_map[channelLink] = chan_vids.push({videoUrl:video});
	 }



}


//adding two times, hours and minutes only
function timeAdd(s1,s2)
{
  var a1=s1.split(/:/),a2=s2.split(/:/);
  var v=new Array(parseInt(a1[0])+parseInt(a2[0]),parseInt(a1[1])+parseInt(a2[1]));
  return (v[0]+Math.floor(v[1]/60))+':'+v[1]%60;
}

//Cleans duration
function cleanDuration(duration)
{

		duration = duration.substring(12,duration.length-4);
		if(duration.length == 4){
			duration = "0".concat(duration);

		}else if (duration.length == 1) {
			duration = "00:0".concat(duration);

		}else if (duration.length == 2){
			duration = "00:".concat(duration);
		}


		console.log(duration);
		return duration;

}




function cleanChannelName(name)
{
		return name.substring(2,name.length-4);

}
