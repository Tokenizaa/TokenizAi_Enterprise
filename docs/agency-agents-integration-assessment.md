# Agency Agents integration — technical assessment

**Status:** repository reconciled to `Tokenizaa/NettosCorp` (`main`, `/enterprise`); architecture assessment updated before any integration changes.
**Target:** one NettosCorp Enterprise web application. No separate Agency Agents UI, no Agency Agents server, no desktop runtime in production.

## 1. Repositories and verified facts

| System | Repository | Verified stack / role |
|---|---|---|
| NettosCorp Enterprise | `Tokenizaa/NettosCorp` (`/enterprise` on `main`) — https://github.com/Tokenizaa/NettosCorp/tree/main/enterprise | Vite 8, React 19, TypeScript 7, Supabase JS; existing React shell, auth, services, organization pages, `/agency-catalog` and `/agency-intelligence` (`AgencyIntelligencePage`, `AgencyCatalogPage`, `agencyCatalogService`, `agencyTeamPlanner`, `sync:agency-source`) |
| Agency Agents corpus | `msitarzewski/agency-agents` | Markdown agent source, `divisions.json`, strategy/runbooks, examples, conversion and validation scripts |
| Agency Agents App | `msitarzewski/agency-agents-app` | Tauri 2 + SvelteKit 2 + Svelte 5 + Rust; native desktop control surface over the corpus |

The Agency Agents App README explicitly describes it as a **native installer**, not an agent runtime. Its Rust backend owns corpus loading, rendering, installation, local install ledger, reconciliation, settings, GitHub integration and updater. The app can use a bundled baseline or a managed/local clone of the corpus. Its frontend invokes Rust commands through `@tauri-apps/api/core`.

The original project is MIT-licensed. Preserve its license and notices for any reused source.

## 2. Source/deployment reconciliation

The currently open production page is `https://enterprise.defesai.com.br/agency-catalog`. It displays the Enterprise shell and the Agency Agents catalog.

The authoritative source of truth is `Tokenizaa/NettosCorp` (`main` branch, `/enterprise` subdirectory):
- `enterprise/wrangler.toml` targets Cloudflare Pages (`name = "nettoscorp-enterprise"`, `destination_names = ["enterprise.defesai.com.br"]`, `build_command = "pnpm run build"`, `build_output_directory = "dist"`).
- `enterprise/src/App.tsx` maps both `/agency-catalog` and `/agency-intelligence` to `AgencyIntelligencePage`.
- `enterprise/src/pages/AgencyCatalogPage.tsx`, `enterprise/src/services/agencyCatalogService.ts`, `enterprise/src/services/agencyTeamPlanner.ts`, `enterprise/src/components/agency/AgencyOriginalSource.tsx`, `enterprise/src/components/agency/PaperclipAgentStudio.tsx`, `enterprise/scripts/sync-agency-source.mjs`, and `enterprise/scripts/test-agency-team-planner.ts` already live on `main` under `/enterprise`.

**Do not overwrite or replace the existing catalog implementation in `Tokenizaa/NettosCorp` (`/enterprise`).** Always confirm the exact deployed commit on `main` in Cloudflare Pages before making changes, and treat `/enterprise` in `Tokenizaa/NettosCorp` as the canonical baseline to preserve and evolve.

## 3. Target architecture

Keep the existing React Enterprise shell as the only user-facing application:

- Enterprise owns authentication, navigation, page layout, design tokens, authorization, Supabase persistence, audit trail, selections, homologations, organizational identity and Paperclip preparation.
- Agency Agents remains an upstream, version-pinned source of specialist content and reusable frontend behavior.
- Paperclip remains the operational destination for agents actually created and configured.

Recommended integration boundary:

1. Pin the upstream `agency-agents` corpus to an immutable commit/release. Import complete source Markdown plus `divisions.json`, `strategy/runbooks.json`, runbook Markdown and relevant metadata. Record source repository, commit SHA, path, source hash and import timestamp.
2. Keep the upstream `agency-agents-app` source isolated and identifiable (prefer a pinned Git subtree or pinned source snapshot with upstream provenance; do not fork its business logic casually).
3. Build a browser-only Svelte module from the reusable catalog components and mount it inside the existing React page as one embedded module/custom element. The user remains in the Enterprise shell; no second navigation, login, domain, or app.
4. Replace the Tauri IPC boundary with a narrow, typed Enterprise adapter. The adapter reads the Enterprise API/Supabase and delegates authorized actions to Enterprise services. It must not expose arbitrary filesystem or shell operations.
5. Keep all corporate workflows outside the upstream module: Brazilian human identity, NettosCorp role/department/hierarchy, evaluation, homologation, team/project selection, preparation packages and Paperclip provisioning.

This gives one UI and one source of truth for corporate state while retaining the original Svelte implementation where it provides real value.

## 4. What to reuse from Agency Agents App

**High-value reusable frontend:**
- Agents workspace: searchable catalog, division filtering, list/detail layout, selection interactions and persona rendering.
- Persona body and deterministic Markdown renderer.
- Division metadata presentation and navigation patterns.
- Runbook presentation and roster resolution, after removing desktop-install actions.
- Existing Svelte components, CSS and design tokens where compatible with Enterprise.

**Do not bring into the web Enterprise runtime:**
- Tauri window/titlebar behavior, native dialog/opener plugins.
- Local machine tool detection, filesystem scanning, local install/update/uninstall.
- Local install ledger and reconciliation against user directories.
- Desktop updater, app settings and local GitHub keychain/device-flow features.
- Any operation that writes agent files into a user's local coding tools.

The Agency Agents App's Tools, Projects and install/reconciliation views are not the Enterprise's equivalent of corporate agent management. They solve local installation management for coding tools. They should not be transplanted as-is.

## 5. Adapter contract (proposed)

The embedded module should depend on a small interface, not directly on Supabase or Tauri:

- `listProfiles({ query, division, cursor, limit })`
- `getProfile(slug)` — returns the full original Markdown and source metadata.
- `listDivisions()`
- `listRunbooks()` and `getRunbook(slug)`
- `getProfileWorkflowState(slug)` — Enterprise-owned status/selection/homologation summary.
- `selectProfiles(slugs, projectId)`
- `submitHomologation(slug, decision, rationale)`

The browser module must receive only authorized, organization-scoped data. Supabase RLS and server-side authorization remain authoritative. Never put a service-role key in the browser. Do not let the embedded module directly mutate Paperclip; it should request an Enterprise workflow that validates and records the action.

The profile contract must preserve the original Markdown body verbatim, frontmatter, source path, source commit and content hash. Summaries or humanized fields are additive fields, never replacements for the original.

## 6. Integration mechanics

Preferred implementation sequence:

1. Work directly against the canonical `Tokenizaa/NettosCorp` (`/enterprise` on `main`) codebase and confirm the live Cloudflare Pages commit SHA.
2. Add a pinned upstream source reference and a reproducible update/import script. Updates are explicit and reviewed, never silently pulled from upstream main during production build.
3. Extract a browser-only Svelte entry that compiles the original reusable components into a single mountable module. Do not embed the entire desktop shell.
4. Add a Tauri compatibility boundary only for the commands required by the selected components. Prefer replacing imports through a Vite alias/build entry over editing upstream source files. Unsupported desktop operations must be absent from the embedded UI, not silently mocked as successful.
5. Add the typed Enterprise adapter and connect it to existing Supabase-backed services.
6. Place the embedded module inside the existing Enterprise page layout and apply Enterprise navigation, spacing, typography, colors and light theme. Do not introduce a second application shell.
7. Add contract tests, source-fidelity tests and browser tests before enabling homologation or Paperclip preparation.

A Web Component/custom-element boundary is a promising mount strategy because the Enterprise is React and the reusable surface is Svelte. It still needs a small proof-of-concept: Svelte component CSS, global tokens, lifecycle cleanup, auth context and error propagation must be verified. If custom-element compilation creates excessive friction, use a separately bundled Svelte mount function inside a React wrapper; do not rewrite the full Svelte UI in React as the first choice.

## 7. Acceptance criteria

- One URL, one Enterprise shell, one authentication/session and no visible Agency Agents app shell.
- No Agency Agents server or Tauri runtime required in production.
- Catalog data loads from the Enterprise-controlled source snapshot and Supabase records.
- All original profile Markdown and frontmatter remain retrievable without truncation or generated placeholders.
- Division and runbook counts reconcile to the pinned upstream commit.
- Search, filters, pagination, detail view and selection work against real data.
- Homologation and project selection persist in Supabase with organization scope and audit records.
- No local filesystem, shell, tool installation, updater or desktop-only operation is reachable from the web module.
- Build, typecheck, unit/contract tests and browser smoke tests pass.
- Existing Enterprise routes and the current production catalog remain intact until the replacement passes acceptance.

## 8. Local build/deploy handoff

In `Tokenizaa/NettosCorp` (`/enterprise`), `package.json` and `wrangler.toml` define:
- `pnpm run build` (also `npm run build`): Vite production build (`dist`), configured in `enterprise/wrangler.toml` for Cloudflare Pages (`enterprise.defesai.com.br`).
- `pnpm run lint` / `npm run lint`: TypeScript no-emit check (`tsc --noEmit`).
- `pnpm run sync:agency-source`: `node scripts/sync-agency-source.mjs`.
- `pnpm run test:agency-planner`: `tsx scripts/test-agency-team-planner.ts`.

No production deployment has been attempted as part of this assessment.

## 9. Source references

- NettosCorp Enterprise (canonical source): https://github.com/Tokenizaa/NettosCorp/tree/main/enterprise
- Agency Agents corpus: https://github.com/msitarzewski/agency-agents
- Division taxonomy: https://github.com/msitarzewski/agency-agents/blob/main/divisions.json
- NEXUS roster manifest: https://github.com/msitarzewski/agency-agents/blob/main/strategy/runbooks.json
- Agency Agents App README/architecture: https://github.com/msitarzewski/agency-agents-app/blob/main/README.md
- Agents workspace: https://github.com/msitarzewski/agency-agents-app/blob/main/src/lib/components/AgentsWorkspace.svelte
- Persona renderer: https://github.com/msitarzewski/agency-agents-app/blob/main/src/lib/components/PersonaBody.svelte
- Corpus store: https://github.com/msitarzewski/agency-agents-app/blob/main/src/lib/stores/corpus.svelte.ts
- Corpus Rust backend: https://github.com/msitarzewski/agency-agents-app/blob/main/src-tauri/src/corpus/mod.rs
- Tauri command registration: https://github.com/msitarzewski/agency-agents-app/blob/main/src-tauri/src/lib.rs
