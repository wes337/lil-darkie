import { NextResponse } from "next/server";
import spotifyApi from "@/lib/spotify";
import {
  getAllLikedTracks,
  getAllMyTopArtists,
  getAllMyTopTracks,
  getMyProfile,
  getMyTopAlbums,
  parseTrack,
} from "./tracks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const LIL_DARKIE_ID = "62F9BiUmjqeXbBztCwiX1U";
    const { searchParams } = new URL(request.url);

    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const allLikedTracks = await getAllLikedTracks();
    const topArtists = await getAllMyTopArtists();

    const topRanking = topArtists.findIndex(({ id }) => id === LIL_DARKIE_ID);

    const lilDarkieLikes = allLikedTracks.filter((item) => {
      return item.track?.artists?.find(({ id }) => id === LIL_DARKIE_ID);
    });

    if (lilDarkieLikes.length > 0) {
      lilDarkieLikes.sort(
        (a, b) =>
          new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
      );
    }

    const totalLikes = lilDarkieLikes.length || 0;
    const firstLike = lilDarkieLikes.length > 0 ? lilDarkieLikes[0] : null;

    const allTopTracks = await getAllMyTopTracks();
    const lilDarkieTopTracks = allTopTracks.filter((track) =>
      track.artists.find(({ id }) => id === LIL_DARKIE_ID)
    );
    const topTracks = [
      ...lilDarkieTopTracks,
      ...lilDarkieLikes.map(({ track }) => track),
    ].filter(Boolean);

    const topAlbums = topTracks.length > 0 ? getMyTopAlbums(topTracks) : [];

    const profile = await getMyProfile();

    const lilDarkieData = {
      profile: {
        displayName: profile.display_name,
        images: profile.images,
      },
      topRanking,
      totalLikes,
      firstLike: firstLike
        ? {
            date: firstLike.added_at,
            track: parseTrack(firstLike.track),
          }
        : null,
      topTracks:
        topTracks && topTracks.length > 0
          ? topTracks.slice(0, 10).map(parseTrack)
          : [],
      topAlbums: topAlbums && topAlbums.length > 0 ? topAlbums.slice(0, 3) : [],
    };

    return NextResponse.json(lilDarkieData);
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
