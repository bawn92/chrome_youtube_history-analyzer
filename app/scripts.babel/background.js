chrome.runtime.onConnect.addListener(function(port){
  console.assert(port.name === 'contentConv');
  var currentState;
  port.onMessage.addListener(function(msg){
    if(msg.map === 'getLocalStorage'){
      port.postMessage({answer: localStorage.getItem('videoMap'), details: localStorage.getItem('stats')});

    }else if ( msg.map === 'sendingVideoMap'){
        //alert('here');
        localStorage.setItem('videoMap',msg.values);
        chrome.tabs.create({url: "index.html"});
    }else if(msg.map === 'stats'){
      localStorage.setItem('stats',msg.values);
    }else if(msg.map === 'getLocalStorageStats'){
      console.log(localStorage.getItem('stats'));
      port.postMessage({answer: localStorage.getItem('stats')});
    }else if(msg.map === 'currentState'){
      if(localStorage.getItem('applicationState') !== null ){
        currentState = localStorage.getItem('applicationState');
      }else{
        localStorage.setItem('applicationState','0');
        currentState = '0';
      }
      port.postMessage({state: currentState});
    }else if(msg.map === 'updateState'){
      localStorage.setItem('applicationState',msg.values);
    }
  });
});
