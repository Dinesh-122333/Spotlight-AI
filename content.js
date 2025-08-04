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

function parseImportanceData(resultText) {
  const lines = resultText.split('\n');
  const entries = [];

  let isTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect start of table
    if (trimmed.startsWith('|') && trimmed.toLowerCase().includes('importance')) {
      isTable = true;
      continue;
    }

    // Parse table rows
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
                text: parts[2], // Section Title
                position: pos
              });
            });
          }
        }
      }
    }
  }

  console.log("Parsed entries:", entries);
  return entries;
}




function annotatePage(resultText) {
  const importanceEntries = parseImportanceData(resultText);
  console.log("It is working I think");
  let allNodes = document.querySelectorAll("article p, article h1, article h2, article h3, article li");
  if (allNodes.length === 0) {
    allNodes = document.querySelectorAll("p, h1, h2, h3, li");
  }
  
  importanceEntries.forEach(entry => {
    for (const node of allNodes) {
      const nodeTag = node.tagName.toLowerCase();
      const nodeText = node.innerText.trim();
      
      
      if (nodeTag === entry.tag && nodeText === entry.text) {
        switch (entry.importance) {
          case '1':
            node.style.backgroundColor = 'yellow';
            node.style.fontWeight = 'bold';
            break;
          case '2':
            node.style.backgroundColor = '#d0f0fd';
            break;
          case '3':
            node.style.opacity = '0.6';
            break;
          default:
            node.style.opacity = '0.3';
            break;
        }
        break;
      }
    }
  });
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  console.log("📩 Message received in content script:", req);

  if (req.type === "GET_DATA") {
    const structuredData = getStructuredArticleData();
    sendResponse({ structuredData });
  }

  if (req.type === "ANNOTATE_PAGE") {
    console.log("🖍 Annotating page with importance levels...", req.resultText);
    annotatePage(req.resultText);
    sendResponse({ status: "done" });
    return true;
  }
});

