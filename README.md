# KOLABS Agency website

Fixed-price websites for small businesses across the UK. Part of KOLABS, the community. The live site is in `site/index.html`.

## How changes go live

Every change goes through the same pipeline (`.github/workflows/ci-cd.yml`):

```
edit  ->  commit  ->  push  ->  CI: validate HTML + check links  ->  CD: deploy to GitHub Pages
```

If CI fails, nothing is deployed and the live site stays as it was. You can see every run in the repo's **Actions** tab.

## Day-to-day workflow

**Quick change, straight to live:**

```bash
git pull
# edit site/index.html
git add site/index.html
git commit -m "Update contact email"
git push
```

**Safer change, checked before it goes live (the professional habit):**

```bash
git switch -c contact-details        # new branch
# edit, then commit
git push -u origin contact-details
```

Open a pull request on GitHub. CI runs on it, but nothing deploys. When the checks are green, merge it and the deploy runs.

**Undo a bad release:**

```bash
git revert HEAD    # makes a new commit that undoes the last one
git push           # pipeline redeploys the previous version
```

## Check locally before pushing

```bash
npx html-validate@9.4.1 site/    # the same HTML check CI runs
npx serve site                   # preview at http://localhost:3000
```

## Checklist

- [x] Real email and phone number in the Contact section
- [x] "Book a 20-minute call" goes to Calendly
- [x] Set the Calendly event length to 20 minutes, to match the site
- [x] Share the two concept pages privately with each business when pitching
- [x] Swap the placeholder logo for the final KOLABS mark
- [x] Google: page title and description, sitemap, Search Console
- [x] Add a custom domain (Settings > Pages > Custom domain)
