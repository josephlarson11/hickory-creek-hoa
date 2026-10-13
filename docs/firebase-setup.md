# Firebase Setup

Firebase provides Authentication, Firestore, protected Storage, and trusted Cloud Functions. GitHub Pages continues to host the public static website.

## Required plan

Protected uploads and Functions require the Blaze pay-as-you-go plan. Firebase includes no-cost quotas that should normally cover this 85-home association, but a billing method and budget alerts are required.

## Roles

The `userProfiles` collection uses three site roles:

- `resident`
- `board`
- `administrator`

Officer titles are stored separately in `boardTitle`. The legacy `boardUsers` collection is used only to bootstrap and migrate existing board accounts.

## Deploy

1. Install dependencies in `functions` and run its build.
2. From the project root, run `firebase deploy --only firestore:rules,storage,functions`.
3. Apply `storage.cors.json` to the Firebase Storage bucket with the Google Cloud CLI.
4. Confirm the production domain is authorized in Firebase Authentication.

Do not place secrets in `.env.local`, GitHub source files, or browser code. Resend credentials use Firebase Functions secrets.

Follow `secure-platform-setup.md` for exact setup, mail, migration, cost, and security-test instructions.
