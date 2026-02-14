# NextAuth Authentication & Token Flow Explained

This document explains how authentication works in your application using NextAuth.js with Google and GitHub providers.

## 1. Token Verification & Exchange Flow

When a user clicks "Sign in with Google":

1.  **Initiation**: Your app redirects the user to Google's authorization server.
2.  **User Consent**: The user logs in to Google and grants permission.
3.  **Callback**: Google redirects the user back to your app (`/api/auth/callback/google`) with a temporary **code**.
4.  **Exchange (Server-Side)**:
    *   NextAuth takes this **code** and sends it directly to Google's server (back-channel communication).
    *   Google verifies the code and returns an **Access Token** (and optionally a Refresh Token and ID Token).
    *   **Verification**: This exchange confirms the user's identity because only your server (with the valid `CLIENT_SECRET`) could exchange the code.
5.  **Session Creation**:
    *   NextAuth verifies the ID Token from Google to get user details.
    *   It creates a **NextAuth Session Token** (JWT) for your specific app.
    *   This session token is encrypted and signed with your `NEXTAUTH_SECRET`.

## 2. Token Storage

Based on your `lib/auth.ts`, you are using `{ strategy: "jwt" }`.

*   **Browser (Client)**: The Session Token is stored in a **Secure, HTTP-Only Cookie** named `next-auth.session-token`.
    *   **Secure**: Sent only over HTTPS.
    *   **HTTP-Only**: Cannot be accessed by client-side JavaScript (protects against XSS attacks).
*   **Server**: NextAuth decodes and verifies this cookie on every request to identify the user.
*   **Provider Tokens**: The raw Google/GitHub access tokens are usually discarded after the initial check unless you explicitly save them in the JWT callback.

## 3. Expiration & Refreshing

### Session Token
Your config sets `maxAge: 30 * 24 * 60 * 60` (30 days).
*   **Validity**: The user stays logged in for 30 days.
*   **Sliding Session**: Each time the user visits, the expiry time is extended, keeping them logged in.

### Provider Tokens (Google/GitHub)
*   External access tokens (e.g., to access Google Drive) expire quickly (e.g., 1 hour).
*   **Refresh**: Since you use `jwt` strategy without custom logic, NextAuth does *not* automatically refresh the *Google* access token for you. If you need one for API calls, you must implement token rotation in the `jwt` callback.
*   **Note**: For just "signing in," you do not need to refresh the Google token. NextAuth's own session token is enough.

## 4. Information Retrieval

By default, NextAuth extracts limited info:
*   `name`
*   `email`
*   `image` (avatar)

**To get more data (e.g., User ID, Provider Access Token):**
You must modify the callbacks in `authOptions`:

```typescript
callbacks: {
  async jwt({ token, account }) {
    // Persist the OAuth access_token from provider to the token
    if (account) {
      token.accessToken = account.access_token
      token.id = account.providerAccountId
    }
    return token
  },
  async session({ session, token }) {
    // Send properties to the client
    session.accessToken = token.accessToken
    // session.user.id = token.id
    return session
  }
}
```

## 5. Security (No Passwords)

Since you use OAuth (Google/GitHub):
*   **Zero Knowledge**: Your app never sees or stores a password.
*   **Trust Chain**: You trust Google to verify the user identity.
*   **Risks**:
    *   If a user's Google account is compromised, their account on your app is too.
    *   **Session Hijacking**: Protected by `httpOnly` and `Secure` cookies.
    *   **CSRF**: NextAuth adds CSRF tokens to forms automatically to prevent unauthorized actions.

## 6. Account Linking (Google vs. GitHub)

**Scenario**: User signs in with Google (`user@gmail.com`), then later with GitHub (`user@gmail.com`).

*   **Without a Database Adapter**: NextAuth treats these as separate sessions but might detect the same email.
*   **Security Check**: By default, NextAuth prevents automatic merging of accounts with the same email if one is not verified, to prevent account takeovers.
    *   *Example*: I create a GitHub account with *your* email (if GitHub didn't verify it properly) and login; NextAuth would stop me from accessing your Google-created account.
*   **Linking**: If you want a single User ID for both logins:
    1.  Use a database adapter (Prisma, etc.) to store Users and Accounts.
    2.  Set `allowDangerousEmailAccountLinking: true` in the provider config (use with caution).
