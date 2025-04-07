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

// Function to apply highlight and save it (supports complex DOM selection)
function highlightSelection() {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = "yellow";
    span.classList.add("chrome-text-highlighter-highlight");

    try {
      const content = range.extractContents(); // Take out selected content
      span.appendChild(content);              // Wrap with span
      range.insertNode(span);                 // Insert back

      // Save the parent container's HTML
      let container = span.parentNode;
      const containerXPath = getXPath(container);

      chrome.storage.local.get(getStorageKey(), (data) => {
        let storedData = data[getStorageKey()] || {};
        let containerHighlights = storedData.containerHighlights || {};
        containerHighlights[containerXPath] = container.outerHTML;
        storedData.containerHighlights = containerHighlights;
        chrome.storage.local.set({ [getStorageKey()]: storedData }, () => {
          console.log("Saved highlight for container:", containerXPath);
        });
      });

      console.log("Highlight applied (safe):", span.outerHTML);
    } catch (error) {
      console.error("Error while applying highlight:", error);
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

// Function to remove highlights: only those overlapping with selection
function removeHighlights() {
  const selection = window.getSelection();
  const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;

  if (hasSelection) {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const root = container.nodeType === Node.ELEMENT_NODE ? container : container.parentNode;

    const highlightSpans = root.querySelectorAll("span.chrome-text-highlighter-highlight");

    const touchedContainers = new Set();

    highlightSpans.forEach((span) => {
      if (range.intersectsNode(span)) {
        const parent = span.parentNode;
        touchedContainers.add(parent);
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
      }
    });

    // delete XPath from storage
    chrome.storage.local.get(getStorageKey(), (data) => {
      let storedData = data[getStorageKey()];
      if (!storedData || !storedData.containerHighlights) return;

      touchedContainers.forEach((container) => {
        const xpath = getXPath(container);
        delete storedData.containerHighlights[xpath];
      });

      chrome.storage.local.set({ [getStorageKey()]: storedData }, () => {
        console.log("Updated storage after partial highlight removal");
      });
    });

    console.log("Removed only intersecting highlights");
  } else {
    // 전체 삭제
    let highlightSpans = document.querySelectorAll("span.chrome-text-highlighter-highlight");
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

    chrome.storage.local.remove(getStorageKey(), () => {
      console.log("Saved highlight data removed:", getStorageKey());
    });

    console.log("All highlights removed");
  }
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
