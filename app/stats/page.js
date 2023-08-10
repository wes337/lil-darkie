"use client";
import { useEffect, useState } from "react";
import { CDN_URL } from "@/app/utils";
import SpotifyLogin from "@/components/spotify/login";
import SpotifyStats from "@/components/spotify/stats";
import "@/styles/stats.scss";

export default function Stats() {
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const searchParams = new URL(document.location).searchParams;

    const refreshToken = searchParams.get("refresh_token");
    const accessToken = searchParams.get("access_token");

    setRefreshToken(refreshToken);
    setAccessToken(accessToken);
  }, []);

  const loggedIn = refreshToken && accessToken;

  return (
    <>
      <img className="tv" src={`${CDN_URL}/tv.jpg`} alt="" />
      <div className="stats">
        {loggedIn ? (
          <SpotifyStats refreshToken={refreshToken} accessToken={accessToken} />
        ) : (
          <SpotifyLogin />
        )}
        <div className="footer">
          Copyright © 2023 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
