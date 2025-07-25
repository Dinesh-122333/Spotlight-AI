function getData(){
    const articles = document.querySelector("article")
    if (articles) return articles.innerText;

    const paragraphs = Array.from(document.querySelector("p"));
    return paragraphs.map((p) => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.request === "GET_DATA") {
    console.log("Message received in content script");
    const article = getData();
    sendResponse({ text: article });
    return true; // ✅ Keeps the messaging channel open
  }
});
