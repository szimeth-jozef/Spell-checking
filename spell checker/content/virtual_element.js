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
    constructor(textNode)  {
        this.node = textNode;
        this.motherNode = null;
        this.textNodeCache = [];
    }

    check() {
        const words = this.node.textContent.split(/\s+/g);
        if (words.length > 1) {

            for (const word of words) {
                const result = this.compare(this.getRidOfPunctuation(word));
                this.createMotherNode(result);
                if (result) {
                    if (this.motherNode) {
                        this.motherNode.appendChild(document.createTextNode(word + " "));
                    } else {
                        this.textNodeCache.push(document.createTextNode(word + " "));
                    }
                }
                else {
                    const wrapTag = document.createElement('span');
                    wrapTag.setAttribute('class', 'misspell-highlight-SCH-Extension');
                    wrapTag.appendChild(document.createTextNode(word + " "));
                    this.motherNode.appendChild(wrapTag);
                }
            }

            // Clear the cache in case any of the words wasn't misspelled
            this.textNodeCache = [];
            // Finally replace old textNode with our motherNode only if motherNode is not null
            if (this.motherNode) {
                this.node.replaceWith(this.motherNode);
            }
        } else {
            const result = this.compare(this.getRidOfPunctuation(words[0]));
            if (!result) {
                const wrapTag = document.createElement('span');
                wrapTag.setAttribute('class', 'misspell-highlight-SCH-Extension');
                wrapTag.appendChild(document.createTextNode(words[0]));
                // Finally replace old textNode with wrapTag
                this.node.replaceWith(wrapTag);
            }
        }
    }

    /**
     * @description - This will create motherNode if the result is false and if it is not created yet 
     * @param {boolean} res - Is the result of the tested word
     */
    createMotherNode(res) {
        if (!res && this.motherNode === null) {
            this.motherNode = document.createElement('span');
            if (this.textNodeCache.length !== 0) {
                for (const node of this.textNodeCache) {
                    this.motherNode.appendChild(node);
                }
                this.textNodeCache = [];
            }
        }
    }

    /**
     * 
     * @param {string} word - Word which is going to be tested
     * @returns {boolean} - Returns true if the passed word was found and false if wasn't
     */
    compare(word) {
        if (word in parsedDic || word.toLowerCase() in parsedDic) {
            return true;
        }
        return false;
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
}