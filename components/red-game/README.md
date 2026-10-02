# Red Game

After Play the Game, the game uses the 1080 × 1080 renders from the artist's Final export. The artwork stays square on desktop, portrait phones, and landscape phones, with a small screen margin and a grayscale frame made from the Play button's paint texture. The arrows and inventory sit below the square. The logo stays centered at the top, with Exit at the top right.

## Assets

`public/red-game/final/` contains optimized WebP scenes and transparent inventory items, the animated main room and ending as inline MP4s, and the supplied `josh website demo.m4a` as `music.m4a`. `manifest.json` records each source frame, crop, dimensions, and size. Original source files are untouched.

The optimized assets are checked in, so building and running the game requires no asset conversion or access to the original export. Conversion scripts and preview files stay local. The game uses the manifest for inventory image dimensions.

The source PNG sequences contain no timing metadata, so video runs at 24 fps. The wisp uses every other frame at 12 fps. Reduced motion uses the static room and wisp artwork and advances directly to the ending's story cards.

Music begins from the Play the Game click, loops across rooms and the ending, pauses when the document is hidden, and stops when the game exits. Music plays at 45% volume and sound effects at 15%, with the ambient computer hum softer still. These levels are defined in `audio.js`. The existing interaction sound effects remain in `public/red-game/sounds`.

## Playing

Click or tap an object to explore. Select an inventory item, then its target. Selecting the same item again puts it away. Escape closes the current message, deselects an item, or returns from a close-up. Room turns and close-ups fade through black, including entering and leaving prop detail views. Prop text appears after the artwork fades in. Keyboard focus stays on the active view.

The landing page fills the viewport with the original layered painting, its responsive desktop/mobile artwork, entrance animation, and mouse parallax. It shows the logo, menu, and footer. Starting play fades the entire page to dark, switches to the framed Final artwork and replaces the menu with Exit under cover, then fades the game in. Reduced motion skips the fade. Progress belongs to the current game only. Either EXIT button or a page refresh returns to the painting and resets the game. Exiting also stops the music.

## Puzzle rules

- Exhaust the three hole conversation topics and request help to receive Imaginary Friend. Put it into the torn bear.
- Find Needle above the doorframe and use it on the desk thread. This can happen before speaking to Bambi.
- Use Needle and Thread on the inhabited bear. The repair sequence awards Bambi and removes the bear from the sink wall.
- Return Bambi to the hole for Empty Glass. Fill it at the sink, water the flower, and insert the USB reward into the computer tower.
- USB unlocks `psswrd` and `prjct`. The password document contains the authored riddle.
- Safe code `100698` always works. After entering it, return to the safe and turn its handle. Key and CD are independent pickups.
- CD insertion requires USB and unlocks `xtra`.
- Key on the doorknob plays the supplied escape film, followed by YOU ARE FREE, YOU ALWAYS HAVE BEEN, and RED. EXIT returns to the landing screen.

Invalid item use preserves the item and deselects it. Rewards cannot be collected twice. Wrong safe codes clear the input and permit another attempt. The development build has a Skip animation button; production does not.

## Download configuration

Set these public build-time variables to the supplied ZIP URLs, then rebuild:

```dotenv
NEXT_PUBLIC_RED_ALBUM_URL=
NEXT_PUBLIC_RED_BONUS_URL=
```

For local files, place the ZIPs in `public/downloads/` and use `/downloads/<filename>.zip`. Until configured, an unlocked download icon does nothing.

## Code and checks

- `game-model.mjs` owns puzzle progress and inventory rules.
- `final-art.mjs` maps progress to rendered scenes and defines room targets as percentages.
- `room-scene.jsx`, `prop-closeup.jsx`, and `puzzle-views.jsx` place interactions over the supplied renders.
- `room-props.jsx` displays the supplied inventory art. Navigation and painted buttons retain the previous UI artwork because Final contains no replacements.
- `red-game.jsx` handles transitions, audio, input locking, and focus.
- `game-sequence.jsx` handles repair, the escape video, reduced motion, and playback failures.

Run `npm run test:game` for puzzle routes and rendered state mappings. Run `npm run build` for the production build.
