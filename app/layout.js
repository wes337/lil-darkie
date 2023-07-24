"use client";
import { useEffect } from "react";
import { Martian_Mono } from "next/font/google";
import Spotify from "@/components/spotify";
import TopBar from "@/components/top-bar";
import Blood from "@/components/blood";
import Nav from "@/components/nav";
import Backdrop from "@/components/backdrop";
import useStore from "./store";
import "@/styles/globals.scss";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Lil Darkie",
  description: "The Official Lil Darkie Website",
};

export default function RootLayout({ children }) {
  const { setSticky, setScroll } = useStore();

  useEffect(() => {
    const onScroll = () => {
      const scrollY = Math.floor(window.scrollY);
      setScroll(scrollY);
      setSticky(scrollY >= 32);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scoll", onScroll);
  }, [setScroll, setSticky]);

  return (
    <html lang="en">
      <body className={martianMono.className}>
        <Spotify />
        <TopBar />
        {children}
        <Blood />
        <Nav />
        <Backdrop />
      </body>
    </html>
  );
}
