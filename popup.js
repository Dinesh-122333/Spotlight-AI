console.log("✅ content.js loaded on", window.location.href);

document.getElementById("highlight-btn").addEventListener("click", () => {

    const checklist = {
      videoimgRemove: document.getElementById("videoimgRemove").checked,
      adsRemove: document.getElementById("adsRemove").checked
    };
    chrome.storage.sync.get(['Apikey'], (result) => {
        if (!result.Apikey) {
            console.log("API key not found...");
            return;
        }

        // ✅ Get the active tab first
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (!tab || !tab.id) {
                console.error("No active tab found.");
                return;
            }

            // ✅ Now send message to content script
            chrome.tabs.sendMessage(tab.id, { type: "GET_DATA" }, (res) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                    return;
                }

                console.log("The response from the content.js is: ", res);
                if (res && res.structuredData) {
                    console.log(res.structuredData);
                    var data = sendtoApi(res.structuredData, result.Apikey, tab.id);
                } else {
                    console.warn("No text received from content script.");
                }
            });

            if (checklist.videoimgRemove){
              chrome.tabs.sendMessage(tab.id, {type: "Remove-video"}, (res) => {
                if (chrome.runtime.lastError) {
                  console.error("Error sending message:", chrome.runtime.lastError.message);
                  return;
              }

              console.log("The response from the content.js is: ", res);
              })
            }
            if (checklist.adsRemove){
              chrome.tabs.sendMessage(tab.id, {type: "Remove-adds"}, (res) => {
                if (chrome.runtime.lastError) {
                  console.error("Error sending message:", chrome.runtime.lastError.message);
                  return;
              }

              console.log("The response from the content.js is: ", res);
              })
            }
            
        });
    });
});
async function sendtoApi(data, apiKey, tabId) {
    try {
      const prompt = `Analyze the following structured content and assign importance levels in table format(like this = | Importance Level | Title/Subheading | Content Description | Tag | Position Range |
|---|---|---|---|---|
| **High** | WTF is JSX | Concise introduction to JSX and its advantages over templates. | h1, p | 0-2 |
| **Medium** | The Pragma | Explains the role of the pragma in JSX transpilation. | h2, p | 3-5 |):\n\n${JSON.stringify(data, null, 2)}`;
  
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });
  
      const result = await response.json();
      console.log("API response:", result);
      const resultText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Extracted text: ",resultText);

      console.log("going to annotation page");
      
      chrome.tabs.sendMessage(tabId, {
        type: "ANNOTATE_PAGE",
        resultText: resultText
      });
      
    } catch (error) {
      console.error("Error sending data to API:", error);
    }
  }