// Create a key to save for the current page (like using the page path)
function getStorageKey() {
  return location.pathname;
}

// Function to create XPath: if it's a text node, base it on the parent
function getXPath(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return getXPath(node.parentNode) + '/text()';
  }
  let path = "";
  for (; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentNode) {
    let index = 1;
    let sibling = node.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    path = "/" + node.nodeName.toLowerCase() + "[" + index + "]" + path;
  }
  return path;
}

// Function to find a node using XPath
function getNodeByXPath(path) {
  const result = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  return result.singleNodeValue;
}

// Function to apply highlight and save it (saves the parent's HTML)
function highlightSelection() {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
      const span = document.createElement("span");
      span.style.backgroundColor = "yellow"; // Highlighter effect
      span.classList.add("chrome-text-highlighter-highlight"); // Add a class to identify for removal

      try {
        // Wrap the selected text with <span> to apply highlight
        range.surroundContents(span);
        console.log("Highlight applied:", span.outerHTML);

        // Choose the parent of the highlighted part
        let container = span.parentNode;
        const containerXPath = getXPath(container);
        console.log("XPath to save for container:", containerXPath);

        // Save structure: { containerHighlights: { [containerXPath]: outerHTML } }
        chrome.storage.local.get(getStorageKey(), (data) => {
          let storedData = data[getStorageKey()] || {};
          let containerHighlights = storedData.containerHighlights || {};
          containerHighlights[containerXPath] = container.outerHTML;
          storedData.containerHighlights = containerHighlights;
          chrome.storage.local.set({ [getStorageKey()]: storedData }, () => {
            console.log("Saved highlight for container:", containerXPath);
          });
        });
      } catch (error) {
        console.error("Error while applying highlight:", error);
      }
    }
  }
}

// Shortcut key listener for Option(Alt) + 3 (uses capturing)
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "3") {
    event.preventDefault();
    console.log("Option+3 shortcut detected");
    highlightSelection();
  }
}, true);

// Function to remove highlights: keeps removing all highlight spans in the document
function removeHighlights() {
  let highlightSpans = document.querySelectorAll("span.chrome-text-highlighter-highlight");
  // Remove repeatedly: keep removing until there are no more highlight spans
  while (highlightSpans.length > 0) {
    highlightSpans.forEach((span) => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });
    highlightSpans = document.querySelectorAll("span.chrome-text-highlighter-highlight");
  }
  // Delete saved highlight data for this page
  chrome.storage.local.remove(getStorageKey(), () => {
    console.log("Saved highlight data removed:", getStorageKey());
  });
  console.log("All highlights removed");
}

// Shortcut key listener for Option(Alt) + 4 (uses capturing)
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key === "4") {
    event.preventDefault();
    console.log("Option+4 shortcut detected");
    removeHighlights();
  }
}, true);

// Function to restore saved container HTML with highlights
function restoreContainerHighlights() {
  chrome.storage.local.get(getStorageKey(), (data) => {
    let storedData = data[getStorageKey()];
    if (storedData && storedData.containerHighlights) {
      let containerHighlights = storedData.containerHighlights;
      for (let containerXPath in containerHighlights) {
        let newHTML = containerHighlights[containerXPath];
        let containerEl = getNodeByXPath(containerXPath);
        if (containerEl) {
          containerEl.outerHTML = newHTML;
          console.log("Restored:", containerXPath);
        } else {
          console.warn("Could not find container by XPath:", containerXPath);
        }
      }
    }
  });
}

// Run restore function after the DOM is ready (adds a small delay)
function initRestore() {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => {
      console.log("Extension is ready");
      restoreContainerHighlights();
    }, 10);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        console.log("Extension is ready");
        restoreContainerHighlights();
      }, 10);
    });
  }
}

initRestore();
