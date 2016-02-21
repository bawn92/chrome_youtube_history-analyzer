

var port;

function loadingFunction(){
  //alert('loading');





  port = chrome.runtime.connect({name: 'contentConv'});
  port.postMessage({map: 'currentState'});

  port.onMessage.addListener(function(msg){
    if(msg.state === null ){
      document.getElementById("beginButton").style.display = 'none';
    }else if (msg.state !== null){
      document.getElementById("loader").style.display = 'none';
      if(msg.state === '0'){
          document.getElementById('clickactivity').addEventListener('click', injectTheScript);
      }else if (msg.state === '1') {
        document.getElementById("loader").style.display = 'inline';
        document.getElementById("beginButton").style.display = 'none';
      }
    }
    });


}




function injectTheScript() {


        document.getElementById("loader").style.display = 'inline';
        document.getElementById("beginButton").style.display = 'none';
        port.postMessage({map: 'updateState', values: '1'});

        var localMap = localStorage.getItem('videoMap');
          //document.getElementById("loader").style.display = 'none';

          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // query the active tab, which will be only one tab
            //and inject the script in it
            chrome.tabs.executeScript(tabs[0].id, {file: 'scripts/contentscript.js'});
          });

}

loadingFunction();
