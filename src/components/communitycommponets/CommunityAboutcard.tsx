import Link from "next/link";
import React, { useState, useEffect } from "react";
import { IKImage } from "imagekitio-next";
import { ICommunity } from "@/models/Community";

async function getCommunity(slug: string): Promise<{
  community: ICommunity | null;
}> {
  try {
    const communityResponse = await fetch(`/api/community/${slug}`);
    if (!communityResponse.ok) {
      throw new Error("Failed to fetch community");
    }
    const communityData: ICommunity = await communityResponse.json();

    return {
      community: communityData,
    };
  } catch (error) {
    console.error("Error fetching community:", error);
    return { community: null };
  }
}
interface NewCommmunityPageProps {
  slug: string;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
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

function CommunityAboutcard({ slug }: NewCommmunityPageProps) {
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
  }>({ community: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCommunity(slug);
        setCommunityData({
          community: data.community,
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);
  return (
    <div className="card bg-base-100 w-96 shadow-xl overflow-hidden flex flex-col justify-between ">
      <div className="w-full h-52 overflow-hidden  relative">
        <IKImage
          urlEndpoint={urlEndpoint}
          className="w-full h-full  "
          path={communityData.community?.bannerImageurl!}
          transformation={[
            {
              height: 390,
              width: 768, // 2x container width
              crop: "maintain_ratio",
              dpr: 2,
              quality: 100,
            },
          ]}
          width={384}
          height={240}
          style={{ imageRendering: "crisp-edges" }}
          alt="community banner"
        />
      </div>
      <div className="card-body items-center text-center">
        <h1 className="card-title">
          {communityData.community?.name
            ? communityData.community?.name
            : "NewCommmunityPage"}
        </h1>

        <div className="mt-2">
          <p>
            {truncateDescription(
              communityData.community?.description
                ? communityData.community?.description
                : "this is a community"
            )}
          </p>
        </div>

        <div className="card-actions mt-4">
          <button className="btn  btn-secondary">
            <Link href={`/Newcompage/${slug}/communitysetting`}>
              Community Setting
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityAboutcard;
