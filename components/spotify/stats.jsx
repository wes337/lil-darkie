"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formateDateWithYear } from "@/app/utils";
import Spinner from "../spinner";
import "@/styles/spotify-stats.scss";

export default function SpotifyStats({ accessToken, refreshToken }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notEnoughData, setNotEnoughData] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    const getMyStats = async () => {
      setLoading(true);
      const response = await fetch(
        `/api/stats?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
      const data = await response.json();

      if (data.error) {
        router.push("/stats");
      } else {
        setData(data);
        setLoading(false);
      }
    };

    getMyStats();
  }, [accessToken, refreshToken, router]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const noTopRanking = data.topRanking <= 0;
    const noLikes = data.totalLikes === 0;
    const noFirstLike = !data.firstLike;
    const noTopTracks = data.topTracks.length === 0;
    const noTopAlbums = data.topAlbums.length === 0;

    setNotEnoughData(
      noTopRanking && noLikes && noFirstLike && noTopTracks && noTopAlbums
    );
  }, [data]);

  if (loading || !data) {
    return (
      <div className="spotify-stats">
        <div className="loading">
          <Spinner />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (notEnoughData) {
    return (
      <div className="spotify-stats">
        <div className="empty">
          <p>You don&apos;t have enough Lil Darkie listening data...</p>
          <a
            href="https://open.spotify.com/artist/62F9BiUmjqeXbBztCwiX1U"
            target="_blank"
          >
            <span>Go listen to some</span>
            <span>more Lil Darkie!</span>
          </a>
        </div>
      </div>
    );
  }

  const firstLikeImg = data?.firstLike?.track?.images?.[0]?.url || null;
  const profileImg = data.profile?.images?.[0]?.url || null;

  return (
    <div className="spotify-stats">
      <div className="user">
        <img src={profileImg} alt="" width={32} height={32} />
        <span>{data.profile.displayName}</span>
      </div>
      {(data.topRanking > 0 || data.totalLikes > 0) && (
        <div className="heading">
          {data.topRanking > 0 && (
            <p>
              Lil Darkie is your <span>#{data.topRanking}</span> artist!
            </p>
          )}
          {data.totalLikes > 0 && (
            <p>
              In total, you&apos;ve liked <span>{data.totalLikes}</span> Lil
              Darkie songs.
            </p>
          )}
        </div>
      )}
      {data.firstLike && (
        <div className="first-like">
          <h2>Your First Like</h2>
          <div className="body">
            <div className="first-liked-track">
              <div className="album-cover">
                {firstLikeImg && <img src={firstLikeImg} alt="" />}
              </div>
              <div className="track-info">
                <div className="name">{data.firstLike.track.trackName}</div>
                <div className="album">
                  {data.firstLike.track.single
                    ? "SINGLE"
                    : data.firstLike.track.albumName}
                </div>
                <div className="date">
                  Liked on{" "}
                  <span>{formateDateWithYear(data.firstLike.date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {(data.topAlbums.length > 0 || data.topTracks > 0) && (
        <div className="top-lists">
          {data.topTracks.length > 0 && (
            <div className="top-ten-tracks">
              <h2>Your Top 10 Tracks</h2>
              {data.topTracks.map((track, i) => {
                const image =
                  track.images?.[1]?.url || track.images?.[0]?.url || null;

                return (
                  <a
                    key={`${track.trackName}-${i}`}
                    className="top-track"
                    href={track.spotifyUrl}
                    target="_blank"
                  >
                    <div className="position">#{i + 1}</div>
                    <div className="album">
                      {image && <img src={image} alt="" />}
                    </div>
                    <div className="name">
                      <div>{track.trackName}</div>
                      <div>{track.single ? "SINGLE" : track.albumName}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
          {data.topAlbums.length > 0 && (
            <div className="top-three-albums">
              <h2>Your Top 3 Albums</h2>
              {data.topAlbums.map((album, i) => {
                const image =
                  album.images?.[1]?.url || album.images?.[0]?.url || null;

                return (
                  <a
                    key={`${album.albumName}-${i}`}
                    className="top-album"
                    href={album.spotifyUrl}
                    target="_blank"
                  >
                    <div className="position">#{i + 1}</div>
                    <div className="album">
                      {image && <img src={image} alt="" />}
                    </div>
                    <div className="name">
                      <div>{album.albumName}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
