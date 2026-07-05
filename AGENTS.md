See [README.md](./README.md) for project overview, commands, architecture, routes, and tech stack.

## Component Structure

Components that need more than one file become a folder with a barrel export:

```
ScannerSidePanel/
  index.tsx                  ← barrel: `export { ScannerSidePanel } from "./ScannerSidePanel"`
  ScannerSidePanel.tsx       ← named export matches filename
  constants.ts               ← module-level constants
  components/                ← subcomponents (recursive pattern)
    ScannerSidePanelBody.tsx
    RecentAlertsList.tsx
```

- `index.tsx` is always a thin re-export barrel, never the implementation
- The main component file is named after the component (e.g. `ScannerSidePanel.tsx`)
- Subcomponents live in `components/` following the same pattern
