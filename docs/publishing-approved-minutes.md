# Publishing Approved Meeting Minutes

Only approved minutes should appear on the public website.

## Workflow

1. Upload draft minutes to the board portal as Draft.
2. Move the minutes to Board Review when ready for board review.
3. After approval, mark the minutes Approved.
4. Export the approved minutes as a PDF.
5. Add the PDF to the public document library.
6. Mark the public document as Approved Meeting Minutes.
7. Confirm the public Documents page shows the minutes.

## Current Static Content Workflow

For GitHub Pages, place the approved PDF in:

```text
public/documents/minutes/
```

Then add a matching entry in:

```text
src/lib/content.ts
```

Use:

```json
{
  "category": "Approved Meeting Minutes",
  "isApproved": true
}
```

Draft, board review, and private meeting packet files should stay out of the public folder.
