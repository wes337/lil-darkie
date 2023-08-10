import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import spotifyApi from "@/lib/spotify";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const error = searchParams.get("error");

  if (error) {
    return redirect("/");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = cookies();
  const storedState = cookieStore.get("spotify_auth_state");

  if (!state || !storedState || state !== storedState.value) {
    return redirect("/");
  }

  cookieStore.set("spotify_auth_state", null);

  const data = await spotifyApi.authorizationCodeGrant(code);

  const { access_token, refresh_token } = data.body;

  spotifyApi.setAccessToken(access_token);
  spotifyApi.setRefreshToken(refresh_token);

  return redirect(
    `/stats?access_token=${access_token}&refresh_token=${refresh_token}`
  );
}
