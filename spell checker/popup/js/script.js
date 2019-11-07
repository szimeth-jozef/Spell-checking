// [false: disabled; true: enabled]
let switchState = true;

window.onload = () => {

    /**
     * @description - Here's a listener attached to button in the popup which is sending request to content script to run the spell check
     */
    document.getElementById('run').addEventListener("click", () => {
 
        const params = {
            active: true,
            currentWindow: true
        };
        chrome.tabs.query(params, (tabs) => {

            // I made an object because later maybe it'll be useful
            const request = {
                text: "Do something"
            };
       
            // I am using sendMessage instead of sendRequest because sendRequest is deprecated according to googles documentation.
            chrome.tabs.sendMessage(tabs[0].id, request);
        });
    });


    // TODO: set up a listener for this in the content script
    const HLButton = document.getElementById('switch');
    HLButton.addEventListener("click", () => {
        console.log("HL Button clicked");
        if (switchState) {
            // Here the hl is enabled so we want to disable it.
            // Set switch state to false:disabled
            switchState = false

            // Trigger something to turn off hl and change button text to Enable
            highlightRequest(switchState);
            HLButton.textContent = "Enable"; 

        } else {
            // Set switch state to true:enabled
            switchState = true;

            // Trigger something to turn on hl and change button text to Disable
            highlightRequest(switchState);
            HLButton.textContent = "Disable";

        }
    });
}


function highlightRequest(state) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {state: state});
    });
}
