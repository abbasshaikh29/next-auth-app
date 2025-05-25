"use client";

import React from "react";
import { ICommunity } from "@/models/Community";
import { useRouter } from "next/navigation";
import { Users, DollarSign } from "lucide-react";

interface CommunityfeedProps {
  communitys: ICommunity[];
}

function truncateDescription(description: string | undefined): string {
  if (!description) {
    return "";
  }
  const words = description.split(" ");
  if (words.length > 30) {
    return words.slice(0, 30).join(" ") + "...";
  }
  return description;
}

export default function Communityfeed({ communitys }: CommunityfeedProps) {
  const router = useRouter();

  const handleCardClick = (communityslug: string) => {
    router.push(`/Newcompage/${communityslug}/about`);
  };

  // Function to render the appropriate image component
  const renderImage = (community: ICommunity) => {
    // Use CSS background image approach which is more reliable
    return (
      <div
        className="w-full h-full bg-gray-200 rounded-t-xl"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {communitys.map((community) => (
        <div
          key={community._id?.toString()}
          className="rounded-xl shadow-sm border h-[400px] overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer community-card"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-primary)',
            borderColor: 'var(--card-border)'
          }}
          onClick={() => community.slug && handleCardClick(community.slug)}
        >
          {/* Banner */}
          <div className="w-full h-40 bg-gray-200 relative overflow-hidden">
            {renderImage(community)}
          </div>
          
          {/* Community Icon and Name */}
          <div className="p-5 flex flex-col h-[calc(400px-160px)]">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  community.iconImageUrl ||
                  "https://placehold.co/32x32/gray/white?text=Icon"
                }
                alt={`${community.name} icon`}
                className="w-10 h-10 rounded-md object-cover border border-gray-200"
              />
              <h2 className="font-bold text-lg truncate">
                {community.name}
              </h2>
            </div>
            
            <p className="text-sm mb-4 flex-grow line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
              {truncateDescription(community.description)}
            </p>
            
            <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium">{community.members.length.toLocaleString()} Members</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {community.price ? (
                    <>
                      <DollarSign className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm font-medium">${community.price}/month</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-green-600">Free</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
