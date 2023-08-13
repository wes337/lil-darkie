import spotifyApi from "@/lib/spotify";

export async function getMyProfile() {
  const response = await spotifyApi.getMe();

  return response.body;
}

export async function getAllLikedTracks() {
  return new Promise((resolve, reject) => {
    const tracks = [];

    const getLikedTracks = (offset) => {
      spotifyApi
        .getMySavedTracks({ offset, limit: 50 })
        .then((response) => {
          const hasMore = response.body.next !== null;

          tracks.push(...response.body.items);

          if (hasMore) {
            getLikedTracks((offset || 0) + 50);
          } else {
            resolve(tracks);
          }
        })
        .catch((error) => {
          console.log("Error getting liked tracks:", error);
          reject();
        });
    };

    getLikedTracks(0);
  });
}

export async function getAllMyTopTracks(time_range) {
  return new Promise((resolve) => {
    const topTracks = [];

    const getMyTopTracks = (offset) => {
      spotifyApi
        .getMyTopTracks({ offset, limit: 50, time_range })
        .then((response) => {
          const hasMore = response.body.next !== null;

          topTracks.push(...response.body.items);

          if (hasMore) {
            getMyTopTracks((offset || 0) + 50);
          } else {
            resolve(topTracks);
          }
        })
        .catch((error) => {
          console.log("Error getting top tracks:", error);
          reject();
        });
    };

    getMyTopTracks(0);
  });
}

export async function getAllMyTopArtists() {
  return new Promise((resolve) => {
    const topArtists = [];

    const getMyTopArtists = (offset) => {
      spotifyApi
        .getMyTopArtists({ offset, limit: 50, time_range: "long_term" })
        .then((response) => {
          const hasMore = response.body.next !== null;

          topArtists.push(...response.body.items);

          if (hasMore) {
            getMyTopArtists((offset || 0) + 50);
          } else {
            resolve(topArtists);
          }
        })
        .catch((error) => {
          console.log("Error getting top artists:", error);
          reject();
        });
    };

    getMyTopArtists(0);
  });
}

export function parseTrack(rawTrack) {
  return {
    albumName: rawTrack.album.name,
    trackName: rawTrack.name,
    previewUrl: rawTrack.preview_url,
    spotifyUrl: rawTrack.external_urls?.spotify,
    images: rawTrack.album.images,
    single: rawTrack.album?.album_type === "single",
  };
}

export function getMyTopAlbums(tracks) {
  const albumMap = {};

  tracks.forEach((track) => {
    const albumName = track.album.name;
    const isSingle = track.album.album_type === "single";

    if (!isSingle) {
      if (albumMap[albumName]?.count) {
        albumMap[albumName].count += 1;
      } else {
        albumMap[albumName] = {
          ...track.album,
          count: 1,
        };
      }
    }
  });

  return Object.values(albumMap)
    .map((album) => ({
      albumName: album.name,
      images: album.images,
      spotifyUrl: album.external_urls?.spotify,
      count: album.count,
      releaseDate: album.release_date,
    }))
    .sort((a, b) => b.count - a.count);
}
