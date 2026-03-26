# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Vite + HMR)
pnpm build      # Type-check (tsc -b) then bundle (vite build)
pnpm lint       # Run ESLint
pnpm preview    # Preview production build locally
```

> This project uses **pnpm** as the package manager.

## Stack

- **React 19** + **TypeScript 5** (strict mode)
- **Vite 8** with `@vitejs/plugin-react` (Oxc transformer)
- No routing, state management, or API layer yet — these need to be added

## TypeScript Configuration

Two tsconfig files via project references:
- `tsconfig.app.json` — app source code (target ES2023, strict, `noUnusedLocals`, `noUnusedParameters`)
- `tsconfig.node.json` — Vite config only

## Environment Variables

No `.env` files exist yet. Vite env vars must be prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`.

## Notes on ESLint

Config is in `eslint.config.js` using the flat config format. Includes `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`. The README notes that `eslint-plugin-react-x` and `eslint-plugin-react-dom` are optional additions worth considering for production.
