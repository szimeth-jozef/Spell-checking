const url = chrome.runtime.getURL('./data/sk_SK.dic');
let dict;

fetch(url)
    .then(response => response.text())
    .then(dic => dict = dic)
    .then(() => main());

function main() {
    const spell = parseDic(dict);
    console.log(spell);
    
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