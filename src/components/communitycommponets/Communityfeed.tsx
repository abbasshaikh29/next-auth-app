import React from "react";
import { ICommunity } from "@/models/Community";
import { useRouter } from "next/navigation";

import { IKImage } from "imagekitio-next";
interface CommunityfeedProps {
  communitys: ICommunity[];
}

function truncateDescription(description: string | undefined): string {
  if (!description) {
    return "";
  }
  const words = description.split(" ");
  if (words.length > 20) {
    return words.slice(0, 20).join(" ") + "...";
  }
  return description;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
export default function Communityfeed({ communitys }: CommunityfeedProps) {
  const router = useRouter();

  const handleJoinClick = (communityslug: string) => {
    router.push(`/Newcompage/${communityslug}/about`);
    console.log("Joining community with ID:", communityslug);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {communitys.map((community) => (
        <div key={community._id?.toString()}>
          <div className="card bg-base-100 w-96 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-neutral transition-shadow duration-300">
            <div className="w-full h-52 overflow-hidden  relative">
              <IKImage
                urlEndpoint={urlEndpoint}
                className="w-full h-full  "
                path={community?.bannerImageurl!}
                transformation={[
                  {
                    quality: 100,
                    height: 480, // 2x container size for retina displays
                    width: 768, // 2x container width
                    crop: "maintain_ratio",
                    dpr: 2,
                  },
                ]}
                width={384}
                height={240}
                style={{ imageRendering: "crisp-edges" }}
                alt="community banner"
              />
            </div>
            <div className="card-body flex flex-col min-h-[4rem]">
              <h2 className="card-title">{community.name}</h2>

              <div className="flex-grow">
                <p className="h-20 overflow-hidden">
                  {truncateDescription(community.description)}
                </p>
              </div>

              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleJoinClick(community.slug?.toString() || "")
                  }
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
