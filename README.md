
# Chrome Text Highlighter

## Overview / 개요

Chrome Text Highlighter is a Chrome extension that lets you highlight selected text and store the highlight locally so it can be restored when you revisit the page.
Chrome Text Highlighter는 사용자가 선택한 텍스트를 하이라이트하고, 로컬에 저장하여 재접속 시 복원하는 익스텐션입니다.

## Goal / 목표

- Easily highlight text on webpages.
- Save highlights per page using the page’s URL.
- Automatically restore highlights on page load.
- 웹페이지에서 텍스트를 쉽게 하이라이트하고,
- 페이지 URL별로 하이라이트를 저장하며,
- 페이지 로드시 자동 복원합니다.

## Features / 기능

- **Text Selection & Highlighting / 텍스트 선택 및 하이라이트:**Use Option+3 to wrap selected text in a `<span>` with a yellow background.
- **Local Storage / 로컬 저장:**Saves the parent container's HTML snapshot along with a unique XPath.
- **Highlight Restoration / 하이라이트 복원:**
  Restores the saved container HTML only on the matching page.

## Architecture / 아키텍처

- **Content Script (content.js):**

  - Detects text selection and applies highlight.
  - Chooses the direct parent of the highlight `<span>` as the container.
  - Generates a unique XPath using the element’s tag name and sibling order.
  - Uses the current page’s URL (e.g., `location.pathname`) as the storage key to isolate data.
- **Storage:**
  Uses `chrome.storage.local` to save and retrieve highlight data.

## Installation & Usage / 설치 및 사용 방법

1. Clone the repository.
2. In Chrome, go to `chrome://extensions/`, enable Developer Mode, and click "Load unpacked" to select the project folder.
3. On a static webpage, highlight text by dragging and then press Option+3.

## Algorithm Overview / 알고리즘 개요

- **Highlight & Save:**Wrap the selected text in a `<span>` (yellow background), then save the parent container's HTML and its unique XPath.XPath is generated by traversing from the element up to the root using tag names and sibling order, ensuring a unique identifier.
- **Restore:**
  On page load, retrieve saved data using the page’s URL as the key and replace the container’s HTML using the XPath.

## License / 라이센스

MIT License
