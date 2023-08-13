import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import spotifyApi from "@/lib/spotify";

export async function GET() {
  const state = uuidv4();

  const cookieStore = cookies();
  cookieStore.set("spotify_auth_state", state);

  const scopes = [
    "user-library-read",
    "user-read-email",
    "user-read-private",
    "user-top-read",
  ];

  const redirectUrl = spotifyApi.createAuthorizeURL(scopes, state);
  redirect(redirectUrl);
}
