# Hickory Creek Owners Association Website

Secure HOA website for Hickory Creek Owners Association of Brandon Florida.

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

## Administration and Security Docs

- `docs/firebase-setup.md`
- `docs/board-content-management.md`
- `docs/adding-board-members.md`
- `docs/publishing-approved-minutes.md`
- `docs/secure-portal-administration.md`
- `docs/secure-platform-setup.md`

The public site is intentionally minimal. Approved residents use `/portal`; new residents use `/access-request`. Firebase Security Rules enforce role access, and Firebase Functions handle approvals, role changes, vote history/results, and official email.
