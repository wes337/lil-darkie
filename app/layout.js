/* eslint-disable @next/next/no-page-custom-font */
import { Martian_Mono } from "next/font/google";
import Spotify from "@/components/spotify";
import TopBar from "@/components/top-bar";
import Blood from "@/components/blood";
import Nav from "@/components/nav";
import Epilepsy from "@/components/epilepsy";
import Backdrop from "@/components/backdrop";
// import Cookies from "@/components/cookies";
import GoogleAnalytics from "@/components/google-analytics";
import "@/styles/globals.scss";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Lil Darkie",
  description: "The Official Lil Darkie Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={martianMono.className}>
        <Epilepsy />
        {/* <Cookies /> */}
        <Spotify />
        <TopBar />
        {children}
        <Blood />
        <Nav />
        <Backdrop />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
