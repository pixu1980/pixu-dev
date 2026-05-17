# Contributing

Thanks for helping improve `pixu-dev-resume`.

## Local Setup

```sh
pnpm install
pnpm dev
```

Local dev and preview servers run at `http://localhost:4317`.

The site is generated from `content/resume.md`, public profile data, and files in `src`.

## Checks

Run these before opening a pull request:

```sh
pnpm build
pnpm test
pnpm verify
```

`pnpm build` regenerates favicon assets, renders markdown snapshots, builds with Vite, and writes `dist`. `pnpm verify` runs lint, format check, unit tests, and Playwright tests. Run `pnpm setup:browsers` once after install if Playwright browsers are missing.

## Changelog

```sh
pnpm changelog:update
pnpm changelog:regen
```

Use `pnpm changelog:update` for the current package version. Use `pnpm changelog:regen` when tag history or release notes need a clean rebuild.

## Content Rules

- Keep content in English unless a proper noun requires another language.
- Use straight quotes only.
- Use hyphens or commas instead of emdash characters.
- Keep CSS in `@layer`, custom properties, nesting, element selectors, and data attributes.

## Pull Requests

- Keep changes focused.
- Include screenshots for visible UI changes.
- Mention source changes when profile, GitHub, Sessionize, or LinkedIn parsing changes.
