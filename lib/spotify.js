import Spotify from "spotify-web-api-node";

const redirectUri = (() => {
  switch (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    case "production":
      return "https://lildarkie.com/api/callback";
    case "preview":
      return "https://lil-darkie-git-sampler-wes337.vercel.app/api/callback";
    default:
      return "http://localhost:3000/api/callback";
  }
})();

const spotifyApi = new Spotify({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri,
});

export default spotifyApi;
