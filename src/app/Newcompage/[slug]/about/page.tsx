"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ICommunity } from "@/models/Community";
import CommunityAboutcard from "@/components/communitycommponets/CommunityAboutcard";
import About from "@/components/communitynav/About";
import Header from "@/components/Header";
import CommunityNav from "@/components/communitynav/CommunityNav";
async function getCommunity(slug: string): Promise<ICommunity | null> {
  try {
    const response = await fetch(`/api/community/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to fetch community");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching community:", error);
    return null;
  }
}

function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      getCommunity(slug)
        .then((data) => {
          setCommunity(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div>
      <CommunityNav />
      <div className="p-4 flex flex-col justify-center gap-4">
        <div className="prose flex flex-row gap-5 justify-center max-w-none">
          <div className="w-2/4 ">
            <About slug={slug} />
          </div>
          <div>
            <CommunityAboutcard
              slug={slug}
              title={community?.name}
              description={community?.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
