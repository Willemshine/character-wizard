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

**Productvisie, Epics en userstories**
1) Productvisie en scope (MVP → v1)

Doel: een web-based D&D 5e character builder die:

2014 én 2024 ondersteunt (met edition-gebonden regels/content)

volledig client-side draait (geen accounts, geen server database)

export/import via bestand (JSON) doet

eindigt met een editbaar character-overview + print/PDF-friendly sheet

uitbreidbaar is via modules (officiële supplementen binnen je content-policy + homebrew packs)

Belangrijk ontwerpprincipe:
Alles wat “regels/content” is (rassen, classes, spells, equipment, backgrounds, features) zit in data packs. De app is vooral een rules engine + UI wizard + sheet renderer.

2) Epics + user stories (met acceptatiecriteria)
Epic A — Startscherm & Navigatie

US-A1: Startscherm met 3 routes
Als gebruiker wil ik een startscherm met:

Start wizard (primair)

Upload character (primair)

Options/modules (secundair)

Acceptatiecriteria

3 knoppen zichtbaar, duidelijk gelabeld

“Start wizard” start altijd een nieuwe character state

“Upload character” accepteert .json (en eventueel .dndchar.json)

“Options” toont module manager + upload custom module

Epic B — Wizard flow (jouw stappen 1–11)

Ik zet ze om in stories per stap, zodat je agent ze in kleine PR’s kan bouwen.

US-B1: Edition kiezen
Als gebruiker wil ik 2014 of 2024 kiezen zodat alle volgende keuzes en regels daarop aansluiten.

AC

Edition is verplicht

Alle content-lijsten filteren op edition + geactiveerde modules

In state staat edition: "2014" | "2024"

US-B2: Starting level kiezen
Als gebruiker wil ik een starting level kiezen zodat class features/spells/proficiency scaling klopt.

AC

Level 1–20

Level beïnvloedt: proficiency bonus, class features, spell slots/known/prepared (voor zover je dat modelleert), HP berekening (minimaal level 1 correct)

US-B3: Race/Species kiezen
AC

Lijst gefilterd op edition/modules

Subrace/species options worden dynamisch getoond

Racial ability-score rules worden toegepast volgens gekozen edition (belangrijk verschilgebied!)

US-B4: Class + Subclass kiezen
AC

Class bepaalt hit die, proficiencies, spellcasting, starting equipment options

Subclass pas zichtbaar vanaf het level waarop die relevant wordt (verschilt per class/edition)

Wizard blokkeert niet als subclass nog niet van toepassing is

US-B5: Background kiezen + invullen/rollen
AC

Background geeft proficiencies, languages/tools, en “background features/traits” (wat je wil opslaan)

“Roll/random” vult personality/ideal/bond/flaw (en eventueel naam/appearance) met seedable randomness

US-B6: Ability scores (roll / point buy / standard array / handmatig)
AC

Keuze tussen methodes

Live validatie (bv. totaal, maximums)

Final ability mods worden berekend incl. bonuses (edition-aware)

US-B7: Remaining proficiencies kiezen
AC

UI toont: “krijg je al” vs “nog te kiezen”

Duplicates voorkomen (of automatisch omzetten naar alternatieven waar regels dat toestaan)

Keuze logic komt uit data pack regels (niet hardcoded)

US-B8: Equipment kiezen
AC

Starting equipment opties per class/background

UI als keuzegroepen (“Kies A of B”)

Output is een concrete inventory list met quantities + eventuele pack contents

US-B9: Optionele traits/choices (race/class)
AC

Wizard toont alleen keuzes die relevant zijn (op basis van eerdere keuzes + level)

Elke keuze heeft constraints (choose 1 of N, prerequisites)

US-B10: Spells kiezen
AC

Alleen spells uit geactiveerde modules + juiste edition

Filter/search (naam, level, school, ritual, casting time)

Class spell list restricties + level restricties

Ondersteun zowel “known” als “prepared” modellen (minimaal opslaan wat gekozen is; regels engine kan later strenger)

US-B11: Review screen
AC

Overzicht van alle keuzes

Validatie: ontbrekende verplichte velden highlighten

“Afronden” maakt character “complete” en gaat naar overview

Epic C — Character overview (stap 12)

US-C1: Editbare character overview
Als gebruiker wil ik na afronden alles kunnen aanpassen zonder de wizard opnieuw te doorlopen.

AC

Tabs: Basics / Abilities / Proficiencies / Features / Spells / Equipment / Notes

Wijzigingen herberekenen derived stats (AC, mods, saves, skills, proficiency bonus, passive perception, etc. minimaal de basics)

Duidelijke “inconsistentie waarschuwingen” (bv. spells geselecteerd maar class is veranderd)

US-C2: Export/Import JSON
AC

Export downloadt character.json met schema versioning

Import laadt hetzelfde en herstelt state + geselecteerde modules + edition

Backwards-compat: schema version veld + migrators

US-C3: Print/PDF view
AC

Print-friendly pagina (A4) met CSS @media print

Eén knop “Download PDF” mag in v1 ook simpelweg “Open print view” zijn (gebruikers kunnen “Save as PDF” doen)

Sheet bevat kern: ability scores, saves, skills, HP, AC, attacks, equipment, features, spells summary

Epic D — Modules & Templates (options route)

US-D1: Module manager
AC

Lijst met modules (core + supplement packs)

Toggle enable/disable per module

Conflicten detecteren (zelfde id, andere versie) → waarschuwing

US-D2: Upload custom module (template)
AC

Upload JSON module pack met manifest + content

Validatie tegen schema (toon errors)

Module blijft beschikbaar via local storage (of IndexedDB) totdat user browserdata wist

Export module pack optie (om te delen)

3) Werkprompts voor je coding agent (vibe-coding, iteratief)

Hier zijn prompts die je per “PR/iteration” kunt gebruiken. Ze zijn expres heel concreet, zodat een code-agent zelfstandig kan bouwen.

Prompt 0 — Repo bootstrap (architectuur + tooling)

Doel: een statische webapp die je via FTP kunt hosten.

Werkprompt

Maak een nieuwe repo met een statische webapp setup (geen server vereist).

Eisen:

Works on static hosting (FTP upload): pure HTML/CSS/JS build output.

TypeScript.

Component-based UI.

Routing: / start, /wizard, /options, /character.

State management: één centrale store.

Data packs: laad JSON uit /packs/*.json.

Local persistence: localStorage of IndexedDB voor (a) last opened character, (b) enabled modules, (c) uploaded modules.

Voeg docs toe: README.md met lokaal runnen + build + deploy (FTP).

Voeg schemas/ toe met JSON schema’s voor character export en module packs.

(Als je agent moet kiezen: kies voor een setup die “static export” ondersteunt en makkelijk te deployen is.)
