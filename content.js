function getData(){
    const articles = document.querySelector("article")
    if (articles) return articles.innerText;

    const paragraphs = Array.from(document.querySelector("p"));
    return paragraphs.map((p) => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === "GET_DATA") {
      const text = getArticleText();
      sendResponse({ text });
    }
  });