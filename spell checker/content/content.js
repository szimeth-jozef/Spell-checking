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

    const filteredElements = tagFilter(body);
    console.log(filteredElements);
    const node1 = filteredElements[0].childNodes[0];
    const node2 = filteredElements[0].childNodes[2];
    console.log(node1.isSameNode(node2));
    console.log(node1.isSameNode(node1));
    debugger

    for (let element of filteredElements) {
        VirtualElementHolder.push(new VirtualElement(element));
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
function tagFilter(tags) {
    let newTags = new Array();

    for (const node of tags) {
        // TODO: check text node 
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

/**
 * @class
 * @description - (deprecated, need to be updated) VirtualElement gets innerText of one of the elements then from innerText it detects words 
    and right after a word is detected it is compared with words in the dictionary. If a word is not matching, it
    is probably misspelled so the word gets wrapped around span tags and it's added to newInnerHTML. The words are
    added to newInnerHTML whether it's correct or misspelled otherwise the updated innerHTML of a paragraph
    would be incomplete
 */
class VirtualElement {

    /**
     * @param {HTMLElement} element - Raw HTML element
     */
    constructor(element)  {
        this.node = element;
        this.childNodes = element.childNodes;
        this.eInnerHTML = element.innerHTML; // Not used
        this.newInnerHTML = '';
        this.highlighting = ['<span class="misspell-highlight-SCH-Extension">', '</span>'];
    }

    check() {
        this.childNodes.forEach((node) => {
            // Ez itt nem tetszik neki, szoval refactor
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length !== 0) {
                console.log(node);
                console.log(node.parentNode.innerHTML);
                console.log("----------------------");

                const words = node.nodeValue.split(/\s+/g);

                for (let word of words) {
                    if (word !== "") {
                        // if result is false then the word is marked as misspelled
                        let result = this.compare(this.getRidOfPunctuation(word));

                        // this method below handles creating the updated paragraph
                        this.addWord(result, word);
                    }
                }

                this.applyChanges(node);
            }
        });
    }

    applyChanges(node) {
        node.parentNode.innerHTML = this.newInnerHTML;
        this.newInnerHTML = '';
    }

    /**
     * @description - Add word to newInnerHTML with or without span tags 
     * @param {boolean} res - Boolean value, whether wrap the word or not 
     */
    addWord(res, word) {
        if (res) {
            this.newInnerHTML += word + " ";
        } else {
            this.newInnerHTML += this.highlighting[0] + word + this.highlighting[1] + " ";
        }
    }

    /**
     * 
     * @param {string} word - Word which is going to be tested
     * @returns {boolean} - Depend on whether the passed word was found or not
     */
    compare(word) {
        if (word in parsedDic || word.toLowerCase() in parsedDic) {
            return true;
        }
        return false;
    }

    /**
     * @description - Takes the current word and returns it without punctuation
     * @returns {string} - Returns this.currentWord without punctuation
     */
    getRidOfPunctuation(word) {
        // TODO: clean up the double replace and question mark problem
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        const questionMark = /\?/g;  
        let clsWord = word.replace(regex, ""); 
        clsWord = clsWord.replace(questionMark, "");
        return clsWord; 
    }

    getNewInnerHTML() {
        return this.newInnerHTML;
    }
}

/**
 * @class
 * @description - Simple buffering system which accumulates letters and separates words from flags
 */
class DictionaryBuffer {

    constructor() {
        this.wordBuffer = "";
        this.flagBuffer = "";
        this.flagActive = false;
    }

    /**
     * @description - Add letter to buffer based on whether a flag is detected or not
     * @param {string} token - Letter to add to buffer
     */
    add(token) {
        if (!this.flagActive) {
            this.wordBuffer += token;
        } else {
            this.flagBuffer += token;
        }
    }

    /**
     * @description - Enable flagActive mode inside of DictionaryBuffer
     */
    flagDetected() {
        this.flagActive = true;
    }

    /**
     * @description - Reset state of buffer
     */
    clear() {
        this.wordBuffer = "";
        this.flagBuffer = "";
        this.flagActive = false;
    }

    getWord() {
        return this.wordBuffer;
    }

    getFlag() {
        return (this.flagBuffer == "") ? null : this.flagBuffer;
    }
}