// Offline, dependency-free public-site check. Run from any directory with Node 20+.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  ...readdirSync(root).filter((name) => name.endsWith('.html')),
  ...readdirSync(join(root, 'products')).filter((name) => name.endsWith('.html')).map((name) => `products/${name}`),
].sort();
const text = (path) => readFileSync(path, 'utf8');
const readPage = (name) => text(join(root, name));
const getAttr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(([value]) => value);
const failures = [];
const fail = (page, detail) => failures.push(`${page}: ${detail}`);
const allowedExternal = /^(https?:|mailto:|tel:|data:)/i;
const siteOrigin = 'https://insitemanager.com';
const htmlByPage = Object.fromEntries(pages.map((page) => [page, readPage(page)]));

// Publication boundary: this repository is the *public static site*, not an
// application repository or private evidence store. Unrecognized files require
// an intentional allowlist review before they can be included in a release.
const publicRootFiles = new Set([
  '.gitignore', '.nojekyll', 'CNAME', 'README.md', 'index.html',
  'gallery.html', 'privacy-security.html', 'progress.html', 'robots.txt',
  'sitemap.xml', 'favicon.ico', 'apple-touch-icon.png',
]);
const publicDirectories = new Set([
  'assets', 'assets/images', 'assets/images/targets', 'assets/icons',
  'products', 'scripts',
]);
const publicPaths = [
  /^products\/[a-z0-9-]+\.html$/,
  /^assets\/images\/(?:targets\/)?[a-z0-9-]+\.(?:webp|png|jpe?g)$/i,
  /^assets\/icons\/[a-z0-9-]+\.png$/i,
  /^assets\/(?:site\.css|site\.js|og-insitemanager\.jpg)$/,
  /^scripts\/check-site\.mjs$/,
];
const maxPublicFileSize = 5 * 1024 * 1024;
function inspectPublicTree(folder = root, prefix = '') {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (!prefix && entry.name === '.git') continue; // Local Git metadata is not website content.
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) { fail(path, 'symbolic link is not a reviewed public asset'); continue; }
    if (entry.isDirectory()) {
      if (!publicDirectories.has(path)) { fail(path, 'unexpected public directory'); continue; }
      inspectPublicTree(join(folder, entry.name), path);
    } else if (entry.isFile()) {
      if (!(publicRootFiles.has(path) || publicPaths.some((pattern) => pattern.test(path)))) {
        fail(path, 'unexpected public file; review and explicitly allow before publishing');
      } else if (statSync(join(folder, entry.name)).size > maxPublicFileSize) {
        fail(path, 'public file exceeds 5 MiB; review and optimize before publishing');
      }
    } else fail(path, 'unsupported filesystem entry');
  }
}
inspectPublicTree();
if (text(join(root, 'CNAME')).trim() !== new URL(siteOrigin).hostname) {
  fail('CNAME', 'custom domain does not match site canonical origin');
}

for (const page of pages) {
  const html = htmlByPage[page];
  const pageDir = dirname(join(root, page));
  const headingCount = tags(html, 'h1').length;
  if (headingCount !== 1) fail(page, `expected one h1, found ${headingCount}`);
  if (!/<main\b[^>]*\bid="main"/.test(html)) fail(page, 'missing main landmark / skip target');
  if (!html.includes('href="#main"')) fail(page, 'missing skip link');
  if (!html.includes('http-equiv="Content-Security-Policy"')) fail(page, 'missing static CSP');
  if (!html.includes('data-lightbox-dialog')) fail(page, 'missing shared screenshot viewer');
  const originalLinks = tags(html, 'a').filter((tag) => getAttr(tag, 'data-lightbox-original') !== undefined);
  if (originalLinks.length !== 1 || getAttr(originalLinks[0], 'target') !== '_blank' || !(getAttr(originalLinks[0], 'rel') || '').includes('noopener')) fail(page, 'missing safe original-image link in viewer');
  if (!html.includes('assets/site.js')) fail(page, 'missing shared behavior script');
  const canonical = tags(html, 'link').find((tag) => getAttr(tag, 'rel') === 'canonical');
  const path = page === 'index.html' ? '/' : `/${page}`;
  if (getAttr(canonical || '', 'href') !== `https://insitemanager.com${path}`) fail(page, 'incorrect canonical URL');
  // Social previews have no surrounding explanation: verify all social image paths and keep platforms in sync.
  const social = (key, attr) => getAttr(tags(html, 'meta').find((tag) => getAttr(tag, attr) === key) || '', 'content');
  const socialImages = [social('og:image', 'property'), social('twitter:image', 'name')];
  if (socialImages.some((value) => !value || !value.startsWith(`${siteOrigin}/`))) fail(page, 'social image must be a local site asset');
  if (socialImages[0] !== socialImages[1]) fail(page, 'Open Graph and Twitter preview images differ');
  for (const value of socialImages.filter((value) => value?.startsWith(`${siteOrigin}/`))) {
    if (!existsSync(join(root, value.slice(siteOrigin.length + 1)))) fail(page, `missing social image: ${value}`);
  }
  if (!social('og:description', 'property') || !social('twitter:description', 'name')) fail(page, 'missing social descriptions');


  for (const tag of tags(html, 'img')) {
    const src = getAttr(tag, 'src');
    if (getAttr(tag, 'alt') === undefined) fail(page, 'image missing alt attribute');
    if (!src && !tag.includes('data-lightbox-image')) fail(page, 'image missing src');
  }
  // Screenshot enlargement is a normal image link with an optional JS lightbox enhancement.
  for (const trigger of tags(html, 'a').filter((tag) => getAttr(tag, 'data-lightbox') !== undefined)) {
    if (getAttr(trigger, 'data-lightbox') !== getAttr(trigger, 'href')) fail(page, 'screenshot link and lightbox source differ');
  }
  if (tags(html, 'button').some((tag) => getAttr(tag, 'data-lightbox') !== undefined)) fail(page, 'screenshot uses an inert no-script button');
  for (const [tagName, name] of [['a', 'href'], ['link', 'href'], ['script', 'src'], ['img', 'src']]) {
    for (const tag of tags(html, tagName)) {
      const value = getAttr(tag, name);
      if (!value || allowedExternal.test(value)) continue;
      const [filePart, fragment = ''] = value.split('#', 2);
      const localFile = filePart ? resolve(pageDir, filePart.split('?')[0]) : join(root, page);
      if (!localFile.startsWith(root + sep) && localFile !== root) { fail(page, `path outside site: ${value}`); continue; }
      if (!existsSync(localFile)) { fail(page, `missing local resource: ${value}`); continue; }
      if (fragment && localFile.endsWith('.html')) {
        const target = text(localFile);
        if (!target.includes(`id="${decodeURIComponent(fragment)}"`)) fail(page, `missing fragment target: ${value}`);
      }
    }
  }
  if (page.startsWith('products/')) {
    const descriptions = ['name="description"', 'property="og:description"', 'name="twitter:description"']
      .map((key) => getAttr(tags(html, 'meta').find((tag) => tag.includes(key)) || '', 'content'));
    if (descriptions.some((value) => !value || !/[.!?]$/.test(value))) fail(page, 'missing or truncated product description');
    if (new Set(descriptions).size !== 1) fail(page, 'product metadata descriptions do not match');
  }
}

// Product-first hierarchy: detailed milestones are centralized rather than duplicated on product pages.
for (const name of ['insite-manager', 'insite-tools', 'sawyer', 'ronin-range']) {
  const productPage = htmlByPage[`products/${name}.html`];
  const progressPage = htmlByPage['progress.html'];
  if (!productPage.includes('class="product-direction"')) fail(`products/${name}.html`, 'missing editorial product-direction section');
  if (productPage.includes('class="feature-progress-grid"')) fail(`products/${name}.html`, 'duplicated milestone-card grid');
  if (!progressPage.includes(`id="progress-${name}"`)) fail('progress.html', `missing product milestone anchor: ${name}`);
}
// Product pages explain an actual workflow and link readers to evidence without reintroducing status cards.
const workflowLengths = { 'insite-manager': 3, 'insite-tools': 3, 'sawyer': 2, 'ronin-range': 3 };
const galleryAnchors = { 'insite-manager': 'manager', 'insite-tools': 'tools', 'sawyer': 'sawyer', 'ronin-range': 'ronin' };
for (const [name, expected] of Object.entries(workflowLengths)) {
  const page = `products/${name}.html`;
  const html = htmlByPage[page];
  const workflow = html.match(/<ol class="product-workflow"[^>]*>([\s\S]*?)<\/ol>/)?.[1];
  if (!workflow) { fail(page, 'missing editorial workflow'); continue; }
  const steps = (workflow.match(/<li>\s*<strong>[^<]+<\/strong>\s*<span>[^<]+<\/span>\s*<\/li>/g) || []);
  if (steps.length !== expected) fail(page, `expected ${expected} workflow steps, found ${steps.length}`);
  if (!html.includes(`href="../gallery.html#${galleryAnchors[name]}"`)) fail(page, 'missing product-specific screenshot link');
  if (!html.includes(`href="../progress.html#progress-${name}"`)) fail(page, 'missing product-specific qualification link');
}

// Ronin's featured scroller and editorial catalog must stay distinct, and every catalog jump must resolve.
const ronin = htmlByPage['products/ronin-range.html'];
const featuredIds = [...ronin.matchAll(/class="ronin-feature-card" id="([^"]+)"/g)].map((match) => match[1]);
const catalog = ronin.match(/<ul class="ronin-catalog-list">([\s\S]*?)<\/ul>/)?.[1] || '';
const catalogEntries = tags(catalog, 'li');
const catalogLinks = tags(catalog, 'a');
if (featuredIds.length < 4 || featuredIds.length > 6 || new Set(featuredIds).size !== featuredIds.length) fail('products/ronin-range.html', 'expected 4–6 distinct featured target cards');
if (catalogEntries.length !== 9) fail('products/ronin-range.html', `expected nine target catalog selections, found ${catalogEntries.length}`);
for (const link of catalogLinks) {
  const target = (getAttr(link, 'href') || '').slice(1);
  if (!featuredIds.includes(target)) fail('products/ronin-range.html', `catalog artwork link misses featured target: ${target}`);
}
if (!ronin.includes('ronin-feature-concept')) fail('products/ronin-range.html', 'missing concept artwork designation');

// Progress is a readable evidence catalog: readers can skip definitions and jump to each product.
const progress = htmlByPage['progress.html'];
if (!progress.includes('href="#catalog-heading"')) fail('progress.html', 'missing direct milestone navigation from hero');
if (!progress.includes('class="section progress-stage-section"')) fail('progress.html', 'missing condensed stage-explanation section');
const progressJumps = ['insite-manager', 'insite-tools', 'sawyer', 'ronin-range'];
for (const name of progressJumps) {
  if (!progress.includes(`href="#progress-${name}"`)) fail('progress.html', `missing milestone jump link: ${name}`);
}
const milestoneItemCount = (htmlByPage['progress.html'].match(/class="progress-line"/g) || []).length;
if (milestoneItemCount !== 22) fail('progress.html', `expected 22 published milestones, found ${milestoneItemCount}`);

// The published feature-state contract is capability-scoped. Catch accidental label changes or omissions.
const stageNames = {
  'stage-planned': 'Planned',
  'stage-development': 'Active Development',
  'stage-in-progress': 'Active / In Progress',
  'stage-staged': 'Staged',
  'stage-verified': 'Verified',
};
const stageLegend = progress.match(/<div class="stage-legend">([\s\S]*?)<\/div>\s*<\/div><\/section>/)?.[1] || '';
const legendStages = [...stageLegend.matchAll(/<span class="stage ([^"]+)">([^<]+)<\/span>/g)];
if (legendStages.length !== 5) fail('progress.html', `expected five stage definitions, found ${legendStages.length}`);
for (const [className, label] of Object.entries(stageNames)) {
  if (legendStages.filter(([, cls, text]) => cls === className && text === label).length !== 1) fail('progress.html', `invalid or missing stage definition: ${label}`);
}
const acceptedMilestoneCounts = {
  'insite-manager': 5,
  'insite-tools': 5,
  'sawyer': 6,
  'ronin-range': 6,
};
for (const [name, expected] of Object.entries(acceptedMilestoneCounts)) {
  const section = progress.match(new RegExp(`<section class="cross-progress-card"[^>]*id="progress-${name}"[\\s\\S]*?<\\/section>`))?.[0];
  if (!section) { fail('progress.html', `missing milestone section: ${name}`); continue; }
  const items = [...section.matchAll(/<div class="progress-line"><strong>([^<]+)<\/strong><span class="stage ([^"]+)">([^<]+)<\/span><\/div>/g)];
  if (items.length !== expected) fail('progress.html', `${name}: expected ${expected} evidence-scoped milestones, found ${items.length}`);
  for (const [, title, className, label] of items) {
    if (stageNames[className] !== label) fail('progress.html', `${name}: invalid status for ${title}: ${label}`);
  }
}

// Captions are part of the evidence boundary: browser captures are not device/field acceptance.
const galleryFigures = htmlByPage['gallery.html'].match(/<figure\b[\s\S]*?<\/figure>/g) || [];
const provenance = [
  ['e2e-tools-api-workbench.webp', 'Browser E2E view'],
  ['e2e-ronin-games-picker.webp', 'Browser E2E view'],
  ['e2e-ronin-battleship-round.webp', 'Browser E2E view'],
  ['sawyer-capture.webp', 'Earlier simulated interface'],
];
for (const [asset, expectedLabel] of provenance) {
  const figure = galleryFigures.find((value) => value.includes(`data-lightbox="assets/images/${asset}"`));
  if (!figure || !figure.includes(`<span class="visual-shot-kind">${expectedLabel}</span>`)) fail('gallery.html', `missing public provenance label for ${asset}`);
}
for (const page of ['index.html', 'products/sawyer.html']) {
  const html = htmlByPage[page];
  if (!html.includes('Earlier simulated interface') || !html.includes('sawyer-capture.webp')) fail(page, 'Sawyer example missing simulated-interface disclosure');
}
if (htmlByPage['products/sawyer.html'].includes('content="https://insitemanager.com/assets/images/sawyer-capture.webp"')) fail('products/sawyer.html', 'simulated control screenshot cannot be used as an uncaptioned social preview');

// Pass 182: every product's practical example links to a real, labeled public
// capture and to the exact milestone whose test boundary qualifies the claim.
const exampleMap = {
  'insite-manager': ['shot-designer-measurement', 'designer-measurement.webp', 'milestone-manager-planning', 'Map-first Designer and project planning', 'stage-verified'],
  'insite-tools': ['shot-tools-api-workbench', 'e2e-tools-api-workbench.webp', 'milestone-tools-operator-controls', 'Operator-gated API and device controls', 'stage-verified'],
  'sawyer': ['shot-sawyer-early-preview', 'sawyer-capture.webp', 'milestone-sawyer-s21-view', 'Saved RTSP Live and S21 Field View', 'stage-verified'],
  'ronin-range': ['shot-ronin-battleship', 'e2e-ronin-battleship-round.webp', 'milestone-ronin-local-games', 'Local Play, Games, Create, Stats and Zero', 'stage-verified'],
};
for (const [name, [shotId, imageName, milestoneId, milestoneName, stageClass]] of Object.entries(exampleMap)) {
  const page = `products/${name}.html`;
  const html = htmlByPage[page];
  if (!html.includes('class="product-example"')) fail(page, 'missing concise representative example');
  if (!html.includes(`href="../gallery.html#${shotId}"`)) fail(page, `missing direct screenshot link: ${shotId}`);
  if (!html.includes(`href="../progress.html#${milestoneId}"`)) fail(page, `missing direct evidence-scope link: ${milestoneId}`);
  const galleryFigure = galleryFigures.find((figure) => figure.includes(`id="${shotId}"`));
  if (!galleryFigure || !galleryFigure.includes(`data-lightbox="assets/images/${imageName}"`)) fail('gallery.html', `incorrect anchored public example: ${shotId}`);
  const item = progress.match(new RegExp(`<li id="${milestoneId}"><div class="progress-line"><strong>([^<]+)</strong><span class="stage ([^"]+)">`));
  if (!item || item[1] !== milestoneName || item[2] !== stageClass) fail('progress.html', `incorrect scoped milestone: ${milestoneId}`);
}
if (!htmlByPage['products/sawyer.html'].includes('public image is an earlier simulated interface')) fail('products/sawyer.html', 'missing Sawyer screenshot limitation in field example');
if (!htmlByPage['products/ronin-range.html'].includes('not a measurement of physical target accuracy')) fail('products/ronin-range.html', 'missing Ronin physical-acceptance limitation');

const sitemap = text(join(root, 'sitemap.xml'));
for (const page of pages) {
  const path = page === 'index.html' ? '/' : `/${page}`;
  if (!sitemap.includes(`https://insitemanager.com${path}</loc>`)) fail('sitemap.xml', `missing ${page}`);
}
for (const error of failures) console.error(`FAIL ${error}`);
if (failures.length) { console.error(`Site check: ${failures.length} failure(s)`); process.exitCode = 1; }
else console.log(`Site check: PASS (${pages.length} pages, local links/assets/anchors, metadata, sitemap)`);
