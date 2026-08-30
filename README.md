# InsiteManager.com — Website v1

Standalone static showcase site for **InsiteManager**. This repository is intentionally separate from the application repository and contains only public-facing website assets.

## What is included

- Responsive one-page product / engineering portfolio
- Current InsiteManager screenshots, optimized to WebP
- Screenshot lightbox
- Platform, workflow, progress, and engineering sections
- Open Graph / social preview image
- Favicon + Apple touch icon
- `robots.txt` + `sitemap.xml`
- `CNAME` for `insitemanager.com`
- `.nojekyll` for GitHub Pages
- No framework, package manager, tracking script, third-party font, or runtime dependency

## Local preview

From the repository root:

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Recommended GitHub repository

Create a dedicated repository such as:

```text
insitemanager-site
```

Do **not** merge this public website into the InsiteManager application repository.

Copy the contents of this package to the repository root, commit, and push to `main`.

## Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose branch **main** and folder **/(root)**.
5. Save.
6. Under **Custom domain**, enter `insitemanager.com`.
7. Leave the included `CNAME` file in the repository root.

## GoDaddy DNS

For the apex domain (`insitemanager.com`), GitHub currently documents these A records:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

For `www`, point the CNAME at the GitHub Pages account host. If this site is published under the current `bamgitbam` GitHub account:

| Type | Name | Value |
|---|---|---|
| CNAME | www | bamgitbam.github.io |

Remove conflicting apex A/AAAA/ALIAS/ANAME records or conflicting `www` CNAME records before expecting GitHub's HTTPS certificate to issue.

After DNS resolves, return to **GitHub → Settings → Pages** and enable **Enforce HTTPS** when available.

### Strongly recommended domain-security step

GitHub recommends verifying the custom domain at the account level with the TXT record it provides under **GitHub account Settings → Pages**. Keep that TXT record after verification to help prevent domain takeover.

## Before changing DNS

Keep the current live domain untouched until this site has been reviewed from its temporary GitHub Pages URL. DNS should be the final controlled change.

## Editing content

The site is intentionally simple:

```text
index.html          page content / metadata
assets/site.css     complete visual system + responsive layout
assets/site.js      mobile menu, reveal behavior, screenshot lightbox
assets/images/      optimized screenshots + social preview
assets/icons/       InsiteManager brand marks
```

No build step is required.

- Pre-publish polish: tightened desktop spacing and clarified security-focused, private-network-capable, and offline-resilient positioning without making unsupported encryption claims.

- Responsive hero pass: preserved desktop, retained the two-column product view through 901–1040 px, tightened short landscape layouts, reduced phone headline/spacing, and moved security/private-network/offline proof points after the product screenshot on stacked layouts.
