/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lil-darkie.b-cdn.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "w-img.b-cdn.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.ipfs.w3s.link",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ipfs.filebase.io",
        port: "",
        pathname: "/ipfs/Qmad8Gmdbr7LJ5gDyEcJ3zkATdhvewQg4EzdTcETr2pMZh/**",
      },
    ],
  },
};

module.exports = nextConfig;
