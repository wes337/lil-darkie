"use client";
import Link from "next/link";
import { MediaLibrary } from "@/components/admin/media";

export default function MediaPage() {
  return (
    <main className="dashboard">
      <header className="row">
        <Link href="/admin">← All content</Link>
        <h1>Media</h1>
      </header>
      <p>Upload images and files here. Click one to copy its URL.</p>
      <MediaLibrary />
    </main>
  );
}
