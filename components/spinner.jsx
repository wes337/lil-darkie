import { CDN_URL } from "@/app/utils";
import "@/styles/spinner.scss";

export default function Spinner() {
  return (
    <div className="spinner">
      <img src={`${CDN_URL}/un.png`} alt="Loading..." />
    </div>
  );
}
