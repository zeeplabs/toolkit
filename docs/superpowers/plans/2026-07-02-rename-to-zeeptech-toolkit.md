# Rename js-essential-kit to @zeeptech/toolkit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the published package from unscoped `js-essential-kit` to `@zeeptech/toolkit`, rename the GitHub repository to match, and retire the old npm package with a pointer to the new one — with zero functional/behavioral changes to the library code.

**Architecture:** Pure identity/metadata change. No source code in `lib/` is touched. Changes are confined to `package.json` fields, `README.md` package references, one GitHub Actions workflow (`publish.yml`) that has stale references predating this rename, the GitHub repository name itself, and the npm registry (new publish + deprecate old).

**Tech Stack:** npm/yarn, GitHub CLI (`gh`), GitHub Actions (`workflow_dispatch`), npm registry CLI (`npm deprecate`).

## Global Constraints

- New package name: `@zeeptech/toolkit` (spec: `docs/superpowers/specs/2026-07-02-rename-to-zeeptech-toolkit-design.md`).
- Visibility: public on npm (`npm publish --access public`).
- New GitHub repo name: `zeeplabs/toolkit` (org stays `zeeplabs`; only the npm scope is `@zeeptech` — these were already two different names before this rename, that's expected, not a bug).
- **Starting version for the new package: `1.0.0`.** Not specified in the spec — decided here because `@zeeptech/toolkit` is a distinct install target from `js-essential-kit` with no version continuity promise to keep (a consumer installing `@zeeptech/toolkit` never installed `js-essential-kit@1.x`, so there's nothing to be "compatible" or "breaking" relative to). This also absorbs the outstanding breaking change from the `formatRound`/`formatDecimal` sentinel removal (issue #106) for free — v1.0.0 simply behaves that way from day one, no separate major bump needed.
- Scope of this plan: metadata/identity only. Do NOT touch `lib/**`, `__tests__/**`, module structure, ESM/exports map, or dependency versions — those are explicitly out of scope per the spec.
- Every task that edits tracked files ends with build+lint+test+format verification (the project's existing `npm run build`, `npm run lint:check`, `npx jest`, `npx prettier --check .`) before committing — this rename must not regress the green test suite achieved on `develop`.
- **Tasks 5 and 6 publish/deprecate on the public npm registry — both are effectively irreversible** (an npm version can't be unpublished after 72h; deprecation is a permanent public signal even though technically reversible). Whoever executes this plan MUST pause and get explicit human go-ahead immediately before running the `npm publish` and `npm deprecate` commands in those tasks — do not run them as part of an unattended/batch execution.

---

### Task 1: Update package.json identity

**Files:**

- Modify: `package.json`

**Interfaces:**

- Consumes: none (first task).
- Produces: `package.json` with `name: "@zeeptech/toolkit"`, `version: "1.0.0"`, `repository.url` and `bugs.url` pointing at `zeeplabs/toolkit`. Later tasks (2, 3) reference these same three values — keep them consistent.

- [ ] **Step 1: Edit package.json**

Change these four fields in `package.json` (all other fields — `description`, `author`, `keywords`, `dependencies`, `scripts`, etc. — stay exactly as they are; this task does not touch them):

```json
  "name": "@zeeptech/toolkit",
  "version": "1.0.0",
```

```json
  "repository": {
    "type": "git",
    "url": "git+https://github.com/zeeplabs/toolkit.git"
  },
  "bugs": {
    "url": "https://github.com/zeeplabs/toolkit/issues"
  },
```

- [ ] **Step 2: Verify the package still builds and passes checks**

Run: `npm run build && npm run lint:check && npx prettier --check . && npx jest`
Expected: build succeeds, lint clean, prettier clean, `Tests: 117 passed, 117 total` (same green baseline as before this change — a metadata rename must not affect test outcomes).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "$(cat <<'EOF'
chore: rename package to @zeeptech/toolkit, reset version to 1.0.0

New package identity per docs/superpowers/specs/2026-07-02-rename-to-zeeptech-toolkit-design.md.
Version resets to 1.0.0 — @zeeptech/toolkit is a distinct install
target from js-essential-kit with no version-continuity promise to
keep, and this absorbs the outstanding breaking change from #106
(formatRound/formatDecimal sentinel removal) for free.

repository/bugs URLs point at the not-yet-renamed zeeplabs/toolkit —
this is intentionally ahead of Task 4 (repo rename); GitHub's automatic
redirect from the old repo name means links using the old URL keep
working in the meantime.
EOF
)"
```

---

### Task 2: Update README package references and add migration note

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: the new package name `@zeeptech/toolkit` from Task 1.
- Produces: a `README.md` with zero remaining references to installing or importing from `js-essential-kit`.

- [ ] **Step 1: Replace every package-name reference**

`README.md` has 43 occurrences of the literal string `js-essential-kit` — 3 in install commands (npm/yarn/pnpm) and 40 in `import { ... } from 'js-essential-kit'` example lines. Replace all of them with `@zeeptech/toolkit`:

Run: `sed -i '' "s/js-essential-kit/@zeeptech\/toolkit/g" README.md`

- [ ] **Step 2: Verify no stale references remain**

Run: `grep -c "js-essential-kit" README.md`
Expected: `0` (grep exits non-zero / prints `0` — no matches left)

- [ ] **Step 3: Add a migration note directly under the title**

Insert this block immediately after the `# Utility JavaScript Functions Library 📚` title line (before the welcome paragraph):

```markdown
> **Renamed:** this package was previously published as `js-essential-kit`. It is now `@zeeptech/toolkit`. See [Migration](#migration) below.
```

Add a `## Migration` section right before `## Getting Started ✈️`:

````markdown
## Migration

If you currently depend on `js-essential-kit`, switch to `@zeeptech/toolkit`:

```bash
npm uninstall js-essential-kit
npm install @zeeptech/toolkit
```
````

No code changes beyond the package specifier — every named export (`calculateAge`, `cpfOrCnpjMask`, etc.) has the same name and signature. Only the string in your `import`/`require` changes:

```diff
- import { calculateAge } from 'js-essential-kit'
+ import { calculateAge } from '@zeeptech/toolkit'
```

`js-essential-kit` is deprecated on npm and will not receive further updates.

- [ ] **Step 4: Verify formatting**

Run: `npx prettier --check README.md`
Expected: `All matched files use Prettier code style!` (README isn't covered by the project's Jest/ESLint checks, but keep it consistent with the rest of the repo's prettier formatting)

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: update README for @zeeptech/toolkit rename, add migration note

All install/import examples now reference @zeeptech/toolkit instead of
js-essential-kit. Adds a Migration section pointing existing consumers
at the new package name.
EOF
)"
```

---

### Task 3: Fix stale scope/remote references in the publish workflow

**Files:**

- Modify: `.github/workflows/publish.yml`

**Interfaces:**

- Consumes: the new package/repo names from Tasks 1 and 4 (`@zeeptech/toolkit`, `zeeplabs/toolkit`).
- Produces: a publish workflow that pushes the version-bump commit to the correct repository and configures the correct npm scope — this task fixes a **pre-existing bug** (the workflow currently points at `@iorder-tech` scope and pushes to `github.com/iorder-tech/js-helper-kit.git`, neither of which is this repository), not something this rename introduces.

- [ ] **Step 1: Fix the npm scope**

In `.github/workflows/publish.yml`, change:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version-file: '.nvmrc'
    registry-url: 'https://registry.npmjs.org'
    scope: '@iorder-tech'
```

to:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version-file: '.nvmrc'
    registry-url: 'https://registry.npmjs.org'
    scope: '@zeeptech'
```

- [ ] **Step 2: Fix the git remote used for the version-bump push**

Change:

```yaml
git remote set-url origin https://x-access-token:${{ secrets.GIT_TOKEN }}@github.com/iorder-tech/js-helper-kit.git
```

to:

```yaml
git remote set-url origin https://x-access-token:${{ secrets.GIT_TOKEN }}@github.com/zeeplabs/toolkit.git
```

- [ ] **Step 3: Validate the YAML is well-formed**

Run: `npx prettier --check .github/workflows/publish.yml`
Expected: `All matched files use Prettier code style!`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/publish.yml
git commit -m "$(cat <<'EOF'
fix(ci): point publish workflow at @zeeptech scope and zeeplabs/toolkit

publish.yml referenced @iorder-tech as the npm scope and pushed the
version-bump commit to github.com/iorder-tech/js-helper-kit — neither
matches this repository (zeeplabs/js-essential-kit, soon zeeplabs/toolkit).
This was a pre-existing bug (the workflow would have failed on its git
push step even before this rename); fixing it here since the rename
touches the same lines anyway.
EOF
)"
```

---

### Task 4: Rename the GitHub repository

**Files:** none (GitHub API + local git config only)

**Interfaces:**

- Consumes: target name `toolkit` from Global Constraints.
- Produces: repository accessible at `zeeplabs/toolkit`, with `zeeplabs/js-essential-kit` automatically redirecting (GitHub's built-in behavior for renamed repos). Local git remote updated to match.

⚠️ **Pause here and get explicit human confirmation before Step 1** — renaming a repository changes a URL other tools/people may have bookmarked or scripted against. GitHub's redirect softens this but it is still a visible, shared-state change.

- [ ] **Step 1: Rename via GitHub API**

Run: `gh api -X PATCH repos/zeeplabs/js-essential-kit -f name=toolkit`
Expected: JSON response with `"full_name": "zeeplabs/toolkit"`

- [ ] **Step 2: Update the local git remote**

Run: `git remote set-url origin git@github.com:zeeplabs/toolkit.git`

- [ ] **Step 3: Verify the remote and the redirect both work**

Run: `git remote -v`
Expected: both `fetch` and `push` lines show `git@github.com:zeeplabs/toolkit.git`

Run: `gh repo view zeeplabs/js-essential-kit --json full_name -q .full_name`
Expected: `zeeplabs/toolkit` (confirms the old name redirects to the new one instead of 404ing)

- [ ] **Step 4: Push the commits from Tasks 1-3 to the renamed repo**

Run: `git push origin develop`
Expected: push succeeds against the new remote URL (no separate commit needed — this step just confirms the renamed remote accepts pushes)

---

### Task 5: Publish @zeeptech/toolkit@1.0.0 to npm

**Files:** none (triggers existing CI workflow)

**Interfaces:**

- Consumes: `publish.yml` from Task 3, version `1.0.0` from Task 1.
- Produces: `@zeeptech/toolkit@1.0.0` live on the public npm registry.

⚠️ **This step is irreversible (npm does not allow unpublishing a version after 72 hours) and public. Get explicit human go-ahead immediately before Step 1 — do not run this as part of unattended execution.**

- [ ] **Step 1: Confirm the NPM_TOKEN secret's account can publish under the new scope**

This can't be verified from the CLI without the token itself. Ask the repository owner to confirm the `NPM_TOKEN` GitHub secret belongs to the same npm account that owns the `@zeeptech` scope (confirmed earlier in this project to be `julioamsousa <julio@iorder.com.br>` / the account behind `@zeeptech/orbit-client`). If it's a different account, publishing will fail with `403 Forbidden` at the `npm publish` step.

- [ ] **Step 2: Trigger the publish workflow**

Run: `gh workflow run publish.yml -R zeeplabs/toolkit -f version=1.0.0`

- [ ] **Step 3: Watch the run to completion**

Run: `gh run watch -R zeeplabs/toolkit $(gh run list -R zeeplabs/toolkit --workflow=publish.yml --limit=1 --json databaseId -q '.[0].databaseId')`
Expected: run completes with conclusion `success`

- [ ] **Step 4: Verify the package is live**

Run: `npm view @zeeptech/toolkit version`
Expected: `1.0.0`

---

### Task 6: Deprecate the old js-essential-kit package

**Files:** none (npm registry metadata only)

**Interfaces:**

- Consumes: nothing from prior tasks except confirmation that Task 5 succeeded (don't deprecate the old package before the new one is confirmed live — that would leave consumers with no working install target for a window of time).
- Produces: `js-essential-kit` on npm shows a deprecation warning on install, pointing at `@zeeptech/toolkit`.

⚠️ **Public, permanent-in-spirit signal (technically reversible via `npm deprecate js-essential-kit ""` to clear it, but treat it as a one-way door). Get explicit human go-ahead immediately before Step 1. Only run this after Task 5's Step 4 has confirmed `@zeeptech/toolkit@1.0.0` is live.**

- [ ] **Step 1: Deprecate all published versions**

Requires being logged in locally as the npm account that owns `js-essential-kit` (`julioamsousa`). If not already logged in: `npm login`.

Run: `npm deprecate js-essential-kit@"*" "Renamed to @zeeptech/toolkit — see https://github.com/zeeplabs/toolkit for migration instructions. js-essential-kit will not receive further updates."`

- [ ] **Step 2: Verify the deprecation is visible**

Run: `npm view js-essential-kit deprecated`
Expected: prints the deprecation message set in Step 1

---

## Self-Review Notes

- **Spec coverage:** every row of the spec's decision table (scope, package name, visibility, content-split decision, repo rename) is reflected — Task 1 (package name/scope/version), Task 4 (repo rename), spec's "keep single package" decision requires no task (it's an absence of action, correctly not represented as a task). "Public visibility" is realized by `npm publish --access public`, already present in the existing `publish.yml` and unchanged by Task 3.
- **Placeholder scan:** no TBD/TODO; the one open item (Task 5 Step 1, confirming which npm account owns the `NPM_TOKEN` secret) is a real human-in-the-loop check, not a placeholder — it can't be resolved by any command available to a plan executor since the secret's value isn't inspectable.
- **Type/name consistency:** `@zeeptech/toolkit` and `zeeplabs/toolkit` are used identically across Tasks 1, 2, 3, 4, 5, 6 — checked for copy-paste drift (e.g. no stray `zeeptech/toolkit` without the `@`, no stray `js-toolkit`).
- **Scope check:** single cohesive change (a rename), not decomposed further — every task produces a piece of the same one outcome and none is independently shippable as a "feature," which is expected for this kind of metadata-only plan.
