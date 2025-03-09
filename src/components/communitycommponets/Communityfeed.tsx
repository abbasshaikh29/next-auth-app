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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {communitys.map((community) => (
        <div key={community._id?.toString()}>
          <div className="card bg-base-100 w-96 shadow-xl h-96 overflow-hidden">
            <figure>
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Shoes"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{community.name}</h2>
              <p>{truncateDescription(community.description)}</p>
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
