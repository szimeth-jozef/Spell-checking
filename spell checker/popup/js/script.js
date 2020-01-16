// Highlight tun on/off button 
// [false: disabled; true: enabled]

// Global variables
let HLButton;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "SetBtnText") {
        setHighlightBtnText(request.state);
    }
    if (request.command === "ForwardErrorCount") {
        document.getElementById('spell-errors').innerText = String(request.count);
        document.getElementById('currently-on').innerText = String(request.pointer);
    }
});

window.onload = () => {

    // Get the error count if there is any
    makeRequest({command: "GetErrorCount", color: null});

    /**
     * @description Here's a listener attached to button in the popup which is sending request to content script to run the spell check
     */
    document.getElementById('run').addEventListener("click", () => {
        const request = {
            command: "DoCheck",
            color: null
        };
        makeRequest(request);
        
    });


    /**
     * @description This event listener is attached to the Disable/Enable button and his task is 
     * sending requests to content script on every click event
     */
    HLButton = document.getElementById('switch');
    // The popup menu is every time reloaded when it is closed and opened again so I have to make sure that the text on
    // the button is matching with the current highlighting state
    makeRequest({command:"GetBtnState", color:null});

    HLButton.addEventListener("click", () => {
        console.log("HL Button clicked");

        makeRequest({command:"SwitchBtnState", color:null});
    });

    /**
     * @description This part of code is handling click events on the color picker boxes
     */
    const colorBoxes = document.getElementsByClassName('color-box');

    for (const box of colorBoxes) {
        box.addEventListener('click', function() {
            // console.log(this.id);
            const request = {
                command: null,
                color: this.id
            };
            makeRequest(request);
         
            // Styling things
            document.getElementsByClassName('current')[0].classList.remove('current');
            this.classList.add('current');
        });
    }

    // Listeners for stepping forward or backward between errors
    document.getElementById('step-back-btn').addEventListener('click', function(event){
        console.log('Stepped backward');
    });

    document.getElementById('step-forward-btn').addEventListener('click', function(event){
        // bottom.scrollIntoView();
        console.log('Stepped forward');
    });
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

/**
 * @description Changes the buttons text according to the state parameter
 * @param {boolean} state True sets text to Disable and false to Enable
 */
function setHighlightBtnText(state) {
    if (state !== undefined) {
        if (state) {
            HLButton.textContent = "Disable"
        } else {
            HLButton.textContent = "Enable"
        }
    }
}