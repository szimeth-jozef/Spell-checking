// Global variables
const url = chrome.runtime.getURL('./data/sk_SK.dic');
const blackListTags = ['SCRIPT', 'NOSCRIPT', 'LINK', 'IMG'];
let readyToCheck = false;

/**
 * @description Global variable to hold parsed dictionary
 */
let parsedDic;

// Fetching data
fetch(url)
    .then(response => response.text())
    .then(dict => main(dict));

/**
 * @description - Main function, enter point of spell checking
 * @param {string} dictionary - Raw form of the loaded dictionary
 */
function main(dictionary) {

    parsedDic = parseDic(dictionary);
    
    // const paragraphs = document.getElementsByTagName('p');
    const body = document.querySelectorAll('body *');
    const filteredElements = tagFilter(body);

    // TODO: make object with key equel to word
    let content = new Array();
    for (let element of filteredElements) {
        content.push(new VirtualElement(element));
    }
    // readyToCheck = true;


    // Just for debugging
    for (let i = 0; i < content.length; i++) {
        content[i].testCheck();
        // filteredElements[i].innerHTML = content[i].getNewInnerHTML();
    }
}

/**
 * @description - This function is triggered by the button up in corner of the browser from background script
 * @param {number} paragraphsLen - Length of paragraphs array
 * @param {Array<VirtualElement>} content - Array of VirtualElement objects
 */
function spellCheck(paragraphsLen, content) {
    if (readyToCheck){
        for (let i = 0; i < paragraphsLen; i++) {
            content[i].check();
            paragraphs[i].innerHTML = content[i].getNewInnerHTML();
        }
    }
}

/**
 * @description - Parses raw dictionary into objects with word and flag members
 * @param {string} data -  Raw form of the loaded dictionary 
 * @returns {Array<object>} - Array of objects with word and flag init 
 */
function parseDic(data) {
    // TODO: find out what is that fantom character but it is fixed temporarily
    let arr = [];
    const fantomCharacter = data[9];

    const buffering = new DictionaryBuffer();
   
    // We start from 8, cuz we're ignoring the first unnecessary element
    for (let i = 8; i < data.length; i++) {
        if (data[i] === "\n") {
            arr.push({
                "word": buffering.getWord(),
                "flag": buffering.getFlag()
            });
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
    return arr;
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
        else if (!/[a-zA-Z]/.test(node.innerText)) {
            continue;
        }
        else {
            newTags.push(node);
        }
    }
    return newTags;
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
        this.eInnerHTML = element.innerHTML;
        this.currentWord = '';
        this.newInnerHTML = '';
        this.insideTagMode = false;
        this.highlighting = ['<span class="highlight">', '</span>'];
    }

    testCheck() {
        this.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length !== 0) {
                console.log("We found text and it is:");
                console.log(node);
                console.log(node.parentNode.innerHTML);

                const words = node.nodeValue.split(/\s+/g);
                words.forEach((word) => {
                    // TODO: check whether the string is not empty
                    // if result is false then the word is marked as misspelled
                    let result = this.compare(this.getRidOfPunctuation(word));
                    // this method below handles creating the updated paragraph
                    this.addWord(result, word);
                });
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
        // TODO: prerobit s indexOf
        for (let wordDic of parsedDic) {
            if (word == wordDic.word || word.toLowerCase() == wordDic.word) {
                return true;
            }
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
        return this.flagBuffer;
    }
}