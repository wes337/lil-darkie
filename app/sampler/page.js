import { CDN_URL } from "../utils";
import Sampler from "@/components/sampler";
import SamplerFace from "@/components/sampler-face";
import "@/styles/sampler.scss";

export default function SamplerPage() {
  return (
    <>
      <img className="camo" src={`${CDN_URL}/camo-small.png`} alt="" />
      <div className="sampler-page">
        <div className="body">
          <Sampler />
          <SamplerFace />
        </div>
      </div>
    </>
  );
}
