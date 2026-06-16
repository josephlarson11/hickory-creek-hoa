# Hickory Creek Owners Association Website

Modern HOA website for Hickory Creek Owners Association of Brandon Florida.

## Local Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in Firebase values before testing authentication, Firestore, or Storage.

## Static Deployment

The app uses `output: "export"` so GitHub Actions can publish the generated `out/` folder to GitHub Pages.

## Custom Domain

This project is configured for `hickorycreekbrandon.com` with `public/CNAME`.

GoDaddy DNS instructions are in `docs/godaddy-dns-setup.md`.

## Board Maintenance Docs

- `docs/firebase-setup.md`
- `docs/adding-board-members.md`
- `docs/publishing-approved-minutes.md`
