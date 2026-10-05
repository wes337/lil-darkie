# Red Game

After starting the game, it uses the 1080 × 1080 renders from the artist's Final export. The artwork stays square on desktop, portrait phones, and landscape phones, with a small screen margin and a grayscale frame made from the original Play button's paint texture. The arrows and inventory sit below the square. The logo stays centered at the top, with Exit at the top right.

## Assets

The CDN folder `lil-darkie/red-game/final/` (see `GAME_CDN` in `art.ts`) contains optimized WebP scenes and transparent inventory items, and the animated main room and ending as inline MP4s. `final-manifest.json` in this folder records each source frame, crop, dimensions, and size. Original source files are untouched.

The optimized assets are on the CDN, so building and running the game requires no asset conversion or access to the original export. Conversion scripts and preview files stay local. The game uses the manifest for inventory image dimensions.

The source PNG sequences contain no timing metadata, so video runs at 24 fps. The wisp uses every other frame at 12 fps. Reduced motion uses the static room and wisp artwork and advances directly to the ending's story cards.

Music begins from the start button click in either landing layout, loops across rooms and the ending, pauses when the document is hidden, and stops when the game exits. Music plays at 45% volume and sound effects at 50%, with the ambient computer hum softer still. These levels are defined in `audio.ts`. The interaction sound effects are in the CDN folder `lil-darkie/red-game/sounds`.

The soundtrack alternates between two MP3s, starting with track 1 and repeating after track 2. Each is 128 kbps stereo at 44.1 kHz. Track 1 is 2.61 MB and track 2 is 3.02 MB, down from 101.51 MB of WAVs in total. Only track 1's metadata loads on the landing page. After a minute of playback, a hidden audio element asks the browser to preload track 2. The playing element switches sources on each ended event, preserving mobile Safari's audio unlock. Exiting cancels the preload.

The CDN serves `music/escape-room-1-4f8ace32b060.mp3` and `music/escape-room-2-7a61ff94c3cd.mp3`. The content hashes avoid stale cached music. Source WAVs and local `web/escape-room-1.mp3` and `web/escape-room-2.mp3` remain outside the repo under `E:\Development\lil-darkie\red-game`.

To reproduce the files from that source folder:

```sh
ffmpeg -i "escape room (1).wav" -map 0:a:0 -map_metadata -1 -map_chapters -1 -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "web/escape-room-1.mp3"
ffmpeg -i "escape room (2).wav" -map 0:a:0 -map_metadata -1 -map_chapters -1 -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 "web/escape-room-2.mp3"
```

## Playing

Click or tap an object to explore. Select an inventory item, then its target. Selecting the same item again puts it away. Escape closes the current message, deselects an item, or returns from a close-up. Room turns and close-ups fade through black, including entering and leaving prop detail views. Prop text appears after the artwork fades in. Keyboard focus stays on the active view.

Admin → Landing chooses between a simple button list and the original painting. The simple layout uses white Arial links on black, with red hover text. Its labels, order, links and game/menu actions are editable. The painting layout retains its responsive artwork, entrance animation, mouse parallax, logo, menu, footer and extra buttons. Both layouts keep their own button lists. See `components/landing/painting.tsx` and `styles/painting-landing.module.scss` for the preserved layout.

Starting play fades the entire page to dark, switches to the framed Final artwork and Exit button under cover, then fades the game in. Reduced motion skips the fade. Progress belongs to the current game only. Either EXIT button or a page refresh returns to the selected landing layout and resets the game. Exiting also stops the music.

## Puzzle rules

- Exhaust the three hole conversation topics and request help to receive Imaginary Friend. Put it into the torn bear.
- Find Needle above the doorframe and use it on the desk thread. This can happen before speaking to Bambi.
- Use Needle and Thread on the inhabited bear. The repair sequence awards Bambi and removes the bear from the sink wall.
- Return Bambi to the hole for Empty Glass. Fill it at the sink, water the flower, and insert the USB reward into the computer tower.
- USB unlocks `psswrd` and `prjct`. The password document contains the authored riddle.
- Safe code `100698` always works. After entering it, return to the safe and turn its handle. Key and CD are independent pickups.
- CD insertion requires USB and unlocks `xtra`.
- Key on the doorknob plays the supplied escape film, followed by YOU ARE FREE, YOU ALWAYS HAVE BEEN, and red. EXIT returns to the landing screen.

Invalid item use preserves the item and deselects it. Rewards cannot be collected twice. Wrong safe codes clear the input and permit another attempt. The development build has a Skip animation button; production does not.

## Downloads

The two rewards use the site's signed downloads, defined in `lib/signed-downloads.ts`. The ZIPs are in the Bunny storage zone `w-sig` under `lil-darkie/red-game/`.

- `prjct` opens the `red-album` download, `red (the album).zip`. It appears once the USB is in the computer.
- `xtra` opens the `red-bonus-track` download, `red (bonus track).zip`. It appears once the CD is inserted too.

Clicking an icon POSTs to `/api/downloads/<id>`, which returns a link signed for one hour, and the browser then downloads from it. The route only answers requests made by this site's own pages, so there is no link to paste elsewhere.

### Proof of a solved game

The server only signs a link for a game that was solved. `lib/red-game-proof.ts` does the check.

- When the game starts it gets a session from `/api/red-game/session`: a random id and the start time, signed with `RED_GAME_SESSION_SECRET`. Nothing is stored for it. It lasts 3 hours.
- The game records each move that changes something. A download request sends the session and those moves.
- The server replays the moves through `game-model.ts` from a new game. `prjct` needs the replay to end with the USB inserted, `xtra` with the CD inserted.
- A game has to be at least 35 seconds old, and gets 5 links per file.
- Exiting ends the session: the game tells the server without waiting, and the server marks it so the token gets no more links. If that request is lost, the session still expires by itself.

Redis holds one sorted set per session, `<namespace>:red-game:session:<id>`, under the same `prod` or `dev` namespace as the CMS. It counts the links signed for each file, holds the mark for an ended session, and expires with the session. Play times are not recorded.

This proves a valid solution was sent, not that someone played. The rules ship with the game, so a solution can be written out by hand.

## Code and checks

- `game-model.ts` owns puzzle progress and inventory rules.
- `final-art.ts` maps progress to rendered scenes and defines room targets as percentages.
- `room-scene.tsx`, `prop-closeup.tsx`, and `puzzle-views.tsx` place interactions over the supplied renders.
- `room-props.tsx` displays the supplied inventory art. Navigation and painted buttons retain the previous UI artwork because Final contains no replacements.
- `red-game.tsx` handles transitions, audio, input locking, and focus.
- `game-sequence.tsx` handles repair, the escape video, reduced motion, and playback failures.

Run `npm run test:game` for puzzle routes and rendered state mappings. Run `npm run build` for the production build.
