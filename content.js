// 현재 페이지에 대한 저장 키 생성 (예: pathname)
function getStorageKey() {
    // 필요에 따라 location.href나 pathname을 사용할 수 있습니다.
    return location.pathname; 
  }
  
  // XPath 생성 함수: 텍스트 노드인 경우 부모 기준으로 생성
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
  
  // XPath로 노드를 찾는 함수
  function getNodeByXPath(path) {
    const result = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  }
  
  // 하이라이트 적용 및 저장 함수 (부모 container의 HTML을 저장)
  function highlightSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const span = document.createElement("span");
        span.style.backgroundColor = "yellow"; // 형광펜 효과
  
        try {
          // 선택 영역을 span으로 감싸서 하이라이트 적용
          range.surroundContents(span);
          console.log("하이라이트 적용됨:", span.outerHTML);
  
          // 강조된 영역의 부모 container 선택 (필요에 따라 특정 클래스를 기준으로 선택 가능)
          let container = span.parentNode;
          const containerXPath = getXPath(container);
          console.log("저장할 container XPath:", containerXPath);
  
          // 저장 데이터 구조: { containerHighlights: { [containerXPath]: outerHTML }, pageKey: location.pathname }
          chrome.storage.local.get(getStorageKey(), (data) => {
            let storedData = data[getStorageKey()] || {};
            let containerHighlights = storedData.containerHighlights || {};
            containerHighlights[containerXPath] = container.outerHTML;
            storedData.containerHighlights = containerHighlights;
            chrome.storage.local.set({ [getStorageKey()]: storedData }, () => {
              console.log("Container highlight saved for:", containerXPath);
            });
          });
        } catch (error) {
          console.error("하이라이트 적용 중 에러 발생:", error);
        }
      }
    }
  }
  
  // Option(Alt) + 3 단축키 이벤트 리스너 (macOS의 Option은 altKey로 인식)
  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "3") {
      event.preventDefault();
      console.log("Option+3 단축키 감지됨");
      highlightSelection();
    }
  });
  
  // 저장된 container HTML을 복원하는 함수
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
            console.log("복원됨:", containerXPath);
          } else {
            console.warn("XPath로 container를 찾지 못함:", containerXPath);
          }
        }
      }
    });
  }
  
  // DOM이 준비된 후 복원 로직 실행 (약간의 지연 추가)
  function initRestore() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      setTimeout(restoreContainerHighlights, 50);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(restoreContainerHighlights, 50);
      });
    }
  }
  
  initRestore();
  