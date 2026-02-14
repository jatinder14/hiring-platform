# Why User Stays Logged In After Deleting from Database

## 1. The Reason: JWT Strategy
Your application (`lib/auth.ts`) uses the **JWT strategy** for sessions:

```typescript
session: {
  strategy: "jwt",
},
```

When a user logs in:
1.  **NextAuth creates a JWT (JSON Web Token)** containing the user's data (ID, email, name, picture).
2.  **This token is signed** and stored in an **HTTP-only cookie** in the user's browser.
3.  **On subsequent requests**, the browser sends this cookie.
4.  **NextAuth verifies the signature** of the token. If valid, it trusts the data inside it **without checking the database**.

**Result:** Even if you delete the user from MongoDB, the valid token still exists in their browser cookie. NextAuth sees the valid token and assumes the user is logged in. It does not know the database record is missing unless you explicitly program it to check on every request (which is slower).

## 2. Google Access Token Validity vs. App Session

There are two different "tokens" at play here:

### A. Google Access Token
-   **Where is it?** It is stored in your MongoDB `accounts` collection.
    -   You can see the schema in `models/Account.ts`:
        ```typescript
        access_token: { type: String },
        expires_at: { type: Number },
        ```
-   **Validity:** The 1-hour expiration is determined by Google's OAuth servers when they issue the token. It is **not written as a constant** in your code; instead, Google sends an `expires_in` value (usually 3599 seconds), which NextAuth saves as `expires_at` in the database.
-   **Purpose:** Allows your app to fetch data *from Google* (like their calendar or contacts) on their behalf.
-   **Test:** If you change this token in MongoDB, it will only affect calls to Google APIs. It **will not** log the user out of your app because your app uses its own session cookie.

### B. Your App Session (NextAuth Session Token)
-   **Where is it?** In the user's browser cookies.
-   **Name:** `next-auth.session-token` (or `__Secure-next-auth.session-token` in production).
-   **Validity:** Default is **30 days** (configurable in `session.maxAge`).
-   **Test:**
    1.  Open your browser's Developer Tools (F12).
    2.  Go to the **Application** tab (Chrome) or **Storage** tab (Firefox).
    3.  Expand **Cookies** and select your localhost/domain.
    4.  Find `next-auth.session-token`.
    5.  **Modify it:** If you change even one character of this value, the signature verification will fail on the next request, and the user will be logged out immediately.
    6.  **Delete it:** The user will be logged out immediately.

## 3. Understanding Your Decrypted Token

Here is what each field in your JSON object means:

-   **`name`**: "Sachit Kumar"
    -   Your full name as provided by Google. Used for display.

-   **`email`**: "sachit650@gmail.com"
    -   Your unique email address. Used for identification.

-   **`picture`**: "https://lh3.googleusercontent.com/..."
    -   Your Google profile photo URL.

-   **`sub`**: "699016e44..."
    -   **"Subject"**. This is your unique **User ID** in your MongoDB database (`_id`).
    -   It connects this session to a specific user record in your database.

-   **`role`**: "candidate"
    -   **Your Custom Field.** We added this in `lib/auth.ts`.
    -   It tells the app whether you are a "candidate" or "recruiter".

-   **`iat`**: 1771053354
    -   **"Issued At"**. The timestamp (in seconds) when this token was created.

-   **`exp`**: 1773645354
    -   **"Expiration"**. The timestamp when this token will stop working (usually 30 days after `iat`).

-   **`jti`**: "ac69bb01-4e0a..."
    -   **"JWT ID"**. A unique identifier for this specific token.
    -   It is used to prevent **replay attacks** (reusing a token that shouldn't be used again) and can be used for **token revocation** (blacklisting this specific ID).

## Summary
The user remains logged in because **their session lives in the browser cookie (JWT)**, not just in the database. To force a logout when a user is deleted, you would need to add a database check in the `jwt` callback or use the `database` session strategy (which checks the DB on every request but is slower).