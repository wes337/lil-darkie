import { Martian_Mono } from "next/font/google";
import Spotify from "@/components/spotify";
import TopBar from "@/components/top-bar";
import Blood from "@/components/blood";
import Nav from "@/components/nav";
import Epilepsy from "@/components/epilepsy";
import Backdrop from "@/components/backdrop";
import Cookies from "@/components/cookies";
import "@/styles/globals.scss";

const martianMono = Martian_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Lil Darkie",
  description: "The Official Lil Darkie Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={martianMono.className}>
        <Epilepsy />
        <Cookies />
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
