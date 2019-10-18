// Global variables
const url = chrome.runtime.getURL('./data/sk_SK.dic');
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
    
    const paragraphs = document.getElementsByTagName('p');
    console.info(document.querySelectorAll("body *"));

    // TODO: make object with key equel to word
    let content = new Array();
    for (let p of paragraphs) {
        content.push(new VirtualParagraph(p));
    }

    readyToCheck = true;


    // Just for debugging
    for (let i = 0; i < paragraphs.length; i++) {
        content[i].check();
        paragraphs[i].innerHTML = content[i].getNewInnerHTML();
    }
}

/**
 * @description - This function is triggered by the button up in corner of the browser from background script
 * @param {number} paragraphsLen - Length of paragraphs array
 * @param {Array<VirtualParagraph>} content - Array of VirtualParagraph objects
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
 * @class
 * @description - VirtualParagraph gets innerText of one of the paragraphs then from innerText it detects words 
    and right after a word is detected it is compared with words in the dictionary. If a word is not matching, it
    is probably misspelled so the word gets wrapped around span tags and it's added to newInnerHTML. The words are
    added to newInnerHTML whether it's correct or misspelled otherwise the updated innerHTML of a paragraph
    would be incomplete
 */
class VirtualParagraph {

    /**
     * 
     * @param {HTMLParagraphElement} paragraph - Raw HTML paragraph element
     */
    constructor(paragraph)  {
        this.pInnerText = paragraph.innerText;
        this.currentWord = '';
        this.newInnerHTML = '';
        this.highlightTagBegin = '<span class="highlight">';
        this.highlightTagEnd = '</span>';
    }

    /**
     * @description - Execute checking process
     */
    check() {
        // TODO: split text with regex and iterate through with foreach
        for (let i = 0; i <= this.pInnerText.length; i++) {
            if (this.pInnerText[i] === ' ' || i === this.pInnerText.length) {
                // if result is false then the word is marked as misspelled
                let result = this.compare(this.getRidOfPunctuation());
                // this method below handles creating the updated paragraph
                this.addWord(result);
                console.log("This word is now compared", this.currentWord, this.getRidOfPunctuation(), result);
                this.currentWord = '';
            } else {
                this.currentWord += this.pInnerText[i];
            }
        }
    }

    /**
     * @description - Add word to newInnerHTML with or without span tags 
     * @param {boolean} res - Boolean value, whether wrap the word or not 
     */
    addWord(res) {
        if (res) {
            this.newInnerHTML += this.currentWord + " ";
        } else {
            this.newInnerHTML += this.highlightTagBegin + this.currentWord + this.highlightTagEnd + " ";
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
    getRidOfPunctuation() {
        // TODO: clean up the double replace and question mark problem
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        const questionMark = /\?/g;  
        let word = this.currentWord.replace(regex, ""); 
        word = word.replace(questionMark, "");
        return word; 
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