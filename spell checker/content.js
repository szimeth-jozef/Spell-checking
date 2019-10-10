
// Global variables
const url = chrome.runtime.getURL('./data/sk_SK.dic');
let readyToCheck = false;
let dict;
let parsedDic;

// Fetching data
fetch(url)
    .then(response => response.text())
    .then(dic => dict = dic)
    .then(() => main());

function main() {
    // loaded and parsed dictionary
    parsedDic = parseDic(dict);
    
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
    // TODO: find out what is that fantom character but it is fixed temporarily
    let arr = [];
    const fantomCharacter = dict[9];

    const buffering = new Buffer();
   
    // We start from 8, cuz we're ignoring the first unnecessary element
    for (let i = 8; i < dict.length; i++) {
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
            // I had to add check for empty string like fantom character because for some reason some words have that at the end 
            if (dict[i] !== fantomCharacter) {
                buffering.add(dict[i]);
            }
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
        for (let i = 0; i <= this.pInnerText.length; i++) {
            if (this.pInnerText[i] === ' ' || i === this.pInnerText.length) {
                // if result is false then the word is marked as misspelled
                let result = this.compare(this.getRidOfPunctuation());
                // this.addWord(this.currentWord, this.currentIndex, result);
                console.log("This word is now compared", this.currentWord, this.getRidOfPunctuation(), result);
                this.currentWord = '';
            } else {
                this.currentWord += this.pInnerText[i];
            }
            this.currentIndex++;
        }
    }

    compare(word) {
        // console.log(word.length);
        debugger;
        for (let wordDic of parsedDic) {
            if (word == wordDic.word || word == wordDic.word.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    getRidOfPunctuation() {
        // TODO: clean up the double replace and question mark problem
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        const questionMark = /\?/g;  
        let word = this.currentWord.replace(regex, ""); 
        word = word.replace(questionMark, "");
        return word; 
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