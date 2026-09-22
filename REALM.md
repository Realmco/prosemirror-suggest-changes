# Realm fork

Pinned fork of [handlewithcarecollective/prosemirror-suggest-changes](https://github.com/handlewithcarecollective/prosemirror-suggest-changes),
installed from git by realm-app, realm-homeowner-portal and realm-vendor-portal because the upstream
fixes we need (block deletions at the document end, no zero-width markers, no joining of suggestions
across authors) are on upstream `main` and not in a published release.

This branch (`realm`) changes only the build: `prepare` builds `dist/` with swc and tsc so an install
from git ships compiled code, and the lint and formatting tooling that broke a plain `npm install` is
dropped. No source changes. When upstream publishes a release with these fixes, switch back to npm
and delete this fork.
