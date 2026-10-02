The official Lil Darkie website.

## Preview password

Set the server-only `PREVIEW_PASSWORD` variable to enable the shared-password screen. For local development, put it in `.env.local`. In Vercel, set it for the Preview environment and the intended Git branch, then deploy that branch. Do not use a `NEXT_PUBLIC_` prefix or commit the password.

The gate covers pages and local assets, except the logo on the password screen. Access lasts seven days in an HTTP-only cookie; changing the password invalidates existing cookies. Protected responses are not cached or indexed. The gate is disabled when the variable is empty or `VERCEL_ENV` is `production`.

Vercel's own Deployment Protection must be disabled for testers to reach this screen without a Vercel account.

Run `npm run test:preview` to check access, password errors, session expiry, and redirect handling.
