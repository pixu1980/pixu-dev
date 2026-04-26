# pixu-dev-resume

Static resume for Emiliano Pisu, built from Markdown, Vite, and build-time public profile data.

## Features

- Markdown resume source in `content/resume.md`.
- GitHub public repositories, stats, languages, topics, and update dates.
- Sessionize talks and events, filtered to English versions.
- Optional LinkedIn enrichment for headline, description, skills, experience, education, name, and profile image.
- Theme-aware SVG favicon and generated PNG fallbacks from `src/assets/images/logo.svg`.
- Plain CSS system with `@layer`, custom properties, nesting, and data attributes.
- Playwright checks for layout, navigation, data, and responsive behavior.

## Requirements

- Node.js 22 or newer.
- pnpm 10.15 or newer.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test
```

## Release

Release commands run a full build, bump `package.json`, and create a matching git tag.

```sh
pnpm rel:patch
pnpm rel:minor
pnpm rel:major
```

Tags use the `vX.Y.Z` format.

## Build Sources

Source configuration lives in YAML frontmatter inside `content/resume.md`.

- GitHub profile: `sourceConfig.github.profile`
- Sessionize profile: `sourceConfig.sessionize.profile`
- LinkedIn profile: `sourceConfig.linkedin.profile`

Environment variables:

- `GITHUB_TOKEN`, optional, raises GitHub API limits.
- `LINKEDIN_COOKIE_LI_AT`, optional, enables authenticated LinkedIn fetch.

Every dev or production build regenerates `dist` from source and live public data, then falls back to local frontmatter data when a remote source is unavailable. Public generated data is written to `dist/data/resume.json`.

## Structure

```text
content/
  resume.md
scripts/
  build.js
  generate-favicons.js
  lint-content.js
src/
  assets/
  scripts/app.js
  styles/main.css
  index.html
static/
tests/
  resume.spec.js
vite.config.js
```

## Contributing

See `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `AGENTS.md`.
