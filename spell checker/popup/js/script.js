// [false: disabled; true: enabled]
let switchState = true;

window.onload = () => {

    /**
     * @description - Here's a listener attached to button in the popup which is sending request to content script to run the spell check
     */
    document.getElementById('run').addEventListener("click", () => {
 
        const request = {
            text: "Do something",
            HlState: null,
            color: null
        };
        makeRequest(request);
        
    });


    /**
     * @description - This event listener is attached to the Disable/Enable button and his task is 
     * sending requests to content script on every click event
     */
    const HLButton = document.getElementById('switch');
    HLButton.addEventListener("click", () => {
        console.log("HL Button clicked");
        if (switchState) {
            // Here the hl is enabled so we want to disable it.
            // Set switch state to false:disabled
            switchState = false

            // Trigger something to turn off hl and change button text to Enable
            const request = {
                text: null,
                HlState: switchState,
                color: null
            };
            makeRequest(request);
            HLButton.textContent = "Enable"; 

        } else {
            // Set switch state to true:enabled
            switchState = true;

            // Trigger something to turn on hl and change button text to Disable
            const request = {
                text: null,
                HlState: switchState,
                color: null
            };
            makeRequest(request);
            HLButton.textContent = "Disable";

        }
    });

    const colorBoxes = document.getElementsByClassName('color-box');

    for (const box of colorBoxes) {
        box.addEventListener('click', function() {
            // console.log(this.id);
            const request = {
                text: null,
                HlState: null,
                color: this.id
            };
            makeRequest(request);
         
            // Styling things
            document.getElementsByClassName('current')[0].classList.remove('current');
            this.classList.add('current');
        });
    }
}

/**
 * @description - 
 * @param {boolean} state -
 */
function highlightRequest(state) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const request = {
            text: null,
            HlState: state,
            color: null
        };
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
}

function makeRequest(request) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // I am using sendMessage instead of sendRequest because sendRequest is deprecated according to googles documentation.
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
}

