# Apex Breeze — Architecture Overview

> *"Apex Breeze is that quiet shift in the air that reminds you there's still time. Drift in, breathe easy, and let your ideas move freely forward—where hope moves with you."*

## Philosophy

Apex Breeze is not merely a code editor for mobile. It is a sanctuary for the mind where the act of creation becomes a form of meditation. Every architectural decision is guided by three principles:

1. **Clarity** — The structure should be immediately understandable. No hidden magic, no opaque abstractions.
2. **Comfort** — The interface reduces cognitive load. Colors whisper. Transitions breathe. Nothing demands attention.
3. **Confidence** — The tooling is reliable and fast. No lag. No data loss. The developer trusts the environment completely.

---

## Project Structure

```
apex-breeze/
├── App.tsx                          # Entry point — initialization & welcome animation
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config with path aliases
├── babel.config.js                  # Babel with module-resolver
│
├── assets/
│   └── fonts/
│       └── SpaceMono-Regular.ttf    # Code editor font
│
├── src/
│   ├── theme/                       # Visual language
│   │   ├── colors.ts                # Biophilic color palette (earth tones at twilight)
│   │   ├── typography.ts            # Type scale — code + UI
│   │   ├── spacing.ts               # 4pt grid + semantic values
│   │   ├── animations.ts            # Spring physics + timing curves
│   │   └── index.ts                 # Unified export
│   │
│   ├── store/                       # Reactive state management (Zustand)
│   │   ├── editorStore.ts           # Open tabs, content, cursor, autosave
│   │   ├── fileStore.ts             # Virtual file system tree
│   │   ├── authStore.ts             # GitHub authentication + user profile
│   │   ├── themeStore.ts            # Active theme selection
│   │   └── index.ts
│   │
│   ├── utils/                       # Pure functions — no side effects
│   │   ├── encryption.ts            # AES-256-CBC + PBKDF2 key derivation
│   │   ├── syntaxTokenizer.ts       # Lightweight tokenizer (TS, JS, Python, JSON)
│   │   ├── fileUtils.ts             # File tree helpers + data types
│   │   └── gitUtils.ts              # Git/sync helpers + data types
│   │
│   ├── services/                    # Side-effectful operations
│   │   ├── VaultService.ts          # AES-256 token vault (expo-secure-store)
│   │   ├── StorageService.ts        # Local persistence (settings, projects)
│   │   ├── AutosaveService.ts       # Debounced continuous autosave
│   │   ├── GitHubService.ts         # GitHub REST API client
│   │   ├── SyncService.ts           # Pull/push/merge orchestration
│   │   └── index.ts
│   │
│   ├── hooks/                       # React hooks — bridge between stores/services and UI
│   │   ├── useTheme.ts              # Active theme colors + spacing
│   │   ├── useEditor.ts             # Tab content + autosave integration
│   │   ├── useFileSystem.ts         # File tree + open file actions
│   │   ├── useGitHub.ts             # Auth + repository operations
│   │   ├── useVault.ts              # Credential vault access
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── BreezeButton.tsx     # Spring-animated, thumb-friendly button
│   │   │   ├── BreezeCard.tsx       # Glassmorphic surface card
│   │   │   └── LoadingIndicator.tsx # Breathing pulse animation
│   │   │
│   │   ├── editor/
│   │   │   ├── CodeEditor.tsx       # Main editor (TextInput + syntax overlay)
│   │   │   ├── SyntaxHighlighter.tsx # Tokenized code display
│   │   │   └── EditorTabs.tsx       # Open file tab strip
│   │   │
│   │   ├── explorer/
│   │   │   ├── FileExplorer.tsx     # Full file tree panel
│   │   │   └── FileTreeNode.tsx     # Recursive tree node component
│   │   │
│   │   └── onboarding/
│   │       ├── WelcomeAnimation.tsx # First-launch cinematic opening
│   │       └── OnboardingSlide.tsx  # Individual onboarding slide
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.tsx     # Guided first-use carousel
│   │   ├── HomeScreen.tsx           # Dashboard — greeting, quick actions, recent
│   │   ├── EditorScreen.tsx         # Explorer + editor workspace
│   │   ├── SettingsScreen.tsx       # Font size, word wrap, autosave, themes
│   │   ├── ThemesScreen.tsx         # Color palette selector
│   │   ├── VaultScreen.tsx          # AES-256 credential vault UI
│   │   └── SyncHistoryScreen.tsx    # GitHub sync timeline + pull/push
│   │
│   └── navigation/
│       ├── AppNavigator.tsx         # Root stack + Flow Tab navigator
│       └── types.ts                 # Type-safe route param lists
│
└── docs/
    └── ARCHITECTURE.md              # This document
```

---

## Data Flow

```
User Action
    │
    ▼
Component / Screen
    │
    ├── Read state from Zustand Store
    │
    └── Call Hook (useEditor, useGitHub, etc.)
             │
             ├── Dispatch to Zustand Store (synchronous UI update)
             │
             └── Call Service (async side effects)
                      │
                      ├── VaultService → expo-secure-store (encrypted)
                      ├── StorageService → expo-secure-store (settings)
                      ├── AutosaveService → debounced file writes
                      └── GitHubService → GitHub REST API (network)
```

---

## Security Architecture

### AES-256 Token Vault

```
User provides token
    │
    ▼
VaultService.storeSecret()
    │
    ├── Generate random 128-bit salt
    ├── Generate random 128-bit IV
    ├── Derive 256-bit key via PBKDF2 (100,000 iterations, SHA-256)
    ├── Encrypt with AES-256-CBC
    └── Store serialized EncryptedPayload in expo-secure-store
              (OS Keychain on iOS, Android Keystore on Android)
```

**Threat model:**
- If the device is stolen, encrypted blobs are inaccessible without the master key
- The master key is stored only in the OS secure enclave (Keychain/Keystore)
- During GitHub sync, tokens are decrypted in-memory only, never logged or persisted in plaintext
- All network requests use HTTPS; the GitHub API client adds the `token` header only at request time

---

## State Management

Zustand was chosen over Redux for its minimal boilerplate and excellent TypeScript support. Each store manages a distinct domain:

| Store | Domain | Key State |
|---|---|---|
| `editorStore` | Code editing | Open tabs, active tab, content, cursor, font size |
| `fileStore` | File system | File tree, selected file, expanded dirs |
| `authStore` | Authentication | User profile, repositories, current branch |
| `themeStore` | Theming | Active theme variant + colors |

Stores are **never** directly mutated by components. All mutations go through store actions. This creates a predictable, auditable data flow.

---

## Motion System

The Breeze motion system is built on three principles:

1. **Physics-based** — Springs mimic natural air currents; nothing is linear
2. **Purposeful** — Every animation communicates meaning (entrance, state change, feedback)
3. **Breathing** — The UI has a pulse; subtle pulsations remind the user to reset focus

### Spring Configurations

| Name | Damping | Stiffness | Mass | Use Case |
|---|---|---|---|---|
| `SpringSnappy` | 20 | 300 | 0.8 | Button presses, toggles |
| `SpringGentle` | 18 | 120 | 1.0 | Tab transitions, cards |
| `SpringFluid` | 22 | 90 | 1.2 | Page transitions, ripples |
| `SpringBreeze` | 15 | 60 | 1.5 | Hallmark motion — weightless |

---

## Offline Architecture

Apex Breeze treats offline as the primary mode, not a fallback:

1. **All file content** is written to `expo-secure-store` by `AutosaveService` after each pause in typing
2. **Project trees** are serialized and stored locally in `StorageService`
3. **Sync history** is stored locally and persists across sessions
4. **GitHub operations** gracefully fail with user-friendly error messages when offline

When connectivity is restored, the user can manually trigger a push from the Sync screen.

---

## Performance Considerations

- **No full-tree re-renders** — `FileTreeNode` components are memoized; only the changed subtree re-renders
- **Debounced autosave** — Content changes are batched with a 1.5s debounce; no per-keystroke storage writes
- **Lazy token loading** — `tokenize()` is called with `useMemo` and only runs when code changes
- **Optimistic UI** — State updates happen synchronously in Zustand before async operations complete

---

## Adding a New Language

1. Add keywords to `src/utils/syntaxTokenizer.ts`
2. Implement `tokenizeLineYourLang(line: string): Token[]`
3. Add the language to the `SupportedLanguage` union type
4. Map the file extension in `inferLanguage()`

---

## Adding a New Theme

1. Create a `ThemeDefinition` object in `src/store/themeStore.ts`
2. Add it to `AVAILABLE_THEMES`
3. The `ThemesScreen` will automatically pick it up

---

## Identity

> *"Apex Breeze does not demand you to be always on, always brilliant. It learns the rhythm of your doubt — the way your cursor hesitates before a refactor, the silence after a failed test — and holds that space with reverence, not judgment."*

Every line of code in this project is written with the intent of removing friction and adding meaning. It is a space where the chaos of problem-solving is organized into a serene landscape of possibility.

Built with 💙 for developers who deserve tools as fluid as their imagination.
