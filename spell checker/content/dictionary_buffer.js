/**
 * @class
 * @description - Simple buffering system which accumulates letters and separates words from flags
 */
class DictionaryBuffer {

    constructor() {
        this.wordBuffer = "";
        this.flagBuffer = "";
        this.flagActive = false;
    }

    /**
     * @description - Add letter to buffer based on whether a flag is detected or not
     * @param {string} token - Letter to add to buffer
     */
    add(token) {
        if (!this.flagActive) {
            this.wordBuffer += token;
        } else {
            this.flagBuffer += token;
        }
    }

    /**
     * @description - Enable flagActive mode inside of DictionaryBuffer
     */
    flagDetected() {
        this.flagActive = true;
    }

    /**
     * @description - Reset state of buffer
     */
    clear() {
        this.wordBuffer = "";
        this.flagBuffer = "";
        this.flagActive = false;
    }

    getWord() {
        return this.wordBuffer;
    }

    getFlag() {
        return (this.flagBuffer == "") ? null : this.flagBuffer;
    }
}