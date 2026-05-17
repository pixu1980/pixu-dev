# pixu-dev-resume

Static resume for Emiliano Pisu, built from Markdown, Vite, and build-time public profile data.

## Features

- Markdown resume source in `content/resume.md`.
- GitHub public repositories, stats, languages, topics, and update dates.
- Sessionize talks and events, filtered to English versions.
- Optional LinkedIn enrichment for headline, description, skills, experience, education, name, and profile image.
- Theme-aware SVG favicon and generated PNG fallbacks from `src/assets/images/logo.svg`.
- Plain CSS system with `@layer`, custom properties, nesting, and data attributes from `src/styles/index.css`.
- Playwright checks for layout, navigation, data, and responsive behavior.

## Requirements

- Node.js 22 or newer.
- pnpm 11.0.5 or newer.

## Commands

```sh
pnpm install
pnpm cms
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm verify
```

`pnpm dev` and `pnpm preview` serve the site at `http://localhost:4317`.

After `pnpm install`, Husky configures a pre-push hook that runs `pnpm prepush:check`. Browser binaries are a one-time setup step:

```sh
pnpm setup:browsers
```

## Release

Release commands run a full build, bump `package.json`, and create a matching git tag.

```sh
pnpm rel -- patch
pnpm rel -- minor
pnpm rel -- major
```

Tags use the `vX.Y.Z` format.

Changelog commands are available without release side effects:

```sh
pnpm changelog:update
pnpm changelog:regen
```

- `pnpm changelog:update` refreshes the current package version section from commits after the last reachable tag.
- `pnpm changelog:regen` rebuilds `CHANGELOG.md` from semver tags and the current package version.

## Build Sources

Source configuration lives in YAML frontmatter inside `content/resume.md`.

- GitHub profile: `sourceConfig.github.profile`
- Sessionize profile: `sourceConfig.sessionize.profile`
- LinkedIn public profile: `sourceConfig.linkedin.profile`
- LinkedIn PDF export: `sourceConfig.linkedin.pdf`

Environment variables:

- `GITHUB_TOKEN`, optional, raises GitHub API limits.

Use `pnpm cms` to sync live source snapshots into `content/resume.md`, under markdown frontmatter `generated`, and to refresh selected markdown sections such as `Experience` from `content/profile.pdf`.

Build command uses markdown snapshots only:

- `pnpm build` reads `content/resume.md` as primary source (no live scraping).
- `PIXU_BUILD_SOURCE=content/another-resume.md pnpm build` builds from a specific markdown source.

Build output is rendered directly from `content/resume.md`. No runtime `resume.json` payload is emitted.

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
  styles/index.css
  index.html
static/
tests/
  resume.spec.js
vite.config.js
```

## Contributing

See `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `AGENTS.md`.
