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
- **react-router-dom v7** — BrowserRouter, rotas em `src/App.tsx`
- **@tanstack/react-query v5** — QueryClient configurado em `src/main.tsx`
- **axios** — cliente HTTP em `src/api/client.ts`
- **zod v4** — schemas em `src/schemas/`
- **react-hook-form** + **@hookform/resolvers** — formulários (ainda não implementados nas páginas)

## TypeScript Configuration

Two tsconfig files via project references:

- `tsconfig.app.json` — app source code (target ES2023, strict, `noUnusedLocals`, `noUnusedParameters`)
- `tsconfig.node.json` — Vite config only

## Environment Variables

- `VITE_API_URL` — base URL do backend (default: `https://localhost:54732`)
- Criar `.env.local` para sobrescrever localmente.

## Architecture

```text
src/
├── types/          # DTOs e tipos TypeScript (transaction.ts, category.ts)
├── api/            # client.ts (axios) + transactions.ts + categories.ts
├── schemas/        # Zod schemas para validação de formulários
├── hooks/          # TanStack Query hooks (useTransactions, useCategories, etc.)
├── components/
│   ├── ui/         # Primitivos reutilizáveis (Button, Input, Badge) — a criar
│   └── shared/     # Sidebar, TopBar, StatCard, BarChart, DonutChart,
│                   # TransactionTable, CategoryPanel
├── pages/
│   ├── Dashboard/  # index.tsx — cards de saldo, gráficos, últimas transações
│   └── Transactions/ # index.tsx — tabela filtrável por tipo
└── theme.ts        # Tokens de cor, radius e spacing (usar sempre, nunca hardcodar)
```

### Rotas

| Path            | Componente                        |
|-----------------|-----------------------------------|
| `/`             | `DashboardPage`                   |
| `/transacoes`   | `TransactionsPage`                |
| `/categorias`   | `TransactionsPage` (placeholder)  |
| `/receitas`     | `TransactionsPage` (placeholder)  |
| `/configuracoes`| `PlaceholderPage`                 |

### API contract

Todos os endpoints retornam `{ data: T, requestId: string }`.
O interceptor de resposta em `client.ts` extrai `{ message, requestId }` nos erros.

### Estilização

- **Sem Tailwind instalado como plugin** — usar inline styles + tokens de `src/theme.ts`.
- Gráficos feitos com SVG puro (sem biblioteca de charts).
- Mock data dentro dos próprios componentes `BarChart` e `DonutChart` — substituir quando o backend estiver pronto.

## Screenshot Workflow

- `pnpm dev` sobe na porta padrão do Vite (normalmente 5173).
- Puppeteer instalado globalmente: `C:/nvm4w/nodejs/node_modules/puppeteer`
- Para tirar screenshot manualmente:

  ```js
  const puppeteer = require('C:/nvm4w/nodejs/node_modules/puppeteer');
  // ... launch, goto, screenshot
  ```

- Salvar em `./temporary screenshots/screenshot-N-label.png`
- `serve.mjs` e `screenshot.mjs` **não existem** neste projeto — usar o dev server do Vite diretamente.

## API Inspection

- Antes de escrever código que dependa do contrato de um endpoint, use `curl` via Bash para inspecionar a resposta real.
- O backend corre em `https://localhost:54732` (ou o valor de `VITE_API_URL`).
- Exemplo: `curl -sk https://localhost:54732/v1/transactions`
- Isso evita erros de tipo como enums numéricos vs strings, wrappers de resposta inesperados, etc.

## Always Do First

- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images

- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Brand Assets

- Always check the `brand_assets/` folder before designing.
- Logo: `brand_assets/ordin-logo.png` (hexagonal dots + texto "ORDIN")
- Paleta: tons de verde escuro — ver `src/theme.ts` para valores exatos.

## Anti-Generic Guardrails

- **Colors:** Nunca usar paleta default do Tailwind. Usar tokens de `src/theme.ts`.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Spacing:** Usar tokens de `src/theme.ts` — não inventar valores.

## Hard Rules

- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it unless specified
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- In dashboard layouts, cards that share the same row must keep the same visual height; avoid any row-level misalignment between cards such as the bar chart and donut card.
- Standardize card title typography across comparable dashboard cards; chart and summary card titles should not drift in size or hierarchy unless explicitly requested.
