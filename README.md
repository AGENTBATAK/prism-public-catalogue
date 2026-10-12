# PRISM public catalogue

Public prototype adapted from [utksahu30/PRISM](https://github.com/utksahu30/PRISM).

The catalogue lists 787 reports from supplied NCPOR repository metadata. PDFs remain at their original URLs. Covers are generic, not PDF page previews. Search and filters run in the browser without a database, server API, sign-in or document AI. The data is a snapshot, not an automatically synchronised feed. Bundled gallery and station images retain the original frontend's source notes.

Source is under `frontend/`. Run `npm ci`, `npm test`, and `npm run build:public` there. Set `PRISM_PUBLIC_BASE=/prism-public-catalogue/` for this project's GitHub Pages build. The `gh-pages` branch contains only the static website, with `.nojekyll` and hash routes for direct links and reloads. No PDF archive, local database or runtime secrets is published.

The full local PRISM app remains in the original checkout; local-only features are unavailable in this public build.

Live library: https://agentbatak.github.io/prism-public-catalogue/#/library

From `frontend`, run `npm run check:public -- https://agentbatak.github.io/prism-public-catalogue/` with Chrome installed to exercise the deployed browsing flows, original source links, accessibility, language switching and mobile layout.
