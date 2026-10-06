import { z } from "zod";
import { ITEMS, TOPICS } from "../components/red-game/game-content.ts";
import {
  replay,
  type ItemId,
  type Move,
  type TopicId,
} from "../components/red-game/game-model.ts";
import { DEFAULT_NAMESPACE, redis } from "./cms/store.ts";
import { readSession, sessionSecret, SESSION_LIFETIME_SECONDS } from "./red-game-session.ts";

// Checks that a download request comes from a solved game. The game sends
// its session and the moves the player made. The server replays the moves
// through the game's own rules and looks at where they end up.
//
// This proves a valid solution was sent, not that someone played: the rules
// ship with the game, so a solution can be written out by hand. The session
// makes that slow (a minimum time per game) and bounded (a cap per game).

// Below the fastest honest run. A scripted browser that clicks the instant
// each button is ready, on the shortest route, reaches the album in 33
// seconds; at 300 ms a click it takes 46. With reduced motion the game has
// no transitions, so a quick replay can beat this and has to try again.
const MIN_SOLVE_SECONDS = 35;
const DOWNLOADS_PER_FILE = 5;
// Far more than a game needs. Only moves that change something are sent.
const MAX_MOVES = 200;

// Why a download was refused. The game turns each into a line of its own.
export type Refusal = "refused" | "expired" | "too-soon" | "limit";

const moveSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("interact"),
    target: z.string().max(64),
    item: z.enum(Object.keys(ITEMS) as [ItemId]).nullable(),
  }),
  z.strictObject({
    type: z.literal("talk"),
    topic: z.enum([...Object.keys(TOPICS), "help"] as [TopicId | "help"]),
  }),
  z.strictObject({ type: z.literal("code"), code: z.string().max(16) }),
]) satisfies z.ZodType<Move>;

const proofSchema = z.strictObject({
  session: z.string().max(200),
  moves: z.array(moveSchema).max(MAX_MOVES),
});

// A sorted set per session: each member is a file, its score the number of
// links signed for it. It expires with the session. ENDED is a member too,
// added when the player exits; after that the session gets no more links.
const countsKey = (sessionId: string) => `${DEFAULT_NAMESPACE}:red-game:session:${sessionId}`;
const ENDED = ":ended";

// Marks a session as over. The token would otherwise stay good until it
// expires, since nothing else is stored for it.
export async function endSession(token: string, now = Date.now()): Promise<void> {
  const session = readSession(token, sessionSecret(), now);
  if (!session) return;
  await (await redis())
    .multi()
    .zAdd(countsKey(session.id), { score: 1, value: ENDED })
    .expire(countsKey(session.id), SESSION_LIFETIME_SECONDS)
    .exec();
}

// Makes the check for one file. `needs` is the progress flag the replay must
// end with. The check resolves to why it refused, or null to allow.
export function solvedGame(needs: "usbInserted" | "cdInserted") {
  return async (proof: unknown, file: string, now = Date.now()): Promise<Refusal | null> => {
    const parsed = proofSchema.safeParse(proof);
    if (!parsed.success) return "refused";
    const session = readSession(parsed.data.session, sessionSecret(), now);
    if (!session) return "expired";
    if (!replay(parsed.data.moves)[needs]) return "refused";

    if (Math.floor(now / 1000) - session.startedAt < MIN_SOLVE_SECONDS) return "too-soon";

    const [ended, count] = await (await redis())
      .multi()
      .zScore(countsKey(session.id), ENDED)
      .zIncrBy(countsKey(session.id), 1, file)
      .expire(countsKey(session.id), SESSION_LIFETIME_SECONDS)
      .exec();
    if (ended !== null) return "expired";
    return Number(count) > DOWNLOADS_PER_FILE ? "limit" : null;
  };
}
