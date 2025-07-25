document.getElementById("highlight-btn").addEventListener("click", () => {
    // var dataToggle = document.getElementById("data-toggle").checked;
    // var quoteToggle = document.getElementById("quote-toggle").checked;
    // var verbToggle = document.getElementById("verb-toggle").checked;
    // var emotionToggle = document.getElementById("emotion-toggle").checked;
    // const note = document.getElementById

    chrome.storage.sync.get(['Apikey'], (result) => {
        if (!result.Apikey) {
            console.log("API key not found...");
            return;
        }
    
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.runtime.sendMessage({ request: "GET_DATA" }, res => console.log(res));
            chrome.tabs.sendMessage(tab.id, { request: "GET_DATA" }, (res) => {
                console.log("Response from content script:", res);
            });
        });
    });
    


})