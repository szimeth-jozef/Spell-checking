// Global variables
const blackListTags = ['SCRIPT', 'NOSCRIPT', 'LINK', 'IMG', 'STYLE'];
let highlightBtnState = undefined;
let VirtualElementHolder = [];

const body = document.querySelectorAll('body *');
const filteredElements = preFilter(body);
const textNodes = filteredElements.textNodeFilter();
chrome.runtime.sendMessage({command:"EnableButton"});
console.log("Request sent"); 

/**
 * @description This is an event listener which is waiting for requests from the popup button to 
 *              run spell checking, turn off/on highlights and so on
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "Result") {
        // console.log(request.word, request.res);
        if (request.wrapMode === "single") {
            // Check whether it's working or not
            const isLast = VirtualElementHolder[request.index].wrapSingleWord(request.res, request.word);
        } else {
            VirtualElementHolder[request.index].wrapMultiWord(request.res, request.word, request.apply);
        }
    }
    if (request.command === "DoCheck") {
        spellCheck();
    }
    if (request.command === "SwitchBtnState") {
        turnHighlight();
    }
    if (request.command === "GetBtnState") {
        chrome.runtime.sendMessage({command:"ForwardBtnState", state: highlightBtnState});
    }
    if (request.color !== null) {
        changeHighlightColorTo(request.color);
    }
});


/**
 * @description This function is triggered by the button up in corner of the browser from popup and it executes spell checking
 */
function spellCheck() {
    VirtualElementHolder = [];
    for (let i = 0; i < textNodes.length; i++) {
        if (i === textNodes.length - 1) {
            VirtualElementHolder.push(new VirtualElement(textNodes[i], i, true));
            continue;    
        }
        VirtualElementHolder.push(new VirtualElement(textNodes[i], i));
    }

    for (let i = 0; i < VirtualElementHolder.length; i++) {

        VirtualElementHolder[i].check();
    }

    // Button behaviour logic: 
    // When the 'Run cheking' is clicked first time it sets the highlight turn on/off buttons state to true, 
    // and in case the highlighting is turned off and the 'Run cheking' is clicked once again it turns it back 
    if (highlightBtnState === undefined) {
        highlightBtnState = true;
    } else {
        highlightBtnState = false;
        turnHighlight();
    }

    // Here I get all of the error span tags then send the count to the popup window
    const errors = document.getElementsByClassName('misspell-highlight-SCH-Extension-' + currentHighlightColor);
    chrome.runtime.sendMessage({command:"ForwardErrorCount", count: errors.length});
    console.log("count sent", errors)
    console.log("count sent", errors.length)
}
