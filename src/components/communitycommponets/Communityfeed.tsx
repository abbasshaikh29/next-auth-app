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
          <div className="card bg-base-100 w-96 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-primary">
            <figure>
              <img
                src="https://th.bing.com/th/id/OIP.3a0bROm1LmDrK6SqeFsswwHaEo?rs=1&pid=ImgDetMain"
                alt="community banner"
                className="w-full h-40 object-cover"
              />
            </figure>
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
