# 🌬️ Apex Breeze

> *"Apex Breeze is that quiet shift in the air that reminds you there's still time. Drift in, breathe easy, and let your ideas move freely forward—where hope moves with you."*

A mobile-first development workspace designed for **clarity, comfort, and confidence**. Not just another code editor — a sanctuary for the mind where the act of creation becomes a form of meditation.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖊️ **Code Editor** | Lightweight mobile editor with syntax highlighting (TS, JS, Python, JSON), tabs, and continuous autosave |
| 📁 **File Explorer** | Virtual file tree with search, create, rename, and delete |
| 🔗 **GitHub Integration** | OAuth-style PAT authentication, repository browser, pull/push/merge |
| 📜 **Sync History** | Timeline of all sync operations — every commit is a chapter in your story |
| 🔐 **AES-256 Vault** | Credentials encrypted at rest using AES-256-CBC + PBKDF2. Never leaves the device in plaintext |
| ✈️ **Offline Mode** | Full offline capability — build in a flight, a remote cabin, anywhere |
| 🎨 **Themes** | Biophilic color palettes drawn from nature at twilight (Midnight, Dawn, Forest, Ember) |
| 🌬️ **Breeze Motion** | Spring-physics animations that mimic air currents — weightless, purposeful |
| 🎯 **Flow Tabs** | Dynamic bottom navigation with spring-animated active state |
| 👋 **Onboarding** | Narrative-driven first-use experience with welcome animation |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native + Expo (~50) |
| **Language** | TypeScript (strict) |
| **Navigation** | React Navigation v6 (Stack + Bottom Tabs) |
| **State** | Zustand v4 |
| **Animations** | React Native Reanimated v3 |
| **Security** | expo-secure-store + crypto-js (AES-256) |
| **Haptics** | expo-haptics |
| **Gradients** | expo-linear-gradient |

---

## 📂 Project Structure

```
apex-breeze/
├── App.tsx                    # Entry point + welcome animation
├── src/
│   ├── theme/                 # Colors, typography, spacing, animations
│   ├── store/                 # Zustand stores (editor, file, auth, theme)
│   ├── utils/                 # Pure functions (encryption, tokenizer, file/git utils)
│   ├── services/              # Side effects (Vault, Storage, Autosave, GitHub, Sync)
│   ├── hooks/                 # React hooks bridging stores ↔ UI
│   ├── components/            # Reusable UI components
│   │   ├── common/            # BreezeButton, BreezeCard, LoadingIndicator
│   │   ├── editor/            # CodeEditor, SyntaxHighlighter, EditorTabs
│   │   ├── explorer/          # FileExplorer, FileTreeNode
│   │   └── onboarding/        # WelcomeAnimation, OnboardingSlide
│   ├── screens/               # Full screens (Home, Editor, Vault, Sync, Settings, Themes)
│   └── navigation/            # AppNavigator + type definitions
└── docs/
    └── ARCHITECTURE.md        # Full architecture overview
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or Expo Go on a physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/rahmaanherman-source/Apex-Breeze.git
cd Apex-Breeze

# Install dependencies
npm install

# Download SpaceMono font (optional — falls back to system monospace)
# Place SpaceMono-Regular.ttf in assets/fonts/

# Start the development server
npm start
```

### Run on Device

```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser (limited features)
```

---

## 🔐 Security

All credentials are protected by a **two-layer encryption model**:

1. **OS Secure Enclave** — `expo-secure-store` uses iOS Keychain / Android Keystore
2. **AES-256-CBC** — An additional encryption layer wraps secrets using PBKDF2 key derivation (100,000 iterations, SHA-256)

GitHub tokens are only decrypted in-memory at request time and are never logged or persisted in plaintext anywhere.

---

## 📚 Documentation

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for:
- Complete data flow diagrams
- Security architecture details
- Motion system spring configurations
- How to add new languages and themes
- Performance considerations

---

## 🎨 Color Philosophy

> *"Colors drawn from nature at twilight — they whisper, not shout."*

The Apex Breeze palette uses **biophilic design** principles:
- 🟦 Deep indigo background — calming, focused
- 🟩 Sage green for functions — nature, growth
- 🟧 Soft amber for keywords — warmth, clarity
- 🟥 Terracotta for variables — grounded, confident
- 🩵 Cool mist for strings — open, breathing

---

## 💙 Philosophy

Apex Breeze is a manifesto for a better way to work. By prioritizing the human element — the psychology of the creator, the need for calm, the desire for flow — it transforms a utility into a companion.

Every pixel, every function, every animation is designed with the intent of **removing friction and adding meaning**.

---

*Built with love for mobile developers everywhere. You are never behind, never late — you are exactly where you need to be.*
