const url = chrome.runtime.getURL('./data/sk_SK.dic');

fetch(url)
    .then(response => response.text())
    .then(json => console.log(json));