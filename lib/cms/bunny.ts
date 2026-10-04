// Uploads live in a Bunny storage zone shared with other projects, so this
// site keeps to its own folder.
const STORAGE_URL = "https://storage.bunnycdn.com/wes-storage";
const CDN_URL = "https://w-img.b-cdn.net";
const FOLDER = "lil-darkie/cms";

export type MediaFile = { name: string; url: string; size: number; uploadedAt: string };

const headers = () => ({ AccessKey: process.env.BUNNY_STORAGE_KEY ?? "" });

// Stores the file under a unique name and returns its public URL.
export async function uploadMedia(file: File): Promise<MediaFile> {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const name = `${Date.now().toString(36)}-${safeName}`;
  const response = await fetch(`${STORAGE_URL}/${FOLDER}/${name}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/octet-stream" },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(`Bunny upload failed (${response.status})`);
  return {
    name,
    url: `${CDN_URL}/${FOLDER}/${name}`,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

type BunnyObject = {
  ObjectName: string;
  Length: number;
  LastChanged: string;
  IsDirectory: boolean;
};

// Everything uploaded so far, newest first.
export async function listMedia(): Promise<MediaFile[]> {
  const response = await fetch(`${STORAGE_URL}/${FOLDER}/`, {
    headers: { ...headers(), Accept: "application/json" },
    cache: "no-store",
  });
  // The folder doesn't exist until the first upload.
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Bunny list failed (${response.status})`);
  const objects = (await response.json()) as BunnyObject[];
  return objects
    .filter((object) => !object.IsDirectory)
    .map((object) => ({
      name: object.ObjectName,
      url: `${CDN_URL}/${FOLDER}/${object.ObjectName}`,
      size: object.Length,
      uploadedAt: object.LastChanged,
    }))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}
