console.log("Background script console...");
console.log("...of the master branch");

const dicUrl = chrome.runtime.getURL('./dictionaries/sk_SK/sk_SK.dic');
const affUrl = chrome.runtime.getURL('./dictionaries/sk_SK/sk_SK.aff');

// If you want to use dictParser.js instead uncomment this and the loadDictionary call.
// const dictionary = new Spellchecker();

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

// loadDictionary().then(rawDict => {
//     const t3 = performance.now();
//     const DICT = dictionary.parse(rawDict);
//     dictionary.use(DICT);
//     const t4 = performance.now();
//     console.log(`Loaded in ${t4 - t3} ms`)
// });

/**
 * @description This below is using typo.js
 */
const dictionary = new Typo("sk_SK", false, false, { dictionaryPath: "./dictionaries" });

/**
 * @description - by default the browser action is disabled so we can't run spell check while everything isn't loaded.
 */
chrome.browserAction.disable();

/**
 * @description - Here the event listener is waiting for a request from content script to enable the popup menu.
 */
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
        const result = dictionary.check(request.word);
        const suggestions = (!result) ? dictionary.suggest(request.word) : null;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {command:"Result", res: result, sug: suggestions, word: request.original, index: request.index, wrapMode: request.mode, apply: request.apply, color: null});
        });
    }
});