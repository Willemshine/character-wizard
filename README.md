# Character Wizard

A static web application for creating and managing tabletop RPG characters. Works on any static hosting provider (FTP upload, GitHub Pages, Netlify, etc.) - no server required.

## Features

- Create characters using a step-by-step wizard
- Component-based UI with Lit Web Components
- Hash-based routing for static hosting compatibility
- Central state management with pub/sub pattern
- Local persistence using IndexedDB
- Modular content packs (JSON-based)
- Export/import characters as JSON
- Fully offline capable after initial load

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd character-wizard

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The development server will start at `http://localhost:5173` (or next available port).

### Build for Production

```bash
# Build static files
npm run build
```

This creates a `dist/` folder with all static files ready for deployment.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Deployment (FTP/Static Hosting)

### FTP Upload

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist/` folder to your web server via FTP:
   - `index.html`
   - `assets/` folder (contains JS, CSS bundles)
   - `packs/` folder (contains module JSON files)

3. That's it! The app works entirely client-side.

### GitHub Pages

1. Build the project
2. Push the `dist/` folder contents to your `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Netlify / Vercel

Simply connect your repository - these platforms will automatically detect the Vite configuration and build correctly.

## Project Structure

```
character-wizard/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (button, card)
│   │   └── app-root.ts  # Main app shell with routing
│   ├── pages/           # Page components
│   │   ├── start-page.ts
│   │   ├── wizard-page.ts
│   │   ├── options-page.ts
│   │   └── character-page.ts
│   ├── router/          # Hash-based client-side router
│   ├── store/           # Central state management
│   ├── services/        # Data services
│   │   ├── persistence.ts   # IndexedDB storage
│   │   └── pack-loader.ts   # Module pack loading
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global CSS
│   └── main.ts          # Entry point
├── public/
│   └── packs/           # JSON module packs
├── schemas/             # JSON schemas for validation
├── dist/                # Built static files (after build)
└── package.json
```

## Routes

| Route | Path | Description |
|-------|------|-------------|
| Start | `#/` | Home page with character list |
| Wizard | `#/wizard` | Character creation wizard |
| Options | `#/options` | Module pack management |
| Character | `#/character?id=<id>` | Character sheet view |

## Module Packs

Character Wizard uses JSON module packs to provide races, classes, backgrounds, and other content. This makes it easy to add custom content without modifying the code.

### Built-in Packs

- `core.json` - Basic races, classes, and backgrounds

### Adding Custom Packs

1. Create a JSON file following the module pack schema (see `schemas/module-pack.schema.json`)
2. Upload via the Options page in the app
3. Enable/disable packs as needed

### Pack Structure

```json
{
  "id": "my-pack",
  "name": "My Custom Pack",
  "version": "1.0.0",
  "description": "Custom content pack",
  "races": [...],
  "classes": [...],
  "backgrounds": [...]
}
```

See `schemas/module-pack.schema.json` for full schema documentation.

## Data Storage

All data is stored locally in the browser using IndexedDB:

- **Characters** - Full character data with all stats
- **Module metadata** - Which packs are enabled
- **Uploaded packs** - Custom module packs uploaded by user
- **Settings** - Last opened character, preferences

### Exporting Data

Characters can be exported as JSON files from the character sheet page. These files follow the schema in `schemas/character.schema.json`.

### Importing Data

Import character JSON files via the character creation flow or directly load them as module packs with character data.

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## Technology Stack

- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **UI Framework**: Lit 3 (Web Components)
- **Storage**: IndexedDB via idb library
- **Routing**: Custom hash-based router
- **State**: Custom pub/sub store

## Browser Support

Supports all modern browsers:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT
