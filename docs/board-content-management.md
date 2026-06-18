# Board Content Management

The board portal supports no-cost content management through Firestore.

## What Board Members Can Edit Online

After signing in at `/board-portal`, approved board members can:

- Review resident submissions and change statuses.
- Create, edit, and publish announcements.
- Add and edit calendar events.
- Add gallery listings.
- Access restricted board documents through the board-only Google Drive link.
- Save board-only document links in the Private Board Documents area.

## Document Restriction Policy

Documents should not be stored in `public/documents`.

GitHub Pages cannot password-protect files in the public website folder. If a
document is committed under `public/documents`, it can be accessed by direct URL.

Use the restricted Google Drive folder for association documents. Share files
with specific approved board member emails, then save the restricted link in the
Board Portal if a board-only listing is needed.

## Publishing Announcements

1. Sign in to `/board-portal`.
2. Complete the announcement form.
3. Check `Publish to the public announcements page`.
4. Click `Save announcement`.

Published announcements appear on `/announcements`.

## Calendar Events

Use the calendar form in the board portal. Events marked `Show publicly` appear on
`/calendar` and on the home page Upcoming Meetings panel.

## Gallery Listings

Use the gallery form in the board portal. The image path must point to an image
already available in the website project.
