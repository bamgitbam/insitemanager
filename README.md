# InsiteManager Website

Public showcase site for [InsiteManager](https://insitemanager.com/), an independently developed security-systems engineering and operations platform.

This repository intentionally contains only the files served by the public website. The InsiteManager application, development records, deployment configuration, credentials, and private project data are maintained separately.

## Website contents

- Responsive flagship homepage and four dedicated product pages
- Privacy & Security and Development Progress pages
- Curated, public-safe product screenshot gallery (`gallery.html`) and web-optimized images
- Screenshot links with an enhanced lightbox (direct-image fallback without JavaScript)
- Platform, workflow, progress, and engineering sections
- Social preview, favicon, and touch icon assets
- Search-engine discovery files
- No framework, package manager, tracking script, third-party font, or runtime dependency

## Local preview

From the repository root, start any static file server. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`. Run the offline checks before reviewing or publishing a pass:

```powershell
node scripts/check-site.mjs
node --check assets/site.js
```

The site check uses Node's built-in modules only; no installation or build step is required. It checks local links, image references, anchor targets, core page metadata, the sitemap, the custom domain and the reviewed public-file inventory. Unrecognized files, private evidence directories, symbolic links and oversized assets fail the publication guard until explicitly reviewed. Browser review is still required for appearance, navigation, lightbox behavior and the Ronin target scroller. At phone widths, core content and product links remain accessible even when JavaScript is unavailable. Screenshot artwork links open their original image when JavaScript or the dialog API is unavailable; the Ronin featured-target strip remains natively scrollable without script-driven arrows.

## Project structure

```text
index.html          Flagship homepage and portfolio navigation
products/           Dedicated pages for Insite Manager, Insite Tools, Sawyer, Ronin Range
privacy-security.html  Public privacy and security approach
progress.html       Feature-by-feature progress with five defined stages
gallery.html        Editorial product screenshots and visual history
assets/site.css     Visual system and responsive layouts
assets/site.js      Navigation, reveal behavior, and screenshot viewer
assets/images/      Optimized demonstration screenshots and social preview
assets/icons/       InsiteManager marks
robots.txt          Search-crawler policy
sitemap.xml         Public URL index
CNAME               Custom-domain declaration
```

No build step is required. Before publishing, test all seven secondary pages, responsive navigation and local links. Publish the repository root through a static host with HTTPS enabled.

## Public repository boundary

Before publishing changes, confirm that the repository contains only material intended for unrestricted public access.

Do not commit:

- Credentials, tokens, `.env` files, or authorization headers
- Personal contact details or account-specific hosting instructions
- Private DNS records, network addresses, device identifiers, or customer information
- Application source, internal development notes, captured logs, or diagnostic bundles
- Unsanitized project exports or screenshots containing private operational data

The included screenshots use demonstration workflows. New screenshots should be reviewed at full resolution before they replace an existing asset. Screenshot labels must distinguish application views, browser E2E captures and simulated previews. A social-sharing preview cannot carry the qualifying caption from a page: use neutral site artwork for a simulated or unaccepted capability until a representative, approved capture is available. The site check guards these public-claim boundaries and the currently reviewed 24 capability-scoped milestone stages; changing accepted milestones requires an intentional review of its validation contract.

## Release candidate / push-readiness gate

This is a static website; there is no dependency install, build artifact or separate release branch required by the site. From the `insitemanager` repository root:

```powershell
node scripts/check-site.mjs
node --check assets/site.js
git diff --check
git status --short
```

Inspect the page and source changes, the full-resolution published screenshots and metadata, then review **all files to be committed** for privacy and licensing. The website check cannot certify that a device, network, Android app or range target works in the field; the product qualification notes describe those separate acceptance scopes.

Stage the reviewed public site explicitly rather than `git add .`:

```powershell
git add -- README.md index.html sitemap.xml gallery.html privacy-security.html progress.html assets products scripts
git diff --cached --check
git diff --cached --stat
git status --short
```

Also inspect `git diff --cached` for text files and the staged file names for unexpected bundles, logs or secrets. The tracked `CNAME`, `.nojekyll`, `robots.txt`, icons and `.gitignore` remain unchanged unless a separate review approves edits. **Committing and pushing are separate operator-approved actions**; after those actions, verify the HTTPS deployment and its public links. Keep raw screenshot archives and all private project work outside the public repository.

## Development status

InsiteManager is an independent project in active development. The website describes current working surfaces and intended direction without claiming commercial availability. Features, integrations, and deployment architecture may evolve.

## Visual progress updates

The public gallery is a curated visual introduction, **not** an automatic E2E-output feed or a task board. The current gallery uses existing public-site images; a screenshot is not, by itself, proof that a feature is Verified.

When a meaningful application milestone is accepted:

1. Run the application's existing E2E/field capture workflow and keep raw captures and diagnostics in the source repository or local private evidence storage.
2. Inspect the candidate at full resolution; remove credentials, private IPs, device IDs, project/customer data, and other sensitive information. Review filenames and image metadata too.
3. Confirm the feature's stage and acceptance scope from the source repository's current qualification evidence. Distinguish simulated UI, workstation/browser tests, Android/device observations and deployed functionality.
4. After operator approval, publish only the selected optimized screenshot in `assets/images/`, update its caption in `gallery.html`, and optionally refresh the relevant product hero if the new screenshot is truly representative. Preserve the product's established branding.
5. Verify the local routes, links, screenshot lightbox, responsive layout, accessibility and public-content boundary before any commit or deployment. Do not upload screenshots or publish automatically.

Keep the content compact: one or two descriptive sentences, focused highlights and an accurate caption. Do not place private E2E reports, task lists, logs, or unpublished captures in the public website.

## Ronin Range target collection (Step 168)

The Ronin Range product page contains a **curated six-slot target artwork scroller** followed by the local library's nine elevated selections in a compact list. This is a public introduction to target designs, not a print download library or a physical-acceptance record. The gallery is manually controlled; it never auto-rotates.

- The six featured entries live in `products/ronin-range.html` within `#targets`. Swap their image path, alt text, label, caption and name to change the selection without rebuilding the layout. Keep 4–6 cards only.
- Approved public artwork is optimized into `assets/images/targets/`. Raw source files, print PDFs, geometry, catalogs and field evidence stay outside the public website.
- Reconcile the **full list** against the local target library's `00_CATALOG/TARGET_CATALOG.md`. `ELEVATED` means currently selected in that library, not verified physical performance. Keep target-design revision distinct from print/test revision and preserve `CURRENT_UNVERSIONED` cases rather than inventing R numbers.
- Concept artwork (such as Mirror Shuffleboard) must retain a visible concept label; the older Shuffleboard concept is not identical to the repository's `RR-STANCHION R1` print candidate.
- Before publishing updated artwork, inspect for personal/operational data, verify target provenance and app binding, and perform a local desktop, tablet, phone, scroll-button and lightbox check. No automatic publication.

### Public product story and milestone placement (Pass 177)

Keep the four product pages product-first: concise capabilities, real screenshots, audience context and a short platform-direction explanation. Do not recreate feature-stage card grids on those pages. The dedicated `progress.html` page is the single public milestone catalog and preserves the published, capability-scoped stage/evidence detail. Its hero links directly to the milestone catalog, and the five stage definitions are compact on phones without altering stage meanings or acceptance caveats. Maintain the same test-scope caveats when changing copy, and do not treat screenshots or a passing site check as device/field acceptance.

Pass 179 presents each product's **documented working workflow** as a short, numbered editorial sequence. Steps describe what operators can do or what the named test observed, while upcoming capabilities remain explicitly separated. Use product-specific gallery and milestone links for supporting screenshots and acceptance scope. Keep these sequences concise; do not introduce new stage badges, repeat the Progress catalog or imply all-device compatibility.

### Screenshot and target navigation (Pass 178)

On phone widths, portrait captures in the public gallery receive a taller preview so their interfaces remain more recognizable. Any screenshot opened in the lightbox offers an explicit **Open original image in a new tab** link for native full-resolution viewing; the direct-image fallback remains available without JavaScript. This link opens the published local asset and does not request external resources.

In the Ronin Range catalog, linked selection names jump to the matching featured artwork above. Unfeatured selections remain unlinked rather than pointing to an invented preview. The featured concept retains its distinct designation; none of these changes indicate field or physical acceptance.

### Representative examples and qualification links (Pass 182)

Each product's concise *Example in practice* connects a real task to one explicitly labeled gallery capture and the corresponding, capability-scoped Progress milestone. These links go to individual items rather than a broad product section; a targeted item receives a visible highlight and avoids the sticky header. Keep screenshot provenance accurate: Sawyer's published image is an earlier simulated interface, not a frame from the verified S21 stream. Ronin browser E2E captures are not proof of physical target accuracy. Update all related links and the `scripts/check-site.mjs` mapping together when an approved public example changes.

### Product accuracy reconciliation and Tools gallery (Pass 184)

The Insite Tools Galaxy A50 **APK installation and native workspace visual review** are a narrow Verified milestone; native diagnostics, live-device access, SAF saved export bytes/redaction/cancellation, offline restart/persistence and WebView/security posture remain independently staged. Ronin Range has a separate **local A50 Cromite offline PWA** Verified milestone; the public-hosted PWA release stays Staged. Do not merge these test scopes. The independent local/offline core ownership of all four applications is architectural direction and documented experience, not an assertion that every optional camera, map or API integration runs disconnected.

Three new Tools images are optimized locally from the 2026-11-21 accuracy handoff's browser-E2E reference assets, without use of physical Galaxy A50 screenshots:

| Published asset | Original handoff image | Scope |
| --- | --- | --- |
| `assets/images/e2e-tools-devices-overview.webp` | `reference-media/tools-devices-overview-desktop-browser-e2e.png` | Synthetic fixture target, no real inspection |
| `assets/images/e2e-tools-network-services.webp` | `reference-media/tools-network-services-desktop-browser-e2e.png` | Synthetic fixture, no live check |
| `assets/images/e2e-tools-logs-empty.webp` | `reference-media/tools-logs-desktop-browser-e2e.png` | Empty isolated Logs UI, no real import or export proved |

The previously published `e2e-tools-api-workbench.webp` remains the API example. Fixture IP `192.168.1.101` is synthetic screenshot data, not a published real inventory. New images were inspected before inclusion and re-encoded as WebP without EXIF. The gallery captions must keep synthetic/browser examples separate from A50 physical acceptance, device scanning and download-byte validation. Stage changes and public media must be reviewed by the operator before commit or deployment.
