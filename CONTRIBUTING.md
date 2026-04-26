# Contributing

Thanks for helping improve `pixu-dev-resume`.

## Local Setup

```sh
pnpm install
pnpm dev
```

The site is generated from `content/resume.md`, public profile data, and files in `src`.

## Checks

Run these before opening a pull request:

```sh
pnpm build
pnpm test
```

`pnpm build` regenerates favicon assets, formats code, runs lint checks, builds with Vite, and writes `dist`.

## Content Rules

- Keep content in English unless a proper noun requires another language.
- Use straight quotes only.
- Use hyphens or commas instead of emdash characters.
- Keep CSS in `@layer`, custom properties, nesting, element selectors, and data attributes.

## Pull Requests

- Keep changes focused.
- Include screenshots for visible UI changes.
- Mention source changes when profile, GitHub, Sessionize, or LinkedIn parsing changes.
