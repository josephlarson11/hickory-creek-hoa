# GoDaddy DNS Setup for hickorycreekbrandon.com

Use these records after the site repository is connected to GitHub Pages.

## GitHub Pages Settings

1. Open the GitHub repository.
2. Go to Settings > Pages.
3. Set Source to GitHub Actions.
4. Set Custom domain to `hickorycreekbrandon.com`.
5. Enable Enforce HTTPS after GitHub finishes checking the domain.

The project includes `public/CNAME`, so every deployment publishes the custom domain file automatically.

## GoDaddy DNS Records

In GoDaddy, open the DNS management page for `hickorycreekbrandon.com`.

Create or update these records:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 1 hour |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |
| CNAME | www | your-github-username.github.io | 1 hour |

Replace `your-github-username` with the GitHub account or organization that owns the repository.

## Verification

DNS can take a few minutes to several hours to settle. Once GitHub shows the domain as verified, visit:

- `https://hickorycreekbrandon.com`
- `https://www.hickorycreekbrandon.com`

If `www` does not redirect automatically, keep the CNAME record in place and confirm GitHub Pages has the apex domain set as the custom domain.
