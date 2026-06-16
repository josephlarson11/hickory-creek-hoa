# Adding Future Board Members

Only an administrator should add or remove board members.

## Add a Board Member

1. Create the user in Firebase Authentication using the board member's email address.
2. Add a Firestore document in `boardUsers`.
3. Use the email address as the document ID.
4. Set `active` to `true`.
5. Assign one role.

Example:

```text
Collection: boardUsers
Document ID: secretary@example.com
```

```json
{
  "active": true,
  "role": "Secretary",
  "displayName": "Secretary Name"
}
```

## Remove Access

Set `active` to `false` in the user's `boardUsers` document. This preserves an access history while immediately blocking board-only records.

## Reset Access

Use Firebase Authentication to send a password reset email or a new sign-in link.
