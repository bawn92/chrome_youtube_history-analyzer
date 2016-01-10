var bodyContent = document.body.innerHTML;
var linkFound;
var regResult = false;
var videoIDs = new Array();
var count = 0;

// Regex for YouTube links and YouTube IDs
var hrefLink = new RegExp("href=\"/watch\\?v=.[^\"]{0,40}");
var channel
var titleName = new RegExp("title=\".[^\"]{0,}");// Checks for links like https://www.youtube.com/embed/0B0112bvG1s
var duration = new RegExp("- Duration: [0-9]{0,2}:{0,1}[0-9]{0,2}:{0,1}[0-9]{0,2}.");


clickPlanet();





function clickPlanet() {

	var checker = function(){
		number = document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button").length;
		if( number == 1){
					document.getElementsByClassName("yt-uix-button yt-uix-button-size-default yt-uix-button-default load-more-button yt-uix-load-more browse-items-load-more-button")[0].click();
		}else if (number == 0){
			clearInterval(timer);
			//once end of page reached search
			alert("starting search")
			doSearch(bodyContent,'');
		}
	};

	timer = setInterval(checker,5000);

}


function doSearch(searchString, details)
{
		var h3tagPostion = searchString.search('<h3.{100,}</h3>');
		var h3tag = searchString.match('<h3.{100,}</h3>')[0];
		//alert(h3tag+" length:"+h3tag.length+" postion:"+h3tagPostion+" total:"+searchString.length);
		//verify page has h3 tags
		if(h3tag)
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
				}*/
				var newSearchString = searchString.substring(h3tagPostion+h3tag.length,searchString.length);
				doSearch(newSearchString,'');
		}

}
