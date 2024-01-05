import Image from "next/image";
import { ASSETS } from "@/app/assets";
import Sampler from "@/components/sampler";
import SamplerFace from "@/components/sampler-face";
import "@/styles/sampler.scss";

export default function SamplerPage() {
  return (
    <>
      <Image
        className="camo"
        src={ASSETS.camo}
        alt=""
        width={1920}
        height={1920}
      />
      <div className="sampler-page">
        <div className="body">
          <Sampler />
          <SamplerFace />
        </div>
        <div className="copyright">
          Copyright © 2024 Lil Darkie® All Rights Reserved
        </div>
      </div>
    </>
  );
}
