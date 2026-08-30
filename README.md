# InsiteManager Website

Public showcase site for [InsiteManager](https://insitemanager.com/), an independently developed security-systems engineering and operations platform.

This repository intentionally contains only the files served by the public website. The InsiteManager application, development records, deployment configuration, credentials, and private project data are maintained separately.

## Website contents

- Responsive, one-page platform overview
- Product screenshots optimized for the web
- Screenshot lightbox
- Platform, workflow, progress, and engineering sections
- Social preview, favicon, and touch icon assets
- Search-engine discovery files
- No framework, package manager, tracking script, third-party font, or runtime dependency

## Local preview

From the repository root, start any static file server. For example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Project structure

```text
index.html          Public page content and metadata
assets/site.css     Visual system and responsive layouts
assets/site.js      Navigation, reveal behavior, and screenshot viewer
assets/images/      Optimized demonstration screenshots and social preview
assets/icons/       InsiteManager marks
robots.txt          Search-crawler policy
sitemap.xml         Public URL index
CNAME               Custom-domain declaration
```

No build step is required. Publish the repository root through a static host with HTTPS enabled.

## Public repository boundary

Before publishing changes, confirm that the repository contains only material intended for unrestricted public access.

Do not commit:

- Credentials, tokens, `.env` files, or authorization headers
- Personal contact details or account-specific hosting instructions
- Private DNS records, network addresses, device identifiers, or customer information
- Application source, internal development notes, captured logs, or diagnostic bundles
- Unsanitized project exports or screenshots containing private operational data

The included screenshots use demonstration workflows. New screenshots should be reviewed at full resolution before they replace an existing asset.

## Development status

InsiteManager is an independent project in active development. The website describes current working surfaces and intended direction without claiming commercial availability. Features, integrations, and deployment architecture may evolve.
