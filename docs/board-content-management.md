# Board Content Management

The board portal supports no-cost content management through Firestore.

## What Board Members Can Edit Online

After signing in at `/board`, approved board members can:

- Review resident submissions and change statuses.
- Create and publish announcements.
- Add public document listings.
- Add calendar events.
- Add gallery listings.
- Hide Firestore-managed document, calendar, and gallery items.

## Important No-Cost Limitation

Firebase Storage is disabled to avoid upgrading the Firebase plan. That means the
board portal does not upload PDF or image files directly.

For documents and photos:

1. Replace or add the PDF/image in the website project.
2. Publish the update through GitHub.
3. In the board portal, add or update the listing path.

Common paths:

```text
/documents/restrictions/example.pdf
/documents/minutes/example.pdf
/images/example.jpg
```

## Publishing Announcements

1. Sign in to `/board`.
2. Complete the announcement form.
3. Check `Publish to the public announcements page`.
4. Click `Save announcement`.

Published announcements appear on `/announcements`.

## Calendar Events

Use the calendar form in the board portal. Events marked `Show publicly` appear on
`/calendar`.

## Public Document Listings

Use the document listing form in the board portal. A listing must be both:

- Approved
- Show publicly

Only then will it appear on `/documents`.

## Gallery Listings

Use the gallery form in the board portal. The image path must point to an image
already available in the website project.
