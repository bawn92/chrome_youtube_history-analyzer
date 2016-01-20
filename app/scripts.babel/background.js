

console.log('\'Allo \'Allo! Event Page for Browser Action');

/*
chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  //alert(msg.map);
  //alert(msg.subject);
  /*if ((msg.from === 'content') && (msg.subject === 'videoMap')) {
    // Collect the necessary data
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`)
    console.log(msg.map);

    localStorage.setItem('videoMap',JSON.stringify(msg.map));

  }
  chrome.runtime.sendMessage({
    from:    'content',
    subject: 'videoMap',
    map: videosMap
  });


  if ((msg.from === 'content') && (msg.subject === 'getLocalStorage')) {
    alert('locastorgaes');
    sendResponse(localStorage.getItem('videoMap'));

  }

}); */

chrome.runtime.onConnect.addListener(function(port){
  console.assert(port.name === 'contentConv');

  port.onMessage.addListener(function(msg){
    if(msg.map === 'getLocalStorage'){
      port.postMessage({answer: localStorage.getItem('videoMap')});

    }else if ( msg.map === 'sendingVideoMap'){
        alert('in backround saving data');
        localStorage.setItem('videoMap',msg.values);
    }
  });
});
