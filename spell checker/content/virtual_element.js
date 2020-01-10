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
    constructor(textNode, i, is_last=false)  {
        this.node = textNode;
        this.index = i;
        this.is_last = is_last;
        this.parentNode = textNode.parentNode;
        this.nodeCache = [];
        this.needToApplyCache = false;
    }

    /**
     * @description - Main method of VirtualElemet class, it executes the checking procedure
     */
    check() {
        const words = this.node.textContent.split(/\s+/g);
        if (words.length > 1) {

            for (let i = 0; i < words.length; i++) {
                if (words[i].trim().length !== 0) {
                    if (i === words.length - 1) {
                        this.compare(words[i], this.getRidOfPunctuation(words[i]), 'multi', true);
                    } else {
                        this.compare(words[i], this.getRidOfPunctuation(words[i]), 'multi');
                    }
                }
            }

        } else {
            if (words[0].trim().length !== 0) {
                this.compare(words[0], this.getRidOfPunctuation(words[0]), 'single');
            }
        }
    }

    /**
     * @description This method handles wrapping of "single or one worded" nodes
     * @param {boolean} result Based on this will be wrapped or not
     * @param {string} word The word which is gonna be wrapped
     */
    wrapSingleWord(result, word) {
        if (!result) {
            const wrapTag = document.createElement('span');
            wrapTag.setAttribute('class', 'misspell-highlight-SCH-Extension-' + currentHighlightColor);
            wrapTag.appendChild(document.createTextNode(word));
            // Finally replace old textNode with wrapTag
            this.node.replaceWith(wrapTag);
        }
    }

    /**
     * @description This method handles wrapping of more than "one worded" nodes
     * @param {boolean} result Based on this will be wrapped or not
     * @param {string} word The word which is gonna be wrapped
     * @param {boolean} canApply Based on this will run the apply method
     */
    wrapMultiWord(result, word, canApply) {
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

        if (canApply) {
            this.applyNodeCache();
        }
    }

    /**
     * @description It applies the cached nodes to the childNodes property
     */
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
        else {
            this.nodeCache = [];
        }
        this.needToApplyCache = false;
    }

    /**
     * @description Replaces old child nodes with new ones
     * @param {Array<node>} childNodes Nodes which are going to be inserted 
     */
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
     * @description Sends request to the background where the dictionaty lives, there the word is compared and the background sends back the results to the contet
     * @param {string} orgWord The original word which was in the text node
     * @param {string} word  Original word without punctuation
     * @param {string} wrapMode Is a key word 'single' or 'mutli', means which wrap method to use
     * @param {boolean} apply Indicates wheather to use method applyNodeCache
     */
    compare(orgWord, word, wrapMode, apply=false) {
        chrome.runtime.sendMessage({
            command:"CheckThis", 
            word: word, 
            original: orgWord, 
            mode: wrapMode, 
            index: this.index, 
            apply:apply
        });
    }

    /**
     * @description - Takes the current word and returns it without punctuation
     * @returns {string} - Returns this.currentWord without punctuation
     */
    getRidOfPunctuation(word) {
        // TODO: clean up the double replace and question mark problem (Double escaping does not work)
        const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
        const questionMark = /\?/g;  
        let clsWord = word.replace(regex, ""); 
        clsWord = clsWord.replace(questionMark, "");
        return clsWord; 
    }
}