# fylepad - AI Coding Assistant Guide

## Project Overview
**fylepad** is a Markdown-based rich text editor built as a Nuxt 3 web app with Tauri desktop integration. It's a multi-tab notepad featuring TipTap editor extensions, auto-save, PDF/Markdown export/import, and support for diagrams (Mermaid, PlantUML), math blocks (KaTeX), and code blocks with syntax highlighting.

## Tech Stack
- **Framework**: Nuxt 3 (SSG mode, `ssr: false`) + Vue 3 Composition API
- **Desktop**: Tauri v1 (Rust backend) with filesystem API
- **Editor**: TipTap v2 with custom extensions and nodes
- **State**: Pinia stores + reactive tabs state in `pages/index.vue`
- **Styling**: Tailwind CSS + `tailwind-merge` for dynamic classes
- **Build**: pnpm + Vite
- **Markdown**: Custom TipTap Markdown extension with `unified`/`remark` plugins

## Architecture Patterns

### 1. TipTap Extension System
All editor functionality lives in `extensions/` using TipTap's Extension API:

**Custom Nodes** (`extensions/nodes/`):
- `tabLink.ts`: Internal cross-tab references using `[[tab-id]]` syntax
- `mermaid.ts`, `plantuml.ts`, `math.ts`: Block-level diagram/math nodes
- `embed.ts`: External embeds

**Custom Extensions**:
- `markdown/index.ts`: Bidirectional Markdown parser/serializer using unified pipeline
- `search&replace.ts`: Full-text search with case sensitivity toggle
- `hyperlink.ts`: Enhanced link handling with modal UI
- `block-menu/`: Slash command menu (`/` triggers) with items in `items.ts`
- `tab-link/`: Suggestion dropdown for `[[` tab links

**Pattern**: Each extension exports via `Extension.create()`, `Node.create()`, or `Mark.create()`. Custom storage via `addStorage()`, commands via `addCommands()`.

### 2. Tab-Based State Management
`pages/index.vue` is the central controller:

```typescript
// Tabs are reactive, stored in localStorage + Tauri filesystem
const tabs = reactive<Tab[]>([...]);
const activeTab = ref(0);

// TabData interface in types/tab.ts
interface TabData {
  id: string;
  title: string;
  content: any; // TipTap JSON
  color?: string;
  lock: boolean;
  group?: string;
}
```

**Key behaviors**:
- Auto-save on content/title change → `localStorage` + Tauri `writeTextFile`
- Drag-and-drop reordering with native HTML5 DnD API
- Context menu for tab actions (color, duplicate, lock)
- Horizontal/vertical layout toggle (`isVerticalTabs`)

### 3. Component Patterns

**Editor Component** (`components/editor.vue`):
- Props: `title`, `content`, `tabs`, `activeTabIndex`
- Emits: `@update:title`, `@update:content`, `@switchToTab`
- Initializes TipTap editor with ~40 extensions
- Manages search UI, import/export, AI editing integration

**UI Components** (`components/ui/`):
- Built on `reka-ui` (headless) + Tailwind
- `bubbleMenu.vue`: Floating text formatting toolbar
- `floatingMenu.vue`: Block-level menu (appears on empty lines)
- `draggableTabs.vue`: Tab bar with drag support
- `tabContextMenu.vue`: Right-click menu for tabs

### 4. Markdown Serialization
Custom implementation in `extensions/markdown/`:
- **Parser** (`parser/state.ts`): Converts Markdown → TipTap JSON using `remark-parse`
- **Serializer** (`serializer/state.ts`): TipTap JSON → Markdown using `remark-stringify`
- **Hooks**: Extensions register custom handlers via `markdown.hooks.beforeInit`

Example: Mermaid diagrams serialize to ` ```mermaid` code blocks.

### 5. Tauri Integration
Desktop-specific features in `src-tauri/`:
- File system operations: `readTextFile`, `writeTextFile` in `@tauri-apps/api/fs`
- Fallback to `localStorage` if Tauri unavailable (web version)
- Build commands: `pnpm tauri dev`, `pnpm tauri build`

## Development Workflows

### Running the App
```bash
# Web dev server (port 3000)
pnpm dev

# Tauri desktop dev (opens native window)
pnpm tauri:dev

# Build for production
pnpm tauri:build
```

### Creating TipTap Extensions
1. Create in `extensions/` directory
2. Export via `Extension.create()` or `Node.create()`
3. Register in `components/editor.vue` (search for `useEditor()` hook)
4. Add to block menu if user-facing (`extensions/block-menu/items.ts`)

Example structure:
```typescript
export const MyExtension = Extension.create({
  name: 'myExtension',
  addStorage() { return {}; },
  addCommands() {
    return {
      doSomething: () => ({ commands }) => {
        // implementation
      }
    };
  }
});
```

### Adding Commands to Block Menu
Edit `extensions/block-menu/items.ts`:
```typescript
{
  id: "myCommand",
  name: "Display Name",
  icon: `<svg>...</svg>`, // Notion-style icon
  keywords: "search terms",
  action: (editor) => editor.chain().focus().myCommand().run()
}
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `pages/index.vue` | Main app controller, tab state, drag/drop |
| `components/editor.vue` | TipTap editor wrapper (1500+ lines) |
| `extensions/markdown/index.ts` | Markdown parser/serializer |
| `extensions/tab-link/` | Cross-tab reference system |
| `utils/editor.ts` | Table manipulation helpers |
| `stores/focus.ts` | Focus mode state (Pinia) |
| `nuxt.config.ts` | Nuxt + Tauri integration config |

## Conventions

### Styling
- Use `clsx()` or `tailwind-merge` for conditional classes
- Dark mode via `@nuxtjs/color-mode` (check `colorMode.value`)
- Consistent rounded borders: `rounded-xl`, `rounded-2xl`
- Drop shadows for buttons: `drop-shadow-sm`

### State Mutations
- Direct mutation of `tabs` array is fine (Vue 3 reactive)
- Emit events up from editor to page component
- Use Pinia only for cross-component state (focus mode)

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Type editor commands in extension `Commands<ReturnType>` interface
- TipTap node attributes must have `parseHTML` + `renderHTML`

### File Naming
- Vue components: PascalCase (e.g., `TabContextMenu.vue`)
- Extensions: camelCase (e.g., `tabLink.ts`)
- UI components: Nested under `ui/` with descriptive names

## Common Tasks

### Adding a New Diagram Type
1. Create node in `extensions/nodes/` (see `mermaid.ts` as template)
2. Add rendering logic (likely iframe or server-side)
3. Register in editor + block menu
4. Add Markdown serialization hook

### Modifying Tab Behavior
Check `pages/index.vue` functions:
- `closeTab()`, `duplicateTab()`, `lockTab()`
- Drag handlers: `onTabDragStart()`, `onTabDrop()`
- Context menu: `showContextMenu()`

### Extending Search
Edit `extensions/search&replace.ts`:
- Storage holds `searchTerm`, `results`, `resultIndex`
- UI in `components/editor.vue` (search for `showSearch`)

## External Dependencies
- **AI Integration**: `openai` package for AI editing features (see `server/api/ai-edit.ts`)
- **Diagrams**: Mermaid (client-side), PlantUML (via encoder)
- **Math**: KaTeX for rendering
- **Syntax**: Lowlight (highlight.js wrapper)

## Testing Notes
- No formal test suite currently
- Manual testing: `pnpm dev` for web, `pnpm tauri:dev` for desktop
- Check both light/dark themes
- Test markdown export/import round-trip
