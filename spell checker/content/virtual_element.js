/**
 * @class
 * @description - VirtualElement is created with a textNode passed to it. Inside this object the textContent of the textNode is split
 * and punctuation is removed. After this is compared with words in the dictionary. If our word is not matching with any of the word in the dictionary
 * then it is marked as misspeled. For every misspeled words is created a span element which contains it and the correct words are just appended as textNode 
 * to the parentNode. So it means if we have more than one word in the textNode we have to create that parentNode or as I'll refer to "motherNode" (plain span element). 
 * This way we can avoid some unexpected problems and it is more organized. (TextNodes where are not misspeled word, those are just ignored, not changed in the HTML tree)     
 */
class VirtualElement {

    /**
     * @param {textNode} textNode - TextNode from HTML elements
     */
    constructor(textNode, i)  {
        this.node = textNode;
        this.index = i;
        this.parentNode = textNode.parentNode;
        this.nodeCache = [];
        this.needToApplyCache = false;
    }

    /**
     * @description - Main method of VirtualElemet class, it executes the checking procedure
     */
    check() {
        const words = this.node.textContent.split(/\s+/g);
        // debugger
        if (words.length > 1) {

            for (const word of words) {
                this.compare(word, this.getRidOfPunctuation(word), 'multi');
            }
            this.applyNodeCache();

        } else {
            this.compare(words[0], this.getRidOfPunctuation(words[0]), 'single');
        }
    }

    wrapSingleWord(result, word) {
        if (!result) {
            const wrapTag = document.createElement('span');
            wrapTag.setAttribute('class', 'misspell-highlight-SCH-Extension-' + currentHighlightColor);
            wrapTag.appendChild(document.createTextNode(word));
            // Finally replace old textNode with wrapTag
            this.node.replaceWith(wrapTag);
        }
    }

    wrapMultiWord(result, word) {
        if (result) {
            this.nodeCache.push(document.createTextNode(word + " "));
        }
        else {
            const wrapTag = document.createElement('span');
            wrapTag.setAttribute('class', 'misspell-highlight-SCH-Extension-' + currentHighlightColor);
            wrapTag.appendChild(document.createTextNode(word + " "));
            this.nodeCache.push(wrapTag);
            this.needToApplyCache = true;
        }
    }

    applyNodeCache() {
        if (this.needToApplyCache) {
            const newChildNodes = Array.from(this.parentNode.childNodes);
            const indexOfNode = newChildNodes.indexOf(this.node);
            for (let [i, j] = [indexOfNode + 1, 0]; i < indexOfNode + this.nodeCache.length + 1; i++, j++) {
                newChildNodes.splice(i, 0, this.nodeCache[j]);
            }
            newChildNodes.splice(indexOfNode, 1);
            this.populateNewChildNodes(newChildNodes);
        } 
        // Redundant step, only for convenience
        else {
            this.nodeCache = [];
        }
        this.needToApplyCache = false;
    }

    populateNewChildNodes(childNodes) {
        // const parentNode = this.node.parentNode;
        while (this.parentNode.firstChild) {
            this.parentNode.removeChild(this.parentNode.firstChild);
        }
        for (const child of childNodes) {
            this.parentNode.appendChild(child);
        }
    }

    /**
     * 
     * @param {string} word - Word which is going to be tested
     * @returns {boolean} - Returns true if the passed word was found and false if wasn't
     */
    compare(orgWord, word, wrapMode) {
        debugger
        chrome.runtime.sendMessage({command:"CheckThis", word: word, original: orgWord, mode: wrapMode, index: this.index});


        // if (word in parsedDic || word.toLowerCase() in parsedDic) {
        //     return true;
        // }
        // return false;
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

    print() {
        console.log("workin mtf")
    }
}