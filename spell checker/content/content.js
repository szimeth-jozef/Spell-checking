// Global variables
const url = chrome.runtime.getURL('./data/sk_SK.dic');
const blackListTags = ['SCRIPT', 'NOSCRIPT', 'LINK', 'IMG', 'STYLE'];
let parsedDic;
let VirtualElementHolder = [];

// Fetching data
fetch(url)
    .then(response => response.text())
    .then(dict => onload(dict));

/**
 * @description - This is an event listener which is waiting for messages from the popup button to 
 *                run spell checking or turn off/on highlights
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.text) {
        spellCheck();
    }
    if (request.HlState !== null) {
        turnHighlight(request.HlState);
    }
});


/**
 * @description - Enter point of the program, where the dictionaty is loaded and enabled the popup button
 * @param {string} dictionary - Raw form of the loaded dictionary
 */
function onload(dictionary) {

    parsedDic = parseDic(dictionary);
    
    const body = document.querySelectorAll('body *');

    const filteredElements = preFilter(body);
    const textNodes = filteredElements.textNodeFilter();
    console.log(textNodes);
    // textNodes.forEach(node => console.log(node.textContent))

    for (let textNode of textNodes) {
        VirtualElementHolder.push(new VirtualElement(textNode));
    }

    // After everything is loaded, the dictionary, elements and other stuff we can enable the button
    chrome.runtime.sendMessage("enable");
}

/**
 * @description - This function is triggered by the button up in corner of the browser from popup and it executes spell checking
 */
function spellCheck() {
    for (let i = 0; i < VirtualElementHolder.length; i++) {
        VirtualElementHolder[i].check();
    }
}

/**
 * @description - Parses raw dictionary into objects with word as key and value with flags of the word or null if it doesn't have flags
 * @param {string} data -  Raw form of the loaded dictionary 
 * @returns {Object} - Object of word as key 
 */
function parseDic(data) {
    // TODO: find out what is that fantom character but it is fixed temporarily
    const dictionary = {};
    const fantomCharacter = data[9];

    const buffering = new DictionaryBuffer();
   
    // We start from 8, cuz we're ignoring the first unnecessary element
    for (let i = 8; i < data.length; i++) {
        if (data[i] === "\n") {
            dictionary[buffering.getWord()] = buffering.getFlag();
            buffering.clear();
        } else {
            if (data[i] === "/") {
                buffering.flagDetected();
                continue;
            }
            // I had to add check for empty string like fantom character because for some reason some words have that at the end 
            if (data[i] !== fantomCharacter) {
                buffering.add(data[i]);
            }
        }
    }
    return dictionary;
}

/**
 * @description - basicaly filter out every node that do not has any text contentet 
 * @param {NodeList} tags - array of nodes
 * @returns {NodeList} - filtered nodes list
 */
function preFilter(tags) {
    let newTags = new Array();

    for (const node of tags) {
        if (blackListTags.includes(node.tagName)) {
            continue;
        }
        // Problem with this is as soon the string is a single character and it is a foreign letter 
        // for example č, it wont pass, but for now I leave it this way because there is just a small amout of chance to this occurance
        // TODO: find a solution to the problem described above
        // else if (!/[a-zA-Z]/.test(node.innerText)) {
        //     continue;
        // }
        else {
            newTags.push(node);
        }
    }
    return newTags;
}

/**
 * @description - Filters out TextNodes from the array of HTML elements 
 * @returns {Array<Node>} - Array of TextNodes
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
 * @description - Add node to an array if the array does not consist the given node yet
 * @param {Node} node - Node element which we intend add to the array 
 * @param {Array<Node>} nodeArray - Array which we want to add the node element 
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
 * @description - Function to turn misspeling highlight on or off
 * @param {boolean} state - Decide whether highlighting should be turned off or on
 */
function turnHighlight(state) {
    if (state) {
        const spans = document.getElementsByClassName('emptyClassHolder');
        for (let i = spans.length - 1; i >= 0; i--) {
            spans[i].className = 'misspell-highlight-SCH-Extension';
        }
    } else {
        const spans = document.getElementsByClassName('misspell-highlight-SCH-Extension');
        for (let i = spans.length - 1; i >= 0; i--) {
            spans[i].className = 'emptyClassHolder';
        }
    }
}