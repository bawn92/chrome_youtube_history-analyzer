'use strict';

console.log('\'Allo \'Allo! Popup');


function injectTheScript() {
        var localMap = localStorage.getItem('videoMap');


          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            // query the active tab, which will be only one tab
            //and inject the script in it
            chrome.tabs.executeScript(tabs[0].id, {file: 'scripts/contentscript.js'});
          });

}
document.getElementById('clickactivity').addEventListener('click', injectTheScript);
