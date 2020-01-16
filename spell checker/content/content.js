// Global variables
const blackListTags = ['SCRIPT', 'NOSCRIPT', 'LINK', 'IMG', 'STYLE'];
let highlightBtnState = undefined;
let VirtualElementHolder = [];
let errorList = [];
let errorPointerAt = 0;

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
            const isLast = VirtualElementHolder[request.index].wrapSingleWord(request.res, request.word);
            if (isLast) sendErrorCount();
        } else {
            const isLast = VirtualElementHolder[request.index].wrapMultiWord(request.res, request.word, request.apply);
            if (isLast) sendErrorCount();
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
    if (request.command === "GetErrorCount") chrome.runtime.sendMessage({command:"ForwardErrorCount", count: errorList.length, pointer: errorPointerAt});;

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
}
