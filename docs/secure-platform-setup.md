# Secure Platform Setup and Costs

The website remains hosted by GitHub Pages. Protected data is served by Firebase, and official website email is sent and received through Resend.

## What the audit found

- `hickorycreekbrandon.com` points to GitHub Pages and uses GoDaddy nameservers.
- The domain has no MX record, so `info@hickorycreekbrandon.com` is not currently a mailbox or forwarder.
- The domain purchase itself does not include email. The site currently has no included hosting mailbox because hosting is GitHub Pages.
- A DMARC record exists, but SPF, mail-provider MX, and provider DKIM records still need to be configured.
- The existing utility Gmail account is not changed or connected.

## Expected cost

- GitHub Pages: no recurring hosting charge for this site.
- Firebase: upgrade to Blaze (pay as you go) and add a billing method. An 85-home association should normally remain inside Firebase's no-cost Storage and Functions quotas, but billing alerts do not cap spending.
- Resend: the current free plan includes up to 3,000 messages per month and 100 per day. The current Pro plan is $20 per month if the association outgrows that limit or needs paid-plan features.
- GoDaddy Microsoft 365 is an alternative mailbox product. GoDaddy says email is not included with a domain purchase; its advertised first-year mailbox prices renew at higher rates. This implementation does not require a GoDaddy mailbox.

Pricing changes over time. Confirm the provider checkout page before approving any paid plan.

## One-time Firebase setup

1. In Firebase Console, open **Usage and billing** and upgrade the project to **Blaze**.
2. In Google Cloud Billing, create budget alerts at $1, $5, and $20. Alerts are warnings, not spending caps.
3. In Firebase Console, open **Storage** and create the default bucket in a United States region.
4. Install Node.js and the Firebase CLI on the administrator's computer.
5. From this project folder, run `npm install -g firebase-tools`, then `firebase login`.
6. In the `functions` folder, run `npm install` and `npm run build`.
7. Return to the project root and run `firebase deploy --only firestore:rules,storage,functions`.
8. In Firebase Authentication, add `hickorycreekbrandon.com` to authorized domains.
9. Install and sign in to the Google Cloud CLI, then run `gcloud storage buckets update gs://hickory-creek-owners-assoc.firebasestorage.app --cors-file=storage.cors.json` from the project root. This permits authenticated browser uploads/downloads only from the production site and local development origin; Firebase Storage Rules still decide who may access each file.

## Migrate the existing gallery photos

Four previously public community photos were removed from the deployable `public/images` folder and retained locally under `.private-migration/gallery`. After Storage is enabled:

1. Sign in as a board member and open **Community**.
2. Upload each retained photo with **Add community photo**.
3. Verify each photo opens for a resident account and fails while signed out.
4. Archive the older gallery record that says it awaits secure migration.

The `.private-migration` folder is intentionally ignored by Git so these photos are not republished through the public repository.

## Bootstrap the first administrator

The existing `boardUsers` record for the first administrator must contain:

```text
active: true
siteRole: Administrator
```

Sign in once. In the portal's **Administration** section, enter that same email, choose **Administrator**, keep the account active, and save. After this migration, administrator authority is stored in `userProfiles` and is separate from an officer title such as Secretary.

## One-time Resend setup

1. Create an association-controlled Resend account. Enable MFA and add a second current officer as an owner.
2. Add `hickorycreekbrandon.com` as a sending domain.
3. In GoDaddy DNS, add the exact DKIM and SPF records shown by Resend. Do not overwrite unrelated records without checking them first.
4. Configure Resend inbound receiving for `board@hickorycreekbrandon.com` and add the exact MX record it supplies.
5. Create an API key limited to sending and run `firebase functions:secrets:set RESEND_API_KEY`.
6. Deploy Functions, copy the public `resendWebhook` URL, and create a Resend webhook for `email.received`, delivered, bounced, and failed events.
7. Copy the webhook signing secret and run `firebase functions:secrets:set RESEND_WEBHOOK_SECRET`.
8. Deploy Functions again.
9. Add `NEXT_PUBLIC_OFFICIAL_EMAIL_ACTIVE=true` as a GitHub Actions repository variable or build environment value, then redeploy the website.
10. Test only with board-controlled email addresses. Obtain approval before sending to any resident.

## GitHub deployment

The public site remains a static Next.js export deployed by `.github/workflows/deploy.yml`. Firebase rules and Functions are deployed separately because they require billing and secrets. Never add the Resend API key, Firebase service account, passwords, or recovery codes to GitHub source files.

## Security verification before launch

1. Signed out: the home, sign-in, access request, and contact pages work; protected Firestore reads fail.
2. Pending account: the user can see that approval is pending but cannot read resident content.
3. Resident: resident documents and announcements open; board-only documents, access requests, votes, users, and correspondence fail.
4. Board member: resident features, access review, proposals, votes, permitted document management, and correspondence work; administrator role changes fail.
5. Administrator: role and voting-setting controls work.
6. Direct file test: copy a protected Storage object URL/path into a signed-out browser. The request must fail. The application must never call Firebase `getDownloadURL` for protected files.
7. Vote test: cast twice as one board member and confirm one current ballot plus two history records; close an unconfirmed-rule vote and confirm it is not labeled passed.
8. Email test: send only to a board-controlled address, reply, and confirm the delivery status and inbound record.
