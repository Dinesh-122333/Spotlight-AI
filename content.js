// Inject neat annotation styles into the page
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .annotate-high {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 4px 8px;
      font-weight: 600;
    }
    .annotate-medium {
      background-color: #e7f5ff;
      border-left: 4px solid #0d6efd;
      padding: 4px 8px;
    }
    .annotate-low {
      opacity: 0.6;
      font-style: italic;
    }
    .annotate-default {
      opacity: 0.3;
    }
  `;
  document.head.appendChild(style);
}

// Extract structured data from the article
function getStructuredArticleData() {
  const article = document.querySelector("article");
  const nodes = article
    ? Array.from(article.querySelectorAll("p, h1, h2, h3, li"))
    : Array.from(document.querySelectorAll("p, h1, h2, h3, li"));

  return nodes.map((node, index) => ({
    tag: node.tagName.toLowerCase(),
    text: node.innerText.trim(),
    position: index
  }));
}

// Parse importance data from resultText
function parseImportanceData(resultText) {
  const lines = resultText.split('\n');
  const entries = [];
  let isTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.toLowerCase().includes('importance')) {
      isTable = true;
      continue;
    }

    if (isTable && trimmed.startsWith('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        const importanceRaw = parts[1].toLowerCase();
        const importance = importanceRaw.includes('high') ? '1' :
                           importanceRaw.includes('medium') ? '2' :
                           importanceRaw.includes('low') ? '3' : '2';

        const tags = parts[4].split(',').map(t => t.trim().toLowerCase());
        const range = parts[5].match(/(\d+)-(\d+)/);

        if (range) {
          const start = parseInt(range[1]);
          const end = parseInt(range[2]);

          for (let pos = start; pos <= end; pos++) {
            tags.forEach(tag => {
              entries.push({
                importance,
                tag,
                text: parts[2],
                position: pos
              });
            });
          }
        }
      }
    }
  }

  return entries;
}

// Annotate page elements based on importance
function annotatePage(resultText) {
  injectStyles();
  const importanceEntries = parseImportanceData(resultText);

  let allNodes = document.querySelectorAll("article p, article h1, article h2, article h3, article li");
  if (allNodes.length === 0) {
    allNodes = document.querySelectorAll("p, h1, h2, h3, li, a");
  }

  importanceEntries.forEach(entry => {
    for (const node of allNodes) {
      const nodeTag = node.tagName.toLowerCase();
      const nodeText = node.innerText.trim();

      if (nodeTag === entry.tag && nodeText === entry.text) {
        node.classList.remove("annotate-high", "annotate-medium", "annotate-low", "annotate-default");

        switch (entry.importance) {
          case '1':
            node.classList.add("annotate-high");
            break;
          case '2':
            node.classList.add("annotate-medium");
            break;
          case '3':
            node.classList.add("annotate-low");
            break;
          default:
            node.classList.add("annotate-default");
            break;
        }
        break;
      }
    }
  });
}
function cleanImageandVideo(){
    // Remove images
    document.querySelectorAll("img").forEach(img => img.remove());

    // Remove iframes
    document.querySelectorAll("iframe").forEach(iframe => iframe.remove());

    console.log("🧹 Page cleaned: images and videos removed.");
}
function cleanAdds() {

  // Remove ad-like elements
  const adSelectors = [
    '[id*="ad"]',
    '[class*="ad"]',
    '[id*="banner"]',
    '[class*="banner"]',
    '[id*="sponsor"]',
    '[class*="sponsor"]',
    '[id*="promo"]',
    '[class*="promo"]',
    '[id*="pop"]',
    '[class*="pop"]'
  ];

  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });

  console.log("🧹 Page cleaned: ads removed.");
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_DATA") {
    const structuredData = getStructuredArticleData();
    sendResponse({ structuredData });
  }

  if (req.type === "ANNOTATE_PAGE") {
    console.log("Response came from the popup.js to load the result in the page");
    annotatePage(req.resultText);
    console.log("Result loaded");
    
    sendResponse({ status: "done" });
    return true;
  }

  if (req.type === "Remove-video"){
    console.log("response came from popup.js to remove video and image");
    cleanImageandVideo()
    console.log("Removed img and videos");
    sendResponse({status :"done"})
    return true;
  }

  if (req.type === "Remove-adds"){
    console.log("response came from popup.js to remove adds");
    cleanAdds()
    console.log("Removed adds");
    sendResponse({status :"done"})
    return true;
  }

});
