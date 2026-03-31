# Global Search

`global-search` is a React command palette and global search component with:

- scoped search across menu items, records, and actions
- keyboard shortcuts and recent searches
- animated modal interactions
- a local demo app for testing before publishing

## Project Shape

- `src/index.ts`: library entry for npm builds
- `src/lib/global-search`: component, types, and mock data
- `src/app.tsx` and `src/main.tsx`: local demo playground
- `src/components/ui`: only the UI primitives the library actually uses

## Scripts

- `npm run dev`: run the local demo app
- `npm run build`: generate the npm-ready library bundle in `dist/`
- `npm run build:demo`: build the local demo app
- `npm run preview`: preview the demo build
- `npm run check`: run Biome checks

## Library Output

`npm run build` produces:

- `dist/index.js`: ESM entry
- `dist/index.cjs`: CommonJS entry
- `dist/index.d.ts`: root type declarations
- `dist/styles.css`: packaged stylesheet

React and React DOM are exposed as peer dependencies. The library entry imports the packaged CSS so modern bundlers can pick it up automatically, and `./styles.css` is also exported explicitly for manual imports.

## Usage

```tsx
import { GlobalSearch } from 'global-search';
import 'global-search/styles.css';
```

```tsx
<GlobalSearch
  scopes={scopes}
  actions={actions}
  menuItems={menuItems}
  records={records}
  recentSearches={recentSearches}
  onSelect={(selection) => {
    console.log(selection);
  }}
/>
```

If you want remote, permission-aware search later, pass `apiKey` and `onSearch` instead of relying only on local mock data.

## Maintenance Notes

- The repo is library-first now. Old dashboard/auth/routes/services code has been removed.
- The demo app exists only to exercise the package locally.
- Keep new work inside `src/lib/global-search` unless it is truly demo-only.
