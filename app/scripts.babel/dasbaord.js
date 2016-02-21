var dataset = [];


function getLocalStorage(){
	var firstRun;
	//send message to backroundpage to get localstorage object

	var port = chrome.runtime.connect({name: 'contentConv'});
	port.postMessage({map: 'getLocalStorage'});


	port.onMessage.addListener(function(msg){
		if(msg.answer === null ){
		    alert('error');
		}else{
			var localStorageStatsDownload = JSON.parse(msg.details);
			var localStorageDownload = JSON.parse(msg.answer);
			fillArray(localStorageDownload);

      document.getElementById("videos-watched").innerHTML = localStorageStatsDownload[0];
      document.getElementById("hours-watched").innerHTML = localStorageStatsDownload[1];
			document.getElementById("average-watched").innerHTML = calculateAverage(localStorageStatsDownload[0],localStorageStatsDownload[1]);
			document.getElementById("average-views").innerHTML = Math.round(parseInt(localStorageStatsDownload[2])/parseInt(localStorageStatsDownload[0]),2).toLocaleString();
			document.getElementById("link").innerHTML = "Youtube Analyzer - "+localStorageStatsDownload[4];
			document.getElementById("userImage").src = localStorageStatsDownload[3];



			$('#datatable').dataTable( {
				data: dataset,
				"order": [[ 1, "desc" ]],
				aoColumns: [
					{ "bSortable": false, title: "Name" },
					{ title: "Video Count"},
					{ title: "Hours Watched"}
	 			]

			});
			$('#datatable-keytable').DataTable( { keys: true } );
			$('#datatable-responsive').DataTable();
			$('#datatable-scroller').DataTable( { ajax: "plugins/datatables/json/scroller-demo.json", deferRender: true, scrollY: 380, scrollCollapse: true, scroller: true } );
			var table = $('#datatable-fixed-header').DataTable( { fixedHeader: true } );

		TableManageButtons.init();

		}
		});



	}


function fillArray(localMap){

	for (var key in localMap){
		if( localMap.hasOwnProperty(key)){
			if(localMap[key].length>2){
				var tmparray = [];
				tmparray.push(key.split(":::")[1]);
				tmparray.push(localMap[key].length);
				var hours = '00:00:00';
				for(var x =0; x< localMap[key].length; x++){
					hours = timeAdd(hours,localMap[key][x][2]);
				}
				tmparray.push(hours);
				dataset.push(tmparray);
			}
		}
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



//adding two times, hours and minutes only
function calculateAverage(s1, s2)
	{
		var sec = toSeconds(s2);
		var sec = sec/parseInt(s2,10);
		return fill(Math.floor(sec / 3600), 2) + ':' +
			fill(Math.floor(sec / 60) % 60, 2) + ':' +
			fill(Math.round(sec % 60), 2);
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




window.onload = getLocalStorage;
