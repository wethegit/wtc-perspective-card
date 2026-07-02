# Contributing

Thanks for helping improve wtc-perspective-card! This document covers how the
repo is laid out and how to develop, document and release the library.

## Prerequisites

- **Node 24+** — the version is pinned in `.nvmrc` (`nvm use` / `n auto`).
- **pnpm 10** — the version is pinned via the `packageManager` field, so
  `corepack enable` is all you need.

## Repo layout

This is a pnpm workspace:

```
packages/wtc-perspective-card/   The published library: source, styles, docs
demo/                            Dev playground (private) that consumes the
                                 library by package name
```

The library's `exports` point at `src/` during development, so the demo gets
instant HMR from source with no build step. At publish time pnpm swaps in
`publishConfig.exports`, which point at the built `dist/` files.

## Developing

```sh
pnpm install
pnpm dev        # demo dev server with HMR from the library source
```

Make changes in `packages/wtc-perspective-card/src/` and exercise them in the
demo (`demo/index.html`, `demo/main.js`). There is no test suite — the demo
is the verification surface, so please check hover/ambient tilt, the
click-to-open modal (pointer, keyboard and Escape) and a touch device or
emulation when your change could affect them.

Other useful scripts (run from the repo root):

```sh
pnpm build        # library ESM + UMD + compiled CSS -> packages/.../dist
pnpm build:demo   # production build of the demo
pnpm preview      # serve the built demo
pnpm format       # prettier over library source and demo
pnpm document     # regenerate API.md from the source JSDoc
```

## Documentation

- `packages/wtc-perspective-card/README.md` — installation and quick start,
  handwritten. A copy lives at the repo root for GitHub; keep the two in sync
  (`cp packages/wtc-perspective-card/README.md README.md`).
- `packages/wtc-perspective-card/USAGE.md` — the full usage guide,
  handwritten.
- `packages/wtc-perspective-card/API.md` — **generated**. Never edit by hand;
  run `pnpm document` after changing any JSDoc.

## Pull requests

Open PRs against `master`. The Build workflow compiles every workspace
package on each PR. Please run `pnpm format` before pushing.

## Releasing

Publishing is automated: any push to `master` that touches
`packages/wtc-perspective-card/**` triggers the Publish NPM workflow, which
builds and publishes the package.

- The dist-tag is derived from the version: a prerelease suffix publishes
  under its own tag (e.g. `3.0.0-beta.1` → `beta`), a plain version
  publishes as `latest`.
- To cut a release, bump `version` in
  `packages/wtc-perspective-card/package.json` and merge to `master`.
- To sanity-check what will ship beforehand:

  ```sh
  pnpm --filter wtc-perspective-card publish --dry-run --no-git-checks
  ```

  or pack a tarball and install it into a scratch project:

  ```sh
  pnpm --filter wtc-perspective-card pack
  ```
