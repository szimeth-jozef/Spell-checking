// Global variables
let currentHighlightColor = 'yellow';

/**
 * @description basicaly filter out every node that do not has any text contentet 
 * @param {NodeList} tags array of nodes
 * @returns {NodeList} filtered nodes list
 */
function preFilter(tags) {
    let newTags = new Array();

    for (const node of tags) {
        if (blackListTags.includes(node.tagName)) {
            continue;
        } else {
            newTags.push(node);
        }
    }
    return newTags;
}

/**
 * @description Filters out TextNodes from the HTML elements array 
 * @returns {Array<Node>} Array of TextNodes
 */
Array.prototype.textNodeFilter = function() {
    let textNodes = [];
    for (const element of this) {
        if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim().length !== 0) {
            textNodes = addNode(element, textNodes);
        }
        for (const childNode of element.childNodes) {
            if (childNode.nodeType === Node.TEXT_NODE && childNode.nodeValue.trim().length !== 0) {
                textNodes = addNode(childNode, textNodes);
            }
        }
    }
    return textNodes;
}

/**
 * @description Add node to an array if the array does not consist the given node yet
 * @param {Node} node Node element which we intend add to the array 
 * @param {Array<Node>} nodeArray Array which we want to add the node element 
 */
function addNode(node, nodeArray) {
    for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].isSameNode(node)) {
            return nodeArray;
        }
    }
    nodeArray.push(node);
    return nodeArray;
}

/**
 * @description Function to turn misspeling highlight on or off
 * @param {boolean} state Decide whether highlighting should be turned off or on
 */
function turnHighlight() {
    if (highlightBtnState !== undefined) {
        if (highlightBtnState) {
            const spans = document.getElementsByClassName('misspell-highlight-SCH-Extension-' + currentHighlightColor);
            for (let i = spans.length - 1; i >= 0; i--) {
                spans[i].className = 'emptyClassHolder';
            }
            highlightBtnState = false;
            chrome.runtime.sendMessage({command:"ForwardBtnState", state: highlightBtnState});
        } else {
            const spans = document.getElementsByClassName('emptyClassHolder');
            for (let i = spans.length - 1; i >= 0; i--) {
                spans[i].className = 'misspell-highlight-SCH-Extension-' + currentHighlightColor;
            }
            highlightBtnState = true;
            chrome.runtime.sendMessage({command:"ForwardBtnState", state: highlightBtnState});
        }
    }
}

/**
 * @description Change color of words marked as misspelled 
 * @param {string} color Color which we want change to the highlighting
 */
function changeHighlightColorTo(color) {
    if (currentHighlightColor !== color) {
        const spans = document.getElementsByClassName('misspell-highlight-SCH-Extension-' + currentHighlightColor);
        for (let i = spans.length - 1; i >= 0; i--) {
            spans[i].className = 'misspell-highlight-SCH-Extension-' + color;
        }
        currentHighlightColor = color;
    }
}


function sendErrorCount() {
    errorPointerAt = 1;
    const errors = document.getElementsByClassName('misspell-highlight-SCH-Extension-' + currentHighlightColor);
    chrome.runtime.sendMessage({command:"ForwardErrorCount", count: errors.length, pointer: errorPointerAt});
    errorList = errors;
    pointAt(errorPointerAt);
}


function pointAt(index) {
    if (index == 1) {
        errorList[index-1].scrollIntoView();
        errorList[index-1].classList.add('blink-efect');
    } else {
        errorList[index-2].classList.remove('blink-efect');
        errorList[index-1].scrollIntoView();
        errorList[index-1].classList.add('blink-efect');
    }
}