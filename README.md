# @sudobility/seo_lib

React component library providing SEO (Search Engine Optimization) and AEO
(Answer Engine Optimization) building blocks: meta-tag components, Schema.org
structured-data generators, semantic HTML elements with ARIA accessibility, SEO
hooks, and a worker-safe Cloudflare Pages prerender-injection middleware.

ESM-only. Published to **GitHub Packages** under the `@sudobility` scope.

## Installation

Because the package lives on GitHub Packages, the installing project needs an
`.npmrc` that maps the `@sudobility` scope to that registry:

```
@sudobility:registry=https://npm.pkg.github.com
```

Then:

```bash
bun add @sudobility/seo_lib
```

### Peer Dependencies

Required:

- `react` `^18.0.0 || ^19.0.0`
- `react-dom` `^18.0.0 || ^19.0.0`
- `react-helmet-async` `>=2.0.0`

Optional (only needed for `SEOHead` / `usePageSEO` route-aware helpers):

- `react-i18next` `>=14.0.0`
- `i18next` `>=23.0.0`
- `react-router-dom` `>=6.0.0`

## Usage

```tsx
import { SEO, AIMeta, Main, Article, Section, Nav } from '@sudobility/seo_lib';
import { generateAdvancedSEO, createWeb3ProductSchema } from '@sudobility/seo_lib';

// SEO meta tags via react-helmet-async
<SEO title="Page Title" description="Description" canonical="/page" ogType="website" />

// AI-specific meta tags
<AIMeta contentType="documentation" summary="API docs" complexity="intermediate" />

// Semantic HTML with ARIA
<Main><Article><Section>Content</Section></Article></Main>

// Structured data generation
const seo = generateAdvancedSEO({ title, description, keywords, branding });
// Returns: { structuredData, openGraph, twitterCard, aiMetaTags, jsonLD }
```

### Route-aware SEO (requires the optional peers)

```tsx
import { SEOHead, SEOHeadProvider, usePageSEO } from '@sudobility/seo_lib';

// Wrap the app once with shared config (appName, baseUrl, languages, …)
<SEOHeadProvider value={seoConfig}>
  {/* Per route, pages supply localized content only: */}
  <SEOHead title={title} description={description} structuredData={[schema]} />
</SEOHeadProvider>
```

`SEOHead` derives the canonical URL and language from the current route and
delegates all DOM writes to `usePageSEO`. `usePageSEO` / `useSEOUpdate` write
`document.title` and meta tags directly to the DOM — a workaround for
react-helmet-async v2 not reliably updating under React 19.

## Subpath exports

| Import | Contents |
|--------|----------|
| `@sudobility/seo_lib` | Components, hooks, and utilities (the main entry) |
| `@sudobility/seo_lib/middleware` | `createSeoMiddleware()` — worker-safe (no React) Cloudflare Pages `onRequest` handler that injects committed prerender snapshots into the live `index.html` shell |

## API

### React Components

| Component | Description |
|-----------|-------------|
| `SEO` | Full SEO: title, meta, OG, Twitter Card, JSON-LD via Helmet |
| `SEOHead` / `SEOHeadProvider` | Route-aware per-page SEO (needs i18next + react-router-dom) |
| `AIMeta` | AI-specific meta tags (content-type, summary, complexity) |
| `AITrainingEnhancer` | Wrapper for AI training content enhancement |

### Hooks

| Hook | Description |
|------|-------------|
| `usePageSEO(data, config)` | Writes title, meta, canonical, og/twitter, hreflang, and JSON-LD to the DOM |
| `useSEOUpdate(options)` | Force-updates `document.title` + meta tags when in-page selection changes |

### Semantic HTML (20+ components)

`Main`, `Article`, `Section`, `Nav`, `Header`, `Footer`, `Aside`, `Figure`,
`H1`-`H4`, `OrderedList`, `UnorderedList`, `SemanticButton`, `SemanticLink`,
`SkipLink`, `SearchRegion`, `BannerRegion`, `ComplementaryRegion`,
`SemanticForm`, `SemanticInput`, `SemanticLoading`, `ScreenReaderOnly`

### Utility Functions

| Function | Description |
|----------|-------------|
| `generateAdvancedSEO(config)` | All-in-one structured data, OG, Twitter, AI meta |
| `createWeb3ProductSchema(config)` | Schema.org SoftwareApplication (alias of `createWebApplicationSchema`) |
| `createTechnicalArticleSchema(config)` | Schema.org TechnicalArticle |
| `createEnhancedFAQSchema(faqs, branding)` | Schema.org FAQPage |
| `createAIOptimizedSchema(config)` | Schema.org WebPage tuned for AI/LLM crawlers |
| `buildOrganizationSchema(config)` | Schema.org Organization |
| `buildSoftwareApplicationSchema(config)` | Schema.org SoftwareApplication (generic) |
| `buildHowToSchema(name, description, steps)` | Schema.org HowTo |
| `generateAIMetadata(config)` | LearningResource schema.org object |
| `generateConceptGraph(concepts)` | Concept graph with nodes and edges |
| `createSemanticHeading(config)` | SEO-optimized heading element (h1-h6) |
| `validateHeadingStructure(headings)` | Validates heading hierarchy |
| `isNonProductionHost()` | True on localhost/preview/staging hosts (auto-noindex) |

### Presets

`pageSEOConfigs` (homepage, documentation, earnPoints), `AI_TRAINING_CONFIGS`,
`WEB3_CONCEPTS`, `WEB3_HEADING_PATTERNS`, `WEB3_EMAIL_HEADINGS`

> Note: many schema generators and presets ship hardcoded Web3 email-platform
> content. Supply your own `branding` config and override preset content.

## Development

```bash
bun install          # Install dependencies
bun run build        # Vite library build + tsc declarations + fix-esm-imports
bun run dev          # Vite build in watch mode
bun run clean        # Remove dist/
bun run test:unit    # Run Vitest once (--passWithNoTests)
bun run test:watch   # Vitest watch mode
bun run lint         # ESLint on src/
bun run lint:fix     # ESLint auto-fix
bun run type-check   # TypeScript check (tsc --noEmit)
bun run format       # Prettier write
bun run format:check # Prettier check (no write)
bun run verify       # lint + type-check + test:unit
```

Pre-publish / pre-commit:

```bash
bun run verify
```

## License

BUSL-1.1
