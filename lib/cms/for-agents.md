# Editing lildarkie.com

This file is for AI agents asked to change the site's content. The record schemas it describes are defined in `lib/cms/schema.ts`.

The site is made of three kinds of records, stored as JSON.

- **site**: one record. Nav links, social links, the copyright line, the logo, the default theme and the `/files` list.
- **page**: one per URL. `/comics` is the page with slug `comics`. A page has a title, a theme and an ordered list of blocks.
- **post**: a blog entry. Posts belong to a `collection` (for example `writings`). A page shows a collection by including a `posts` block. Each published post also has its own URL at `/posts/<slug>`.

Saving replaces the whole record and is live at once. The last 10 saves of every record are kept and can be restored.

## API

Reading is public. Saving and deleting need the admin password in a header:

    Authorization: Bearer <password>

The password is the one used to log in to the admin.

| Method | Path | What it does |
| --- | --- | --- |
| GET, PUT | /api/site | Read or replace the site record |
| GET | /api/pages | List all pages |
| GET, PUT, DELETE | /api/pages/<slug> | Read, create or replace, delete a page |
| GET | /api/posts?collection=<name> | List posts, optionally from one collection |
| GET, PUT, DELETE | /api/posts/<slug> | Read, create or replace, delete a post |
| GET | /api/pages/<slug>/versions | The last 10 saves, newest first. Also for posts and /api/site/versions |
| GET | /api/media | List uploaded files |
| POST | /api/media | Upload a file (multipart form, field `file`). Returns its URL |
| GET | /api/schema | JSON schemas for the three record types |

PUT takes the full record as JSON. The slug comes from the URL. To restore an old version, PUT its `data` back. A save that doesn't match the schema returns 400 with a list of what is wrong and changes nothing.

## Pages

    {
      "slug": "comics",
      "title": "Comics",
      "theme": { "backgroundColor": "#ffffff", "textColor": "#000000" },
      "blocks": [
        { "id": "title", "type": "heading", "level": 1, "text": "Comics" },
        { "id": "intro", "type": "text", "markdown": "New strips **every week**." }
      ]
    }

Theme fields are all optional. Anything left out falls back to the site theme. Colors are hex, like `#e00910`.

| Field | What it colors |
| --- | --- |
| `backgroundColor`, `backgroundImage`, `backgroundFocus` (center, top, bottom, left, right) | The page behind the content |
| `panelColor` | The box the content sits in |
| `textColor`, `headingColor`, `font` | Body text and headings |
| `linkColor`, `linkHoverColor` | Links |
| `buttonColor`, `buttonTextColor` | Button blocks |

Fonts: `arial`, `martian-mono`, `sf-fedora`, `sf-fedora-titles`, `simple-letter`, or the `name` of a font in the site record's `fonts` list.

## Blocks

Every block needs a `type` and an `id` that is unique within the page.

| Type | Fields |
| --- | --- |
| heading | `text`, `level` (1, 2 or 3), optional `font` |
| text | `markdown` |
| image | `src`, optional `alt`, `caption`, `href` |
| slideshow | `images`, a list where each entry is an image URL or `{ "src": "...", "caption": "..." }`. The caption shows under the image |
| embed | `url` (a normal Spotify, SoundCloud or YouTube link), optional `height` |
| button | `label`, `href` |
| spacer | `size` (sm, md or lg) |
| posts | `collection`, optional `limit` |
| html | `html` (raw HTML, may include a style tag) |
| box | `blocks`, a list of any of the other blocks. Draws a panel around them. Blocks outside a box sit straight on the page background. A box can't hold another box |
| tour | `shows`, a list of `{ "date": "2026-10-17", "city", "venue" }` with optional `ticketLink`, `opener` and `soldOut`. The site sorts them and hides each one once it is over |

Every block also accepts an optional `style`: `textColor`, `backgroundColor`, `backgroundImage` and `align` (left, center, right).

Image and link fields take a path on this site (`/images/gallery/1.png`, `/comics`) or a full URL.

## Posts

    {
      "slug": "2026-04-16",
      "title": "Optional title",
      "author": "Lil Darkie",
      "date": "2026-04-16T22:12:00.000Z",
      "collection": "writings",
      "body": "<p>HTML text.</p>",
      "published": true
    }

`body` is HTML. `date` is when it was posted, as a UTC timestamp. The site shows "Posted by" with the author and that time.

A post with `"published": false` is a draft. Only the admin can see it.

## Site

    {
      "nav": [
        { "label": "Merch", "href": "https://www.smalldarkone.com" },
        { "label": "Comics", "href": "/comics" }
      ],
      "homeButtons": [{ "label": "Tour tickets", "href": "https://example.com/tickets" }],
      "landingButtons": [
        { "type": "game", "label": "red game" },
        { "type": "link", "label": "shows", "href": "/tour" },
        { "type": "link", "label": "merchandise", "href": "https://smalldarkone.com", "newTab": true },
        { "type": "link", "label": "physical music", "href": "https://racingthoughtsrecords.com", "newTab": true },
        { "type": "menu", "label": "more" }
      ],
      "social": [{ "platform": "spotify", "href": "https://open.spotify.com/artist/..." }],
      "copyright": "© 2026 Lil Darkie® All Rights Reserved",
      "theme": {}
    }

Nav links appear in the menu in this order. Social platforms: spotify, apple, soundcloud, youtube.

`logo` is optional. Set it to an image path or URL to replace the built-in logo in the top bar and the menu.

`icon` is optional. Set it to a square PNG, ICO or SVG to replace the favicon on the site and the admin. It is also used as the home screen icon on phones.

`fonts` is optional. It lists uploaded fonts as `{ "name": "Comic Neue", "url": "https://.../comic-neue.woff2" }`. Upload the file through `/api/media` first. Names use letters, numbers, spaces and dashes, must be unique, and can't match a built-in font. Files are `.woff2`, `.woff`, `.ttf` or `.otf`. A page or heading uses one by putting its `name` in `font`. Removing a font leaves pages that name it on the browser's fallback font.

The landing page has two layouts, `simple` and `painting`. `LANDING_LAYOUT` in `components/landing/layout.ts` picks one, and it is set to `simple`. The record's `landingLayout` field is no longer read. Admin → Landing edits the simple layout's buttons.

`landingButtons` controls the simple layout's list, in order. Every entry needs a `label` and a `type`. `link` also requires `href` and accepts `"newTab": true` to open in a new tab; `game` starts the game; `menu` opens the existing menu. Omit the list to use the five defaults above, or save an empty array to show no buttons. This layout uses white Arial text on black, with red hover text.

`homeButtons` are extra buttons on the painting layout, editable only through the API. They are shown in order under "Play the Game". Each has a `label` and an `href`, and optionally a `textColor`, a `backgroundColor` (a hex color or `"transparent"`) and a `size` (small, medium or large).

The original painting layout is in `components/landing/painting.tsx` and `styles/painting-landing.module.scss`. Its animated scene remains in `components/red-game/landing-scene.tsx` and `styles/landing-scene.module.scss`.

`files` is optional. It is the list shown on `/files`, in order, as `{ "label": "Red (the album)", "url": "https://w-s3.b-cdn.net/lil-darkie/files/red.zip", "size": 508559360 }`. `size` is in bytes and optional. Admin → Files uploads straight to storage, which has no size limit; through the API, upload the file somewhere first and list its URL.

The game and `/sampler` are built in code and can't be edited here.
