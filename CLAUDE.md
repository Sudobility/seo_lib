# seo_lib - AI Development Guide

> **Git policy — never auto-commit or auto-push.** Leave work in the working tree.
> Run `git commit`, `git push`, or `gh pr create` **only when the user explicitly
> asks in that turn**. Finishing a task is not permission to commit it.

## Overview

`@sudobility/seo_lib` is a React component library of SEO/AEO building blocks:
meta-tag components, Schema.org structured-data generators, semantic HTML
elements with ARIA, SEO hooks, and a worker-safe Cloudflare Pages middleware.
Much of the preset/schema content is Web3 email-platform specific.

- Package: `@sudobility/seo_lib` · License: BUSL-1.1 · ESM only
- Package manager: **Bun** (always use `bun`, not npm/yarn)
- Published to **GitHub Packages** (`npm.pkg.github.com`), `@sudobility` scope
  (see `.npmrc`). Installing projects need the same scope→registry mapping.
- CI publishes via `johnqh/workflows/.github/workflows/unified-cicd.yml@main`.

## Commands

```bash
bun run build        # vite build + tsc -p tsconfig.build.json + scripts/fix-esm-imports.mjs
bun run dev          # vite build --watch
bun run type-check   # tsc --noEmit
bun run lint         # eslint src/   (lint:fix to autofix)
bun run format       # prettier --write (format:check to verify)
bun run test:unit    # vitest run --passWithNoTests   (test:watch for watch)
bun run verify       # lint + type-check + test:unit   <-- run before committing
```

There is **no `test` script** — use `test:unit`. `verify` is the combined gate.

## Source layout

```
src/
├── index.ts                 # entry: re-exports components/, hooks/, utils/
├── components/              # SEO, SEOHead(+Context), AIMeta, AITrainingEnhancer, SemanticHTML
├── hooks/                   # usePageSEO, useSEOUpdate
├── utils/                   # advancedSEO, aiTrainingMetadata, seo-headings,
│                            #   schemas, howToSchema, seoHost
├── middleware/index.ts      # Cloudflare Pages SEO-injection middleware (no React)
└── test/setup.ts            # vitest: jest-dom, react-helmet-async mock, window.location mock
```

Tests are co-located as `*.test.ts(x)`. Barrels (`index.ts`) re-export with
named `export *`; some util files also have an object default export, but the
barrels use the named exports.

## Build pipeline

- **Vite** library mode with **two entries** → `dist/index.js` and
  `dist/middleware.js` (ES format, source maps, no minify).
- Externals (not bundled): `react`, `react-dom`, `react/jsx-runtime`,
  `react-helmet-async`, `react-i18next`, `i18next`, `react-router-dom`.
- Declarations: `vite-plugin-dts` during the Vite build, plus a separate
  `tsc -p tsconfig.build.json` (`emitDeclarationOnly`).
- **`scripts/fix-esm-imports.mjs`** is a required post-build step: tsc emits
  extensionless/relative specifiers (`moduleResolution: "bundler"`) that Node's
  native ESM loader rejects; this script rewrites them to explicit `.js` paths.
  It is idempotent and dependency-free. Don't drop it from the `build` script.

## Subpath export: `/middleware`

`@sudobility/seo_lib/middleware` exports `createSeoMiddleware()`, a Cloudflare
Pages `onRequest` handler. For document navigations it injects a committed,
pre-rendered snapshot (`/html/<route>/index.html`, markers `<!--PRERENDER-HEAD-->`
/ `<!--PRERENDER-BODY-->`) into the LIVE hashed-asset shell, so snapshots never
reference bundle hashes and never go stale. App-specific URL rules plug in via
the `rewrite` option instead of forking the file. It is worker-safe — no React,
no DOM libs; it declares the Cloudflare `HTMLRewriter` global itself.

## Conventions / key facts

- Components are `React.FC<Props>` with named exports; `<head>` writers use
  `react-helmet-async`'s `<Helmet>`. Semantic HTML components apply Tailwind
  utility classes.
- Util functions return plain objects (JSON-LD / meta-tag maps), not React —
  except `createSemanticHeading` which returns `React.createElement(...)`.
- SSR-safe: code guards `typeof window` before touching `window.location`
  (e.g. `getCurrentPathname()`, `isNonProductionHost()`).
- TypeScript strict, `moduleResolution: bundler`, path alias `@/* → ./src/*`.
  Two tsconfigs: `tsconfig.json` (dev, `noEmit`) / `tsconfig.build.json`
  (`emitDeclarationOnly`).
- ESLint flat config: Prettier-as-error, `no-explicit-any` off, `_`-prefixed
  unused vars ignored, sorted imports; test files get relaxed rules. Prettier:
  single quotes, es5 trailing commas, width 80, 2-space, LF, no-paren arrows.

## Gotchas

- **React 19 + react-helmet-async v2**: Helmet does not reliably update meta
  tags on re-render. `usePageSEO` / `useSEOUpdate` write to the DOM directly as
  the workaround — `SEOHead` uses `usePageSEO`, not Helmet.
- **Tests mock `react-helmet-async`** so `<Helmet>` renders children inline;
  assertions check rendered DOM, not real `<head>` changes.
- **Non-deterministic output**: `SemanticInput` auto-IDs and
  `createEnhancedFAQSchema` upvote counts use `Math.random()`. Pass an explicit
  `id` in tests; avoid snapshotting FAQ schema.
- **`AIMeta` renders only 3 tags** (`ai:content-type`, `ai:summary`,
  `ai:complexity`) despite `AIMetaProps` defining many more fields.
- **`SEOHead`/`usePageSEO` need the optional peers** (`react-i18next`,
  `i18next`, `react-router-dom`); the core components/utils do not.

## Common tasks

- New component → add in `src/components/`, export from `components/index.ts`,
  add co-located test, run `bun run verify`.
- New util → add/extend in `src/utils/`, export from `utils/index.ts`, test.
- New structured-data schema → follow existing generators in `advancedSEO.ts`
  (or the generic builders in `schemas.ts`); barrel `export *` covers it.
- Publishing → bump `version` in `package.json`; CI publishes on push. Local
  `prepublishOnly` runs `build`.
