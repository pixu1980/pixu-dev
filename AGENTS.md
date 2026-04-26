# AGENTS.md

## Project Rules

- Never use emdash characters. Use commas or hyphens.
- Never use smart quotes or guillemets. Use straight double quotes.
- Keep generated and authored public copy in English unless a proper noun requires another language.
- CSS uses `@layer`, custom properties, nesting, element selectors, and data attributes.
- Do not introduce methodology class naming systems. Prefer semantic elements and attributes.

## Tokensave First

Before reading source files or scanning the codebase, use tokensave MCP tools:

- `tokensave_context`
- `tokensave_search`
- `tokensave_callers`
- `tokensave_callees`
- `tokensave_impact`
- `tokensave_node`
- `tokensave_files`
- `tokensave_affected`

If tokensave cannot answer a structural question, query `.tokensave/tokensave.db` directly with SQLite. Tables: `nodes`, `edges`, `files`.

If an extractor, schema, or tokensave tool has a gap, suggest opening an issue at `https://github.com/aovestdipaperino/tokensave`. Remind the user to remove sensitive or proprietary code before submitting.

## Figma MCP Integration Rules

These rules apply to any Figma-driven implementation in this project.

### Required Flow

1. Run `get_design_context` for the exact Figma node.
2. If the response is too large, run `get_metadata`, then fetch smaller nodes with `get_design_context`.
3. Run `get_screenshot` for the variant being implemented.
4. Only then download required assets and start code changes.
5. Treat Figma MCP code output as design reference, not final project code.
6. Validate final UI against the Figma screenshot before marking complete.

### Project Mapping

- Source content lives in `content/resume.md`.
- HTML template entry lives in `src/index.html`.
- Runtime JavaScript lives in `src/scripts/app.js`.
- CSS lives in `src/styles/main.css`.
- Source assets live in `src/assets`.
- Static public assets live in `static`.
- Generated Vite input and production output live in `dist`.

### Styling Rules

- Tokens are CSS custom properties in `src/styles/main.css` under `@layer tokens`.
- New visual work must reuse existing tokens before adding new ones.
- Prefer data attributes for component targeting, for example `[data-site-header]`.
- Keep cards only for repeated items, panels, and framed interactive surfaces.
- Text must fit on mobile and desktop without overlap.
- Support `prefers-reduced-motion` for motion changes.

### Asset Rules

- Use Figma localhost asset URLs directly when MCP returns them.
- Do not add icon packages for Figma assets.
- Store downloaded assets in `src/assets` when source-controlled, or `static` when public root files are required.
- Favicon assets must derive from `src/assets/images/logo.svg`.

### Quality Rules

- `pnpm build` must pass before delivery when code changes affect output.
- `pnpm test` should run for layout, navigation, data, or build pipeline changes.
- Keep `pnpm-lock.yaml` committed.
