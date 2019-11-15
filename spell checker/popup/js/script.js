// Highlight tun on/off button 
// [false: disabled; true: enabled]

let switchState;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "SwitchState") {
        // Here is now the switch state now what
        switchState = request.state;
    }
});

window.onload = () => {

    /**
     * @description Here's a listener attached to button in the popup which is sending request to content script to run the spell check
     */
    document.getElementById('run').addEventListener("click", () => {
 
        const request = {
            command: "DoCheck",
            HlState: null,
            color: null
        };
        makeRequest(request);
        
    });


    /**
     * @description This event listener is attached to the Disable/Enable button and his task is 
     * sending requests to content script on every click event
     */
    const HLButton = document.getElementById('switch');
    // The popup menu is every time reloaded when it is closed and opened again so I have to make sure that the text on
    // button is matching with current state
    const req = {
        command: "SwitchState",
        HlState: null,
        color: null
    };
    makeRequest(req);

    HLButton.addEventListener("click", () => {
        console.log("HL Button clicked");
        chrome.runtime.sendMessage({command:"GetSwitchState"});
        if (switchState) {
            // Here the hl is enabled so we want to disable it.
            // Set switch state to false:disabled
            switchState = false

            // Trigger something to turn off hl and change button text to Enable
            const request = {
                command: null,
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
                command: null,
                HlState: switchState,
                color: null
            };
            makeRequest(request);
            HLButton.textContent = "Disable";

        }
    });

    /**
     * @description This part of code is hangling click events on the color picker boxes
     */
    const colorBoxes = document.getElementsByClassName('color-box');

    for (const box of colorBoxes) {
        box.addEventListener('click', function() {
            // console.log(this.id);
            const request = {
                command: null,
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
 * @description Make request to the current tab with passed request object
 * @param {Object} request Object which holds request parameters
 */
function makeRequest(request) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // I am using sendMessage instead of sendRequest because sendRequest is deprecated according to googles documentation.
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
}

