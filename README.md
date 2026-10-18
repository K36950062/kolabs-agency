# KOLABS Agency website

Booking-focused websites for UK activity venues. The live site is in `site/index.html`.

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
npx html-validate site/          # the same HTML check CI runs
npx serve site                   # preview at http://localhost:3000
```

## First updates to practise on

- [ ] Replace `[your agency email]` in the Contact section
- [ ] Replace `[phone number]` in the Contact section
- [ ] Point "Book a 20-minute call" at a real booking link (Calendly, Cal.com)
- [ ] Share the two concept pages publicly so the "View the concept" links open for visitors
- [ ] Swap the placeholder logo for the final KOLABS mark
- [ ] Add a custom domain (Settings > Pages > Custom domain)
