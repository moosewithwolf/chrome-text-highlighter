
# Chrome Text Highlighter

## Overview

Chrome Text Highlighter is a Chrome extension that allows users to highlight selected text on any website using a "highlighter" effect. The highlighted text is stored locally so that the highlights persist even after reloading or revisiting the page.

## Goal

- Enable users to easily highlight desired text on webpages.
- Store and persist highlighted data locally using `chrome.storage.local` without requiring a server.
- Automatically restore highlights when the user revisits the website.

## Features

- **Text Selection & Highlighting:**Detects user-selected text and applies a highlight effect (e.g., yellow background) via a Content Script.
- **Local Storage:**Saves highlight data (text and its corresponding HTML structure) using `chrome.storage.local`, organized by domain.
- **Highlight Restoration:**
  Retrieves saved highlight data on page load and reapplies the highlight effect.

## Requirements

- **Functional Requirements:**

  - Detect text selection and apply a highlight on mouseup.
  - Store highlighted text and its DOM information locally.
  - Restore highlights on page reload or revisiting the website.
- **Non-functional Requirements:**

  - Minimal UI interaction is required.
  - Local data storage without the need for a server.
  - Use of Chrome Developer Tools for debugging and error handling.

## Architecture

- **Content Script (content.js):**Manages DOM manipulation, detects user text selection, applies highlights, and handles local storage.
- **manifest.json:**Defines the extension's metadata, permissions, and the configuration of the content script.
- **chrome.storage.local:**
  Provides a local storage mechanism to save and retrieve highlight data.

## Installation & Usage

1. **Clone the Repository:**
   ```bash
   https://github.com/moosewithwolf/chrome-text-highlighter.git
   ```

# Chrome Text Highlighter

## 개요 (Overview)

Chrome Text Highlighter는 사용자가 웹사이트에서 선택한 텍스트에 형광펜(highlight) 효과를 적용하고, 해당 정보를 로컬에 저장하여 재접속 시에도 하이라이트가 유지되도록 하는 크롬 익스텐션입니다.

## 목표 (Goal)

- 사용자가 웹 페이지에서 원하는 텍스트를 쉽게 하이라이트할 수 있음
- 저장된 하이라이트 정보를 페이지 재로딩 또는 재접속 시에도 복원
- 서버 없이 로컬 스토리지(chrome.storage.local)로 데이터 관리

## 주요 기능 (Features)

- **텍스트 선택 감지 및 하이라이트:**사용자가 선택한 텍스트에 대해 Content Script가 형광펜 효과를 적용합니다.
- **로컬 저장:**각 웹사이트(도메인별)로 하이라이트 정보를 chrome.storage.local에 저장합니다.
- **하이라이트 복원:**
  저장된 하이라이트 정보를 페이지 로드 시 불러와서 자동으로 재적용합니다.

## 요구사항 (Requirements)

- **기능 요구사항:**

  - 텍스트 선택 후 마우스업 이벤트를 통해 하이라이트 적용
  - 하이라이트된 텍스트 및 위치 정보를 로컬 스토리지에 저장
  - 페이지 로드 시 저장 데이터를 바탕으로 하이라이트 복원
- **비기능 요구사항:**

  - 사용자 인터페이스(UI)는 최소한의 인터랙션만 필요
  - 데이터는 서버 없이 로컬 스토리지로 관리
  - 에러 발생 시 콘솔 로그를 통해 디버깅

## 아키텍처 (Architecture)

- **Content Script (content.js):**웹 페이지 내 DOM 조작 및 사용자 텍스트 선택 감지, 하이라이트 적용 및 저장 처리.
- **manifest.json:**익스텐션 기본 정보, 권한, content script 설정 등 정의.
- **chrome.storage.local:**
  하이라이트 데이터의 로컬 저장소 역할.

## 설치 및 사용 방법 (Installation & Usage)

1. **리포지토리 클론:**
   ```bash
   git clone https://github.com/moosewithwolf/chrome-text-highlighter.git
   ```
