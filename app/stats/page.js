"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
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
      <Image className="tv" src={ASSETS.tv} alt="" width={1920} height={1080} />
      <div className="stats">
        {loggedIn ? (
          <SpotifyStats refreshToken={refreshToken} accessToken={accessToken} />
        ) : (
          <SpotifyLogin />
        )}
        <div className="footer">
          Copyright © 2024 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
