console.log("Background script console...");

/**
 * @description - by default the browser action is disabled so we can't run spell check while everything isn't loaded.
 */
chrome.browserAction.disable();

/**
 * @description - Here the event listener is waiting for a request from content script to enable the popup menu.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("We have got", request);
    chrome.browserAction.enable();
});