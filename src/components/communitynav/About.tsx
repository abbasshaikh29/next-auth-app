"use client";

import { useState, useEffect } from "react";
import type { ICommunity } from "@/models/Community";
import { IUser } from "@/models/User";

interface AboutProps {
  slug: string;
}

interface ApiUserResponse {
  user: IUser;
}

interface CommunityState {
  community: ICommunity | null;
  creator: IUser | null;
}

async function getCommunity(slug: string): Promise<{
  community: ICommunity | null;
  creatorData: { user: IUser } | null;
}> {
  try {
    const communityResponse = await fetch(`/api/community/${slug}`);
    if (!communityResponse.ok) {
      throw new Error("Failed to fetch community");
    }
    const communityData: ICommunity = await communityResponse.json();

    // Fetch creator separately using createdBy ID from community data
    const creatorResponse = await fetch(`/api/user/${communityData.createdBy}`);
    if (!creatorResponse.ok) {
      throw new Error("Failed to fetch creator");
    }

    const creatorData = await creatorResponse.json();

    return { community: communityData, creatorData };
  } catch (error) {
    console.error("Error fetching community or creator:", error);
    return { community: null, creatorData: null };
  }
}

function About({ slug }: AboutProps) {
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
    creator: IUser | null;
  }>({ community: null, creator: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCommunity(slug);
        console.log("Fetched Data:", data); // Log fetched data
        setCommunityData({
          community: data.community,
          creator: data.creatorData ? data.creatorData.user : null,
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!communityData.community) {
    return <div>Community not found</div>;
  }

  return (
    <div className="m-10 flex flex-col gap-4 bg-base-300 p-4 rounded-md">
      <h1 className="text-2xl font-bold mb-4">
        {communityData.community?.name}
      </h1>
      <p className="text-gray-600">
        Created by {communityData.creator?.username || "Unknown"}
      </p>
      <div>about content: {communityData.community?.description}</div>
    </div>
  );
}

export default About;
