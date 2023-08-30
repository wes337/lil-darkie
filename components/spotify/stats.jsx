"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CDN_URL, formateDateWithYear } from "@/app/utils";
import Spinner from "../spinner";
import "@/styles/spotify-stats.scss";

export default function SpotifyStats({ accessToken, refreshToken }) {
  const router = useRouter();
  const [showDisconnectInstructions, setShowDisconnectInstructions] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [notEnoughData, setNotEnoughData] = useState(false);
  const [data, setData] = useState();

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      return;
    }

    const getMyStats = async () => {
      try {
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
      } catch {
        router.push("/stats");
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
      <div className="header">
        <div className="user">
          <img src={profileImg} alt="" width={32} height={32} />
          <span>{data.profile.displayName}</span>
        </div>
        <button
          className="disconnect"
          onClick={() => setShowDisconnectInstructions(true)}
        >
          Disconnect<span> My Spotify Account</span>
        </button>
        {showDisconnectInstructions && (
          <div className="instructions">
            <div className="inner">
              <button
                className="close"
                onClick={() => setShowDisconnectInstructions(false)}
              >
                <img src={`${CDN_URL}/icons/close.png`} alt="Close" />
              </button>
              <p>To disconnect your Spotify account, go to:</p>
              <p>
                <a href="https://www.spotify.com/account/apps/">
                  https://www.spotify.com/account/apps
                </a>
              </p>
              <p>
                Then click the disconnect button next to the{" "}
                <span>Lil Darkie</span> app.
              </p>
            </div>
          </div>
        )}
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
            <button
              className="first-liked-track"
              onClick={() =>
                window.open(data.firstLike.track.spotifyUrl, "_blank")
              }
            >
              <div className="album-cover">
                {firstLikeImg && (
                  <img className="album-img" src={firstLikeImg} alt="" />
                )}
                <img
                  className="spotify-album"
                  src={`${CDN_URL}/icons/Spotify_Logo_RGB_Green.png`}
                  alt="Listen on Spotify"
                />
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
            </button>
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
                    <img
                      className="spotify-link"
                      src={`${CDN_URL}/icons/Spotify_Icon_RGB_Green.png`}
                      alt="Listen on Spotify"
                    />
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
                    <img
                      className="spotify-link"
                      src={`${CDN_URL}/icons/Spotify_Icon_RGB_Green.png`}
                      alt="Listen on Spotify"
                    />
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
