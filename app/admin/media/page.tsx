"use client";
import { MediaLibrary } from "@/components/admin/media";

export default function MediaView() {
  return (
    <main className="view">
      <header className="row">
        <h1>Media</h1>
      </header>
      <p>Upload images and files here. Click one to copy its URL.</p>
      <MediaLibrary />
    </main>
  );
}
