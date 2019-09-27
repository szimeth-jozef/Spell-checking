/* This spell checker do not consist names. */

const url = chrome.runtime.getURL('./data/sk_SK.dic');
let readyToCheck = false;
let dict;

fetch(url)
    .then(response => response.text())
    .then(dic => dict = dic)
    .then(() => main());

function main() {
    const spell = parseDic(dict);
    
    const paragraphs = document.getElementsByTagName('p');
    let content = new Array();
    for (let p of paragraphs) {
        content.push(new VirtualParagraph(p));
    }

    readyToCheck = true;


    // Just for debugging
    for (let i = 0; i < paragraphs.length; i++) {
        content[i].check();
        // paragraphs[i].innerHTML = content[i].getpNewInnerHTML();
    }
}

function spellCheck(paragraphs, content) {
    /* This function will be triggered by the button up in corner of the browser from background script */
    if (readyToCheck){
        for (let i = 0; i < paragraphs.length; i++) {
            content[i].check();
            paragraphs[i].innerHTML = content[i].getpNewInnerHTML();
        }
    }
}


function parseDic(data) {
    let arr = [];

    const buffering = new Buffer();
   
    // We start from 7, cuz we're ignoring the first unnecessary element 
    for (let i = 7; i < dict.length; i++) {
        if (dict[i] === "\n") {
            arr.push({
                "word": buffering.getWord(),
                "flag": buffering.getFlag()
            });
            buffering.clear();
        } else {
            if (dict[i] === "/") {
                buffering.flagDetected();
                continue;
            }
            buffering.add(dict[i]);
        }
    }

    return arr;
}

class VirtualParagraph {
    /* VirtualParagraph gets innerText of one of the paragraphs then from innerText it detects words 
    and right after a word is detected it is compared with words in the dictionary.If a word is not matching, it
    is probably misspelled so the word gets wrapped in span tags and it's added to pNewInnerHTML. The word are
    added to pNewInnerHTML whether it's correct or misspelled otherwise the updated innerHTML of a paraghraph
    would be incomplete */
    constructor(paragraph)  {
        this.pInnerText = paragraph.innerText;
        this.currentIndex = 0;
        this.currentWord = '';
        this.pNewInnerHTML = '';
    }

    check() {
        for (let i = 0; i < this.pInnerText.length; i++) {
            if (this.pInnerText[i] === ' ') {
                this.getRidOfPunctuation();
                //let result = this.compare(this.currentWord);
                // this.addWord(this.currentWord, this.currentIndex, result);
                console.log("This word is now compared", this.currentWord);
                this.currentWord = '';
            } else {
                this.currentWord += this.pInnerText[i];
            }
            this.currentIndex++;
        }
    }

    getRidOfPunctuation() {
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        this.currentWord = this.currentWord.replace(regex, ""); 
    }

    getpNewInnerHTML() {
        return this.pNewInnerHTML;
    }
}

class Buffer {
    constructor() {
        this.wordBuffer = "";
        this.flagBuffer = "";
        this.flagActive = false;
    }

    add(token) {
        if (!this.flagActive) {
            this.wordBuffer += token;
        } else {
            this.flagBuffer += token;
        }
    }

    flagDetected() {
        this.flagActive = true;
    }

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