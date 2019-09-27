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
        paragraphs[i].innerHTML = content[i].getNewP();
    }
}

function spellCheck(paragraphs, content) {
    /* This function will be triggered by the button up in corner of the browser from background script */
    if (readyToCheck){
        for (let i = 0; i < paragraphs.length; i++) {
            content[i].check();
            paragraphs[i].innerHTML = content[i].getNewP();
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
    constructor(paragraph)  {
        this.pInnerHTML = paragraph.innerHTML;
        this.currentIndex = 0;
        this.isIgnoring = false;
        this.newP;
    }

    check() {
        // for (let i = 0; i < this.pInnerHTML.length; i++) {
        //     console.log(this.pInnerHTML[i]);
        // }
        console.log(this.pInnerHTML);
        console.log(this.pInnerHTML[0]);
        console.log(this.pInnerHTML[1]);
        console.log(this.pInnerHTML[2]);
        console.log(this.pInnerHTML[3]);
        console.log(this.pInnerHTML[4]);
        console.log(this.pInnerHTML[5]);
        console.log(this.pInnerHTML[6]);
        console.log(this.pInnerHTML[7]);
        console.log(this.pInnerHTML[8]);
        console.log(this.pInnerHTML[9]);
        console.log(this.pInnerHTML[10]);
        this.newP = this.pInnerHTML + '<span class="highlight">Added text</span>';
    }

    getNewP() {
        return this.newP;
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