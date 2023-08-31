import Image from "next/image";
import { ASSETS } from "@/app/assets";
import "@/styles/spinner.scss";

export default function Spinner() {
  return (
    <div className="spinner">
      <Image
        src={ASSETS.unIcon}
        alt="Loading..."
        width={400}
        height={373}
        priority
      />
    </div>
  );
}
