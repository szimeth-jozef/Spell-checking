console.log("Background script console...");
console.log("...of the master branch");

class Queue {
    constructor() {
        this.queue = [];
    }

    enqueue(element) {
        this.queue.push(element);
    }

    dequeue() {
        if(this.isEmpty()) {
            return undefined;
        }
        return this.queue.shift();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

const queue = new Queue();
let initWork = false;


// By default the browser action is disabled so we can't run spell check while everything isn't loaded.
chrome.browserAction.disable();

const dicUrl = chrome.runtime.getURL('./dictionaries/sk_SK/sk_SK.dic');
const affUrl = chrome.runtime.getURL('./dictionaries/sk_SK/sk_SK.aff');

/**
 * @description Loads the dictionary file and the aff file then returns them as a single object
 * @returns {object} Returns raw dictionary data
 */
async function loadDictionary() {
    const t1 = performance.now();
    const dicResponse = await fetch(dicUrl);
    const affResponse = await fetch(affUrl);

    const dicData = await dicResponse.text();
    const affData = await affResponse.text();
    const t2 = performance.now();
    console.log(`Everything fetched in ${t2 - t1} ms`);

    return {aff: affData, dic: dicData};
}

// Typojs dictionary instance 
// const dictionary = new Typo("sk_SK", false, false, { dictionaryPath: "./dictionaries" });

const worker = new Worker(chrome.runtime.getURL("./background/suggestions_worker.js"));

if (window.Worker) {
    // Worker post actions

    // Worker receiver section
    worker.onmessage = function(e) {
        const res = e.data;

        if (res.command === "ForwardResults") {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {command:"Result", res: res.result, sug: res.suggestions, word: res.original, index: res.index, wrapMode: res.mode, apply: res.apply, color: null});
            });
            if (!queue.isEmpty()) {
                worker.postMessage(queue.dequeue());
            }
        }
    }

    // Chrome event listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("We have got", request);
        if (request.command === "DisableButton") {
            chrome.browserAction.disable();
        }
        if (request.command === "EnableButton") {
            chrome.browserAction.enable();
        }
        if (request.command === "ForwardBtnState") {
            chrome.runtime.sendMessage({command:"SetBtnText", state: request.state});
        }
        if (request.command === "CheckThis") {
            if (!initWork) {
                worker.postMessage(request);
                initWork = true;
            }
            queue.enqueue(request);
        }
        if (request.command === "SkipThis") {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {command:"Result", res: true, sug: null, word: request.original, index: request.index, wrapMode: request.mode, apply: request.apply, color: null});
            });
        }
    });

} else {
    console.error("There is no worker instance!");
}
