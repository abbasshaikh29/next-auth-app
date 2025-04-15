"use client";

import React from "react";
import { ICommunity } from "@/models/Community";
import { useRouter } from "next/navigation";

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

export default function Communityfeed({ communitys }: CommunityfeedProps) {
  const router = useRouter();

  const handleJoinClick = (communityslug: string) => {
    router.push(`/Newcompage/${communityslug}/about`);
    console.log("Joining community with ID:", communityslug);
  };

  // Function to render the appropriate image component
  const renderImage = (community: ICommunity) => {
    // Use CSS background image approach which is more reliable
    return (
      <div
        className="w-full h-full bg-gray-200"
        style={{
          backgroundImage: community?.bannerImageurl
            ? `url(${community.bannerImageurl})`
            : `url(https://placehold.co/600x400/gray/white?text=No+Image)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-label={`${community.name} banner`}
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {communitys.map((community) => (
        <div key={community._id?.toString()}>
          <div className="card bg-base-100 w-96  shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-neutral transition-shadow duration-300">
            <div className="w-full h-52 overflow-hidden relative">
              {renderImage(community)}
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
                  type="button"
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
