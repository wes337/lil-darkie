// FatCow "Farm-Fresh" icons, served from the CDN. The full list of names is
// the file names (without .png) under /16x16 there.
const FATCOW_URL = "https://w-img.b-cdn.net/misc/icons/fatcow";

// A decorative icon that sits next to a label. The set ships each icon at
// 16px and 32px, and `size` picks which file to load. The image always shows
// at that file's own size and is never scaled. `grey` picks the grey variant.
export default function Icon({
  name,
  size = 16,
  grey = false,
}: {
  name: string;
  size?: 16 | 32;
  grey?: boolean;
}) {
  return (
    <img
      className="icon"
      src={`${FATCOW_URL}/${size}x${size}${grey ? "-grey" : ""}/${name}.png`}
      alt=""
      width={size}
      height={size}
    />
  );
}
