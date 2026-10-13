# Board Content Management

Use `https://hickorycreekbrandon.com/sign-in/` and then work in the private portal.

Board members can:

- Post announcements for approved residents.
- Add private community calendar events and gallery photos.
- Review resident account requests and submissions.
- Upload, replace, classify, and archive protected documents.
- Initiate and cast board votes.
- Send and review official correspondence after mail activation.

Administrators can additionally manage account roles and confirm the governing voting rule.

The old `/board-portal`, public announcement, calendar, gallery, document, and request routes redirect to sign-in or the new portal. Existing Firestore content remains in place and is read inside the authenticated portal during migration.

See `secure-portal-administration.md` for step-by-step operating instructions.
