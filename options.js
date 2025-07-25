document.addEventListener("DOMContentLoaded", ()=>{
    chrome.storage.sync.get(['Apikey'], (apiKey) =>{
        if(apiKey) document.getElementById("api-key").value = apiKey; 
    })
})

document.getElementById("save-button").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key").value.trim();
    if (!apiKey) return ;
    
    chrome.storage.sync.set({Apikey: apiKey}, () => {
        console.log("API key saved:", apiKey);
        document.getElementById("success-message").style.display = "block";
        setTimeout(() => window.close(),1000);
    })

})