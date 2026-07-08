# Seodit Next Example

Minimal Next.js + next-intl app that demonstrates `@sargonpiraev/seodit/next` with colocated Playwright SEO specs.

## Routes

- `/[locale]`
- `/[locale]/anime`
- `/[locale]/anime/[malId]` with fixture `malId=1`

## Run

From the repository root:

```bash
npm install
npm run build -w @sargonpiraev/seodit
npm test -w seodit-next-example
```

The Playwright project builds the app, reads `.next/app-path-routes-manifest.json`, infers route patterns from colocated `page.seodit.spec.ts` files, and runs SEO assertions.
