# Realm fork

Pinned fork of [handlewithcarecollective/prosemirror-suggest-changes](https://github.com/handlewithcarecollective/prosemirror-suggest-changes),
installed from git by realm-app, realm-homeowner-portal and realm-vendor-portal because the upstream
fixes we need (block deletions at the document end, no zero-width markers, no joining of suggestions
across authors) are on upstream `main` and not in a published release.

This branch (`realm`) changes only the build: `dist/` is committed (Yarn 1 does not run `prepare` for a
git dependency, npm does not need it to), `prepare` still rebuilds it with swc and tsc, and the lint and
formatting tooling that broke a plain `npm install` is dropped. No source changes. Rebuild `dist/` with
`npm run build` after pulling upstream. When upstream publishes a release with these fixes, switch back to npm
and delete this fork.
