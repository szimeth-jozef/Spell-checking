importScripts('typo.js');
importScripts('worker_utils.js');

const dictionary = new Typo("sk_SK", false, false, {dictionaryPath: "../dictionaries"});
postMessage("enable");

onmessage = function(e) {
    const req = e.data;

    if (req.command === "CheckThis") {
        const result = dictionary.check(req.word);
        const suggestions = (!result) ? dictionary.suggest(req.word) : null;

        this.postMessage({
            command: "ForwardResults",
            result: result,
            suggestions: suggestions,
            original: req.original,
            index: req.index,
            mode: req.mode,
            apply: req.apply
        });
    }
}

