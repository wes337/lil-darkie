"use client";
import Image from "next/image";
import { ASSETS } from "@/app/assets";
import useStore from "@/app/store";
import "@/styles/blood.scss";

export default function Blood() {
  const { bloodTransition, setBloodTransition } = useStore();

  return (
    <div
      className={`blood${bloodTransition ? " show" : ""}`}
      onAnimationEnd={() => setBloodTransition(false)}
    >
      <div className="blood-top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#e00910"
            fillOpacity="1"
            d="M0,256L40,224C80,192,160,128,240,90.7C320,53,400,43,480,53.3C560,64,640,96,720,144C800,192,880,256,960,266.7C1040,277,1120,235,1200,202.7C1280,171,1360,149,1400,138.7L1440,128L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          />
        </svg>
        <div className="blood-face">
          <Image src={ASSETS.broken} alt="" width={768} height={843} priority />
        </div>
      </div>
      <div className="blood-middle" />
      <div className="blood-bottom">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#e00910"
            fillOpacity="1"
            d="M0,32L21.8,42.7C43.6,53,87,75,131,74.7C174.5,75,218,53,262,69.3C305.5,85,349,139,393,165.3C436.4,192,480,192,524,208C567.3,224,611,256,655,234.7C698.2,213,742,139,785,122.7C829.1,107,873,149,916,144C960,139,1004,85,1047,69.3C1090.9,53,1135,75,1178,117.3C1221.8,160,1265,224,1309,245.3C1352.7,267,1396,245,1418,234.7L1440,224L1440,320L1418.2,320C1396.4,320,1353,320,1309,320C1265.5,320,1222,320,1178,320C1134.5,320,1091,320,1047,320C1003.6,320,960,320,916,320C872.7,320,829,320,785,320C741.8,320,698,320,655,320C610.9,320,567,320,524,320C480,320,436,320,393,320C349.1,320,305,320,262,320C218.2,320,175,320,131,320C87.3,320,44,320,22,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
}
