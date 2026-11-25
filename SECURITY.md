# Security

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private reporting instead:
**Security** tab of the repository, then **Report a vulnerability**. You will
get an answer within a week.

## Scope

proto-kit runs on your machine: a Vite dev server, local scripts and a
prototype with JSON mocks, no backend. The most relevant risks are:

- the installer (`create/index.js`), which clones a template and runs
  `npm install`;
- the scripts in `scripts/`, which start local servers and a headless browser;
- dependencies (updated weekly by Dependabot).

Client data (Figma captures, fonts, mocks) belongs in client repos, never in
this one. If you find some here, report it the same way.
