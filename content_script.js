var linkFound;
var regResult = false;
var videoIDs = new Array();
var count = 0;
var count2 =  0;
var time_watched = "00:00";
var videos_map ={};
var channel_name_link = {};


// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp("href=\"/watch\\?v=.[^\"]{0,40}");
var channelLink = new RegExp("href=\"/\(user\|channel\)/.[^\"]{1,40}");
var channelName = new RegExp("\">.{1,150}</a>");
var titleName = new RegExp("title=\".[^\"]{0,}");// Checks for links like https://www.youtube.com/embed/0B0112bvG1s
var duration = new RegExp("- Duration: [0-9]{0,3}:{0,1}[0-9]{0,2}:{0,1}[0-9]{0,2}.");


clickPlanet();





function clickPlanet() {
		var num = 0;
		var checker = function(){
		number = document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button").length;
		if( number == 1){
					num = num +1;
					document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button")[0].click();
					var pictures = document.getElementsByClassName("yt-lockup-thumbnail contains-addto");
					if( num % 50 == 0 || num == 1){
						for (var i = 0; i < pictures.length; i ++) {
	    				pictures[i].style.display = "none";
						}
					}
		}else if (number == 0){
			//once end of page reached search
			clearInterval(timer);
			alert("starting search");
			var pictures = document.getElementsByClassName("yt-lockup-thumbnail contains-addto");
			for (var i = 0; i < pictures.length; i ++) {
				pictures[i].style.display = "none";
			}
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
				var channel_Name;
				var channel_Link;
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

						channel_Link = channeldetails.match(channelLink)[0];
						channel_Name = cleanChannelName(channeldetails.match(channelName)[0]);
						channel_name_link[channel_Link] = channel_Name;
					}

					addVideo(videoUrl,channel_Link,videoDuration,video_title);
					//verifyFirst50Videos();

				searchString = searchString.substring(channeldetailsPostion+channeldetails.length,searchString.length);
				if(!searchString.match('<h3.{100,}</h3>')){
					break;
				}
		}

		find_most_viewed_channels();

		console.log("exit");
		alert(" Number Of videos watched: "+count+" Hours watched: "+time_watched);

}


function addVideo(videoUrl,channel_Link,videoDuration,video_title)
{

	 if(!(channel_Link in videos_map)){
		 chan_map = [{videoUrl:{"Length":videoDuration, "Title":video_title}}];
		 videos_map[channel_Link] = chan_map;
		 //videos_map.channel_Link = chan_map;
	 }else{
		 chan_vids = videos_map[channel_Link];
		 chan_vids.push({videoUrl:{"Length":videoDuration, "Title":video_title}});
		 videos_map[channel_Link] = chan_vids;
	 }



}

function find_most_viewed_channels()
{
		var sortable = [];
		for(var video in videos_map)
			sortable.push([video,videos_map[video].length]);
		sortable.sort(function(a,b) {return b[1] - a[1]})

		/*
		for(var link in sortable){
			//console.log(channel_name_link[link[0]]+" Videos watched"+link[1]);
			console.log(link);
			console.log(link[0]);
			console.log(link[1]);
		}*/

		for (var i = 0; i < sortable.length; i++) {
				if(sortable[i][1] >10){
					console.log(channel_name_link[sortable[i][0]]+" channel videos watched "+sortable[i][1]);
				}
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
		return duration;

}




function cleanChannelName(name)
{
		return name.substring(2,name.length-4);

}
