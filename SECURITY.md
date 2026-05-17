# Security Policy

## Supported Versions

Security fixes target the default branch.

## Reporting a Vulnerability

Open a private advisory on GitHub, or contact the maintainer through the public profile links in the site.

Do not include secrets, session cookies, private profile exports, or proprietary code in public issues.

## Secrets

`GITHUB_TOKEN` is an optional local build input. Never commit it. Use `.env` or CI secrets.
