import test from 'node:test';
import assert from 'node:assert/strict';
import { interact, inventory, newProgress, talk, unlockSafe } from './game-model.mjs';

function play() {
  let state = newProgress();
  const apply = (result) => {
    state = result.progress;
    assert.equal(new Set(inventory(state)).size, inventory(state).length);
    return result;
  };
  return {
    get state() { return state; },
    get items() { return inventory(state); },
    act: (target, item) => apply(interact(state, target, item)),
    talk: (topic) => apply(talk(state, topic)),
    code: (code) => apply(unlockSafe(state, code)),
  };
}

test('complete authored route unlocks both rewards and the optional ending', () => {
  const g = play();
  assert.equal(g.act('mouse-hole').conversation, true);
  for (const topic of ['where', 'escape', 'who']) g.talk(topic);
  g.talk('help');
  assert.deepEqual(g.items, ['imaginary-friend']);
  g.act('bear-ripped', 'imaginary-friend');
  g.act('door-frame');
  g.act('thread-spool', 'needle');
  assert.equal(g.act('bear-ripped', 'needle-and-thread').sequence, 'repair');
  assert.deepEqual(g.items, ['bambi']);
  // Bambi goes back automatically; no need to select him.
  g.act('mouse-hole');
  assert.deepEqual(g.items, ['glass-empty']);
  g.act('sink', 'glass-empty');
  g.act('flower-wilted', 'glass-half-full');
  assert.equal(g.act('computer-tower', 'usb-stick').sound, 'usb-in');
  assert.equal(g.state.usbInserted, true);
  g.code('100698');
  const openSafe = g.act('safe-handle');
  assert.equal(openSafe.view, 'safe-interior');
  assert.equal(openSafe.sound, 'safe-open');
  g.act('key');
  g.act('cd');
  assert.equal(g.act('computer-tower', 'cd').sound, 'cd-in');
  assert.equal(g.state.cdInserted, true);
  assert.equal(g.state.endingSeen, false);
  assert.equal(g.act('doorknob', 'key').sequence, 'ending');
  assert.equal(g.state.endingSeen, true);
  assert.deepEqual(g.items, ['key']);
});

test('fixed code bypasses the main chain, but early CD still requires USB', () => {
  const g = play();
  assert.equal(g.act('doorknob').sound, 'door-locked');
  const lockedSafe = g.act('safe-handle');
  assert.match(lockedSafe.message[0], /locked/);
  assert.equal(lockedSafe.sound, 'safe-open');
  assert.equal(lockedSafe.view, undefined);
  g.act('key');
  assert.deepEqual(g.items, []);
  assert.equal(g.code('10069').progress.safeUnlocked, false);
  assert.equal(g.code('000000').progress.safeUnlocked, false);
  g.code('100698');
  g.act('cd');
  const before = g.state;
  assert.deepEqual(g.act('computer-tower', 'cd').message, ['nothing happens']);
  assert.equal(g.state, before);
  assert.deepEqual(g.items, ['cd']);
  g.act('key');
  const exit = g.act('doorknob', 'key');
  assert.equal(exit.sequence, 'ending');
  assert.equal(exit.sound, undefined);
  assert.equal(g.state.usbInserted, false);
  assert.equal(g.state.friend, 'waiting');
  assert.deepEqual(g.items, ['key', 'cd']);
});

test('early sewing, interrupted conversations and repeated pickups cannot duplicate rewards', () => {
  const g = play();
  assert.equal(g.act('door-frame').sound, 'item-mystery');
  assert.equal(g.act('door-frame').sound, 'detection-click-2');
  assert.deepEqual(g.items, ['needle']);
  g.act('thread-spool', 'needle');
  assert.deepEqual(g.act('bear-ripped', 'needle-and-thread').message, ['nothing happens']);
  assert.deepEqual(g.items, ['needle-and-thread']);
  g.talk('where'); g.talk('where'); g.talk('help');
  assert.equal(g.state.friend, 'waiting');
  g.talk('escape'); g.talk('who'); g.talk('help'); g.talk('help');
  g.act('bear-ripped', 'imaginary-friend');
  g.act('bear-ripped', 'imaginary-friend');
  g.act('bear-ripped', 'needle-and-thread');
  g.act('bear-ripped', 'needle-and-thread');
  assert.deepEqual(g.items, ['bambi']);
  g.act('mouse-hole', 'bambi');
  g.act('mouse-hole', 'bambi');
  assert.deepEqual(g.items, ['glass-empty']);
  g.code('100698'); g.act('key'); g.act('key'); g.act('cd'); g.act('cd');
  assert.deepEqual(g.items, ['glass-empty', 'key', 'cd']);
});

test('every incorrect target preserves owned items and rejects unowned items', () => {
  const g = play();
  const untouched = g.state;
  for (const item of ['usb-stick', 'key', 'needle', 'bambi']) {
    assert.deepEqual(g.act('doorknob', item).message, ['nothing happens']);
    assert.equal(g.state, untouched);
  }
  g.act('door-frame');
  const withNeedle = g.state;
  for (const target of ['sink', 'flower-wilted', 'computer-tower', 'mouse-hole', 'giant', 'locked-screen', 'doorknob']) {
    const result = g.act(target, 'needle');
    assert.deepEqual(result.message, ['nothing happens']);
    assert.equal(result.sound, 'click-no');
    assert.equal(g.state, withNeedle);
    assert.deepEqual(g.items, ['needle']);
  }
});
