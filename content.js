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
  let headerDetected = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect table header
    if (trimmed.startsWith('|') && trimmed.toLowerCase().includes('importance')) {
      isTable = true;
      headerDetected = true;
      continue;
    }

    // Parse table rows
    if (isTable && trimmed.startsWith('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 5 && !isNaN(parseInt(parts[4]))) {
        entries.push({
          importance: parts[1],
          tag: parts[2].toLowerCase(),
          text: parts[3],
          position: parseInt(parts[4])
        });
        continue;
      }
    }

    // Fallback: markdown-style bullets like * **`h1`: "WTF is JSX"**
    const bulletMatch = trimmed.match(/^\*\s*\*\*`?(\w+)`?\s*:\s*"(.*?)"\*\*/);
    if (bulletMatch) {
      entries.push({
        importance: '1', // Default to high if not specified
        tag: bulletMatch[1].toLowerCase(),
        text: bulletMatch[2].trim(),
        position: -1
      });
      continue;
    }

    // Fallback: paragraph-style like "Tag: h1, Text: 'WTF is JSX', Importance: 1"
    const paraMatch = trimmed.match(/Tag:\s*(\w+),\s*Text:\s*['"](.*?)['"],\s*Importance:\s*(\d)/i);
    if (paraMatch) {
      entries.push({
        importance: paraMatch[3],
        tag: paraMatch[1].toLowerCase(),
        text: paraMatch[2].trim(),
        position: -1
      });
      continue;
    }
  }

  console.log("Parsed entries:", entries);
  return entries;
}

function annotatePage(resultText) {
  const importanceEntries = parseImportanceData(resultText);

  const allNodes = document.querySelectorAll("article p, article h1, article h2, article h3, article li");

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
  if (req.type === "GET_DATA") {
    console.log("Message received in content script");
    const structuredData = getStructuredArticleData();
    sendResponse({ structuredData });
  }

  if (req.type === "ANNOTATE_PAGE") {
    console.log("Annotating page with importance levels...");
    annotatePage(req.resultText);
  }
});
