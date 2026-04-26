# Technical Release Notes - Hello World v1.0.0

## 1. Overview
This release marks the first stable production build of the Hello World messaging platform. It includes a cross-platform desktop client (Tauri v2) and a real-time backend architecture (Rust Axum).

## 2. Core Specifications
- **Runtime Environment**: Node.js 22.x / Rust 1.91.0
- **Database Architecture**: 
  - PostgreSQL (Relational data: Users, Servers, Channels)
  - MongoDB (Unstructured data: Message history)
- **Protocol**: WebSocket (WSS) with JWT authentication for real-time state synchronization.

## 3. Key Technical Changes
- **Server/Channel Management**: Implemented full administrative controls (Update/Delete/Leave) for server owners and members.
- **Attachment Rendering**: Added support for file attachments in Direct Messages (DM) with integrated preview/download logic.
- **Native Integration**: Configured hybrid file upload logic to interface with native OS dialogs (Tauri) and standard HTML5 inputs (Web).
- **Environment Synchronization**: Updated client configuration to point to Render production endpoints (API/WS).

## 4. Security & Compliance
- Integrated production Content Security Policy (CSP) allowing only authorized origins (Render, Giphy, GitHub).
- JWT-based authentication enforced on all API endpoints and WebSocket handshakes.
- GIO_EXTRA_MODULES integration for secure file handling on Linux/NixOS environments.

## 5. Artifacts
Binaries are generated for Linux (AMD64) in `.deb` and standalone binary formats. These are attached to the official GitHub Release page.

---
*Technical documentation for project T-DEV-600-PAR_27*
