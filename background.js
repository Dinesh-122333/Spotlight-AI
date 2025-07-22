chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
        if (!result.geminiApiKey){
            chrome.tabs.create({url: "options.html"})
        }
    })// where chrome storage consist of two thing local for local browser and sync for across the browser

})