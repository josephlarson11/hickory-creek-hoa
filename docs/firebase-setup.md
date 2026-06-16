# Firebase Setup

The website is designed to stay free by using GitHub Pages for hosting and Firebase for authentication, Firestore, Storage, and resident submissions.

## Create the Firebase Project

1. Go to the Firebase console.
2. Create a project for Hickory Creek Owners Association.
3. Add a Web App.
4. Copy the web app configuration values.
5. In local development, copy `.env.example` to `.env.local` and fill in each `NEXT_PUBLIC_FIREBASE_*` value.
6. In GitHub, add the same values as repository secrets so GitHub Actions can build the deployed site.

## Authentication

Enable Firebase Authentication with one of these methods:

- Email/password
- Email link sign-in

Board users should be entered in the `boardUsers` Firestore collection by email address.

Example document path:

```text
boardUsers/president@example.com
```

Example fields:

```json
{
  "active": true,
  "role": "President",
  "displayName": "Board President"
}
```

Allowed roles:

- President
- Vice President
- Treasurer
- Secretary
- Director
- Administrator

## Firestore and Storage Rules

Deploy the included rules:

```bash
firebase deploy --only firestore:rules,storage
```

Rules files:

- `firebase.rules`
- `storage.rules`

## Storage And Attachments

Firebase Storage may require upgrading the Firebase project pricing plan. To keep the
initial site on a no-cost setup, attachments are disabled by default with:

```text
NEXT_PUBLIC_ENABLE_FIREBASE_STORAGE=false
```

Resident forms still save the request details to Firestore. If the board later chooses
to enable Storage, upgrade the Firebase plan, enable Storage, deploy `storage.rules`,
and set:

```text
NEXT_PUBLIC_ENABLE_FIREBASE_STORAGE=true
```

## Resident Submissions

Agenda requests and contact messages are written to:

```text
residentSubmissions
```

Request statuses:

- Submitted
- Under Review
- Added to Agenda
- Closed

If Storage is later enabled, attachments are stored under:

```text
resident-submissions/
```
