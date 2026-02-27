# NotePilot ✈️

> **Professional Side-Panel Notes for Chrome** > *Enterprise-ready note-taking with a modular storage architecture.*

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Tech](https://img.shields.io/badge/built%20with-React%20%7C%20TypeScript%20%7C%20Vite-61DAFB.svg)

## 📖 Overview

**NotePilot** is a modern Chrome Extension designed for professionals who need quick access to notes without leaving their current tab. 

It leverages the Chrome **Side Panel API** to keep notes persistent alongside browsing. The architecture follows the **Adapter Pattern**, allowing for seamless switching between storage providers (Local, Google Drive, Zoho WorkDrive).

## ✨ Features

- **🚀 Side Panel Interface:** Always-on-top notes that don't block your web content.
- **⚡ Instant Local Sync:** Notes are saved immediately to Chrome's local storage.
- **🛠️ Modular Architecture:** "Enterprise-Lite" codebase designed for easy API integration.
- **🎨 Modern UI:** Built with Tailwind CSS and Lucide Icons for a clean, distraction-free look.
- **🔐 Privacy First:** No external servers; your data stays in your browser or your connected drives.

## 🏗️ Tech Stack

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) (Optimized for Manifest V3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State:** [Zustand](https://github.com/pmndrs/zustand) (Simple, scalable state management)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/notepilot.git](https://github.com/YOUR_USERNAME/notepilot.git)
   cd notepilot
