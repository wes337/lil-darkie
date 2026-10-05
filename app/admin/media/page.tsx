"use client";
import { MediaLibrary } from "@/components/admin/media";
import Icon from "@/components/admin/icon";

export default function MediaView() {
  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="pictures" size={32} />
          Media
        </h1>
      </header>
      <MediaLibrary />
    </main>
  );
}
