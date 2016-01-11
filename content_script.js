var linkFound;
var regResult = false;
var videoIDs = new Array();
var count = 0;
var count2 =  0;
var time_watched = "00:00";

// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp("href=\"/watch\\?v=.[^\"]{0,40}");
var channel;
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
		while(searchString.match('<h3.{100,}</h3>')[0]){

				var h3tagPostion = searchString.search('<h3.{100,}</h3>');
				var h3tag = searchString.match('<h3.{100,}</h3>')[0];

				//verify h3 tags contain information we need to extract
				if(h3tag.search(titleName) != -1 && h3tag.search(hrefLink) != -1 && h3tag.search(duration) != -1){
					count = count+1;
					console.log(count);
					time_watched = timeAdd(time_watched,cleanDuration(h3tag.match(duration)[0]));

				}else {
					count2 = count2+1;
				}

				searchString = searchString.substring(h3tagPostion+h3tag.length,searchString.length);
				if(!searchString.match('<h3.{100,}</h3>')){
					console.log("in break");
					break;
				}
		}
		console.log("exit");
		alert(" Number Of videos watched: "+count+" Hours watched: "+time_watched);
		//var h3tagPostion = searchString.search('<h3.{100,}</h3>');
		//var h3tag = searchString.match('<h3.{100,}</h3>')[0];




		//alert(h3tag+" length:"+h3tag.length+" postion:"+h3tagPostion+" total:"+searchString.length);
		//verify page has h3 tags
		/*if(h3tag)
		{


				count= count+1;
				//alert('inside');

				//verify h3 tags contain information we need to extract
				//if(h3tag.search(titleName) != -1 && h3tag.search(hrefLink) != -1 && h3tag.search(duration) != -1){
					//alert(h3tag.match(hrefLink));
					//alert(h3tag.match(titleName));
					//alert(h3tag.match(duration));
				//}

				/*

				if(){

					alert(h3tag.substring(h3tag.search(hrefLink),h3tag.search(hrefLink)+100))
				}

				if(){

					alert(h3tag.substring(h3tag.search(hrefLink),h3tag.search(hrefLink)+100))
				}
				var newSearchString = searchString.substring(h3tagPostion+h3tag.length,searchString.length);
				doSearch(newSearchString,'');
		}
		*/
}


//adding two times, hours and minutes only
function timeAdd(s1,s2)
{
  var a1=s1.split(/:/),a2=s2.split(/:/);
  var v=new Array(parseInt(a1[0])+parseInt(a2[0]),parseInt(a1[1])+parseInt(a2[1]));
  return (v[0]+Math.floor(v[1]/60))+':'+v[1]%60;
}


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
