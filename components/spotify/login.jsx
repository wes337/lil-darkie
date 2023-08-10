"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/spotify-login.scss";

export default function SpotifyLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const searchParams = new URL(document.location).searchParams;

    const refreshToken = searchParams.get("refresh_token");
    const accessToken = searchParams.get("access_token");

    setLoaded(refreshToken && accessToken);
  }, []);

  if (loaded) {
    return null;
  }

  const onClick = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    router.push("/api/login");
  };

  return (
    <div className="spotify-login">
      <div className="login">
        <p>Sign in with Spotify to see your Lil Darkie listening stats</p>
        <button onClick={onClick} disabled={loading}>
          {loading ? (
            "Loading..."
          ) : (
            <>
              <span>Show My</span>
              <span>Lil Darkie Stats!</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
