# Red Game

The game uses the approved layered room artwork, the Miro CSV dialogue, and the asset handoff in `E:/Development/lil-darkie/red-game`. It runs entirely in the browser. The surrounding website is JavaScript/JSX.

## Playing

Click or tap objects to explore. Select an inventory item, then its target. Clicking the selected item again puts it away. Escape closes the top text box, deselects an item, or returns from a close-up, in that order. Close-ups and room turns fade through black. There are no hints or quest markers.

The landing page shows the logo, mobile menu button, and copyright footer. Starting the game slides the logo up, the menu button right, and the footer down over 650ms. These elements become inaccessible as play starts; reduced motion hides them immediately.

During play, clicks on non-interactive room or close-up areas play `detection-click-1.mp3`. Room, back, and sky arrows play `move-2.mp3`. The two sounds are preloaded from `public/red-game/sounds` and restart on repeated clicks. Props, inventory, text boxes, and inputs do not trigger the empty-area sound. Transitions and sequences ignore clicks; playback failures do not interrupt the game. The remaining supplied sounds are not wired up yet.

Trying the locked doorknob in the doorway view plays `door-locked.mp3` alongside its text response. Clicking beneath the door plays `door-bottom.mp3` with the breeze response, and entering the peephole view plays `door-hole.mp3`. Using inventory items does not trigger these inspection sounds.

Closing any message or conversation with the X or Escape plays `click-close.mp3`. The sound stays mounted outside the dialog so it finishes after the text box disappears.

The shipped `click-close.mp3` and `detection-click-1.mp3` are reduced by 6 dB in the audio files themselves. Original recordings remain in `E:/Development/lil-darkie/red-game/sounds`.

Finding the sewing needle plays `item-mystery.mp3`. Searching the doorframe again does not replay the discovery sound.

Inspecting the thread spool plays `plant-1.mp3`. Collecting it with the needle plays `item-mystery.mp3` instead, matching the needle discovery.

Opening the desk note plays `note.mp3`, reduced by 6 dB in the shipped file. The original recording remains in the source sounds folder.

Inspecting the standing figure plays `you.mp3` with "it's you". The shipped `you.mp3` has the sampler's `yuh` (CDN `sounds/yuh.wav`, reduced by 12 dB) mixed into it. Inspecting the giant over the wall plays `peaking-guy.mp3`. Clicking the hole in the wall plays `item-mystery-2.mp3`, except the "i have to find his body, and bring him back here" response plays `item-mystery-5.mp3`.

Selecting a regular question in the hole conversation plays `answer-2.mp3`. "Can you help me?" plays `item-mystery.mp3`, the same sound as finding the sewing needle. A new answer stops the previous answer sound to avoid overlap.

Inspecting the plant plays `plant-2.mp3`, whether wilted or blooming. Inspecting the stool plays `detection-click-2.mp3`; empty-area clicks still use `detection-click-1.mp3`.

Turning the safe handle plays `safe-open.mp3` both when locked and when opening the safe interior. The safe body remains non-interactive.

Every safe keypad button, including delete and enter, plays `keypad-button.mp3` when activated.

The standing lamp plays `lamp-on.mp3` when switched on and `lamp-off.mp3` when switched off. Clicking the desk lamp plays `zap-1.mp3` alongside its shock response.

Hovering an interactive painted prop, the desk, or a main-room character instantly enlarges its artwork by 1% and picks a fresh tilt between -0.5 and 0.5 degrees. Clickable areas stay fixed, and the desk items keep their painted perspective. Arrow and close buttons retain their original 8% growth, 5-degree tilt, and stronger shadows.

Room objects and close-up hotspots have no yellow hover or touch outlines. Subtle growth, tilt, and dark hover shadows remain. Keyboard focus indicators and inventory outlines are retained.

Ordinary props respond in the current room or desk view. This includes the sink, mirror, wall light, bear, flower, stool, sewing thread, and mouse-hole conversation. The standing lamp toggles without a text box; the desk lamp and tower show their existing responses. Select the USB or CD in inventory and click the tower in the desk view to insert it. The safe body is decorative. Its handle shows the locked response until the code is entered, then opens the interior view directly. Separate views are reserved for the desk, safe keypad and interior, computer screen and document, note, doorway, and peephole.

The board specifies no game menu or saving, so neither is included. Progress stays in memory for the current game. Refreshing starts fresh; previously saved browser data is ignored.

## Puzzle rules

- Exhaust the three hole conversation topics, request help, and put Imaginary Friend into the bear.
- Find Needle above the doorframe and use it on the desk thread. This can happen before speaking to Bambi.
- Use Needle and Thread on the inhabited bear. The repair sequence awards Bambi and returns to the sink wall with the bear removed.
- Return Bambi to the hole for Empty Glass. Fill it at the sink, water the flower, and insert its USB reward into the tower.
- USB unlocks `psswrd` and `prjct`. The password document contains the authored riddle.
- Safe code `100698` always works, including before any other puzzle. The handle then opens the safe. Key and CD are independent pickups.
- CD insertion requires USB and unlocks `xtra`.
- Key on the door knob plays the optional escape sequence. It is not required for either download. Its END button returns to the Play the Game screen with a fresh game.

Invalid item use says “nothing happens,” preserves the item, and deselects it. USB and CD leave the inventory when inserted. Needle, thread, safe pickups, Bambi, and the flower reward cannot be collected twice. Duplicate clicks are harmless. The question for the currently displayed answer is hidden; it becomes available again when another answer is shown. Visited topics still count toward unlocking the help request.

## Release content still needed

Set these public build-time environment variables to the real ZIP URLs, then restart the development server or rebuild:

```dotenv
NEXT_PUBLIC_RED_ALBUM_URL=
NEXT_PUBLIC_RED_BONUS_URL=
```

For local files, place the supplied ZIPs in `public/downloads/` and use `/downloads/<filename>.zip`. External hosts should send `Content-Disposition: attachment`. Files are ordinary links, not loaded into JavaScript memory. Until a URL is supplied, clicking its unlocked icon does nothing, with no message or navigation. Icons remain available for retries.

The escape sequence uses layered paintings and CSS for the key insertion, door opening, field reveal, sky pan, and the three specified title cards. The field and sky turn red as the final RED title appears. It reuses the simple painted inventory key with no hand. The generated field and the unused hand study are recorded in `E:/Development/lil-darkie/red-game/Experimental/Outdoors/README.md`. This can be replaced with Knopes's final rendered sequence when delivered. Reduced motion keeps the story cards and removes movement. In development only, Skip animation and Escape advance to RED; production builds include neither skip control.

Short descriptions for the repaired/inhabited world, mirror, stool, light, and searched doorframe were written for undefined states. All authored dialogue, clues, and puzzle feedback retain the board's wording. Wrong code attempts clear the input and allow unlimited retries. Unlocking does not open the safe automatically.

## Code and checks

- `game-model.mjs` owns puzzle progress, item ownership, and prerequisites. Inventory is derived from world state rather than stored twice.
- `game-content.mjs` holds authored dialogue, clues, and item names.
- `use-game.js` owns a per-instance Zustand store for the current game.
- `red-game.jsx` handles scene transitions, input locking, selection, and focus. `game-dialog.jsx`, `inventory.jsx`, `puzzle-views.jsx`, and `game-sequence.jsx` render the game UI.
- `room-props.jsx` switches artwork and removes collected objects; screens remain black in room/desk compositions.

Run `npm run test:game` for the complete route, shortcut, ordering failures, and duplicate rewards. Run `npm run build` for the production build.
