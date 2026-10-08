The official Lil Darkie website.

## Preview password

Set the server-only `PREVIEW_PASSWORD` variable to enable the shared-password screen. For local development, put it in `.env.local`. In Vercel, set it for the Preview environment and the intended Git branch, then deploy that branch. Do not use a `NEXT_PUBLIC_` prefix or commit the password.

The gate covers pages and local assets, except the logo on the password screen. Access lasts seven days in an HTTP-only cookie; changing the password invalidates existing cookies. Protected responses are not cached or indexed. The gate is disabled when the variable is empty or `VERCEL_ENV` is `production`.

Vercel's own Deployment Protection must be disabled for testers to reach this screen without a Vercel account.

Run `npm run test:preview` to check access, password errors, session expiry, and redirect handling.

## Editable content

The nav, the content pages and the blog posts live in Redis and are edited at `/admin`. The game on `/` and `/sampler` are code. `lib/cms/for-agents.md` explains the record format and the API for AI agents, and `/api/schema` serves the JSON schemas.

Secrets, all server-only:

- `ADMIN_PASSWORD` unlocks `/admin` and is the bearer token for API saves, until the password is changed in the admin. A changed password is stored as a hash in Redis and replaces this one. With neither set, nothing can be saved.
- `REDIS_URL` is the one Redis database. Keys are prefixed `prod:` on the production deploy and `dev:` everywhere else, so local and preview edits never touch the live site.
- `BUNNY_STORAGE_KEY` is for uploads, which go to the `lil-darkie/cms` folder of the storage zone.
- `BUNNY_S3_PASSWORD` is the password of the `wes-s3` storage zone, which the Files page uploads to through Bunny's S3 API. Files go to its `lil-darkie/files` folder and are served from `w-s3.b-cdn.net`.

Commands:

- `node --env-file=.env.local seed/seed.ts dev` fills a namespace with the starting content. It skips records that already exist unless you add `--force`.
- `node --env-file=.env.local seed/copy.ts dev prod` copies every record from one namespace to another.
- `node --env-file=.env.local seed/reset-password.ts prod` forgets a password changed in the admin, so `ADMIN_PASSWORD` works again.
- `npm run test:cms` checks record validation and admin auth.
