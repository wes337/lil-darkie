"use client";
import { MediaLibrary } from "@/components/admin/media";

export default function MediaView() {
  return (
    <main className="view">
      <header className="row">
        <h1>Media</h1>
      </header>
      <MediaLibrary />
    </main>
  );
}
