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
}

