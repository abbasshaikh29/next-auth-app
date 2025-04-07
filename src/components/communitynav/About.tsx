"use client";

import { useState, useEffect } from "react";
import type { ICommunity } from "@/models/Community";
import { IUser } from "@/models/User";
import { useSession } from "next-auth/react";
import CommunityJoinForm from "../CommunityJoinForm";
import CommunityAdminPanel from "../CommunityAdminPanel";

interface AboutProps {
  slug: string;
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
  const { data: session } = useSession();
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
    creator: IUser | null;
  }>({ community: null, creator: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
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
  };

  useEffect(() => {
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

  // Add proper checks for community data
  const community = communityData.community;
  const members = community.members || [];
  const adminQuestions = community.adminQuestions || [];
  const isAdmin = session?.user?.id === community.admin;
  const isMember = members.includes(session?.user?.id || "");

  return (
    <div className="m-10 flex flex-col gap-4 bg-base-300 p-4 rounded-md">
      <h1 className="text-2xl font-bold mb-4">{community.name}</h1>
      <p className="text-gray-600">
        Created by {communityData.creator?.username || "Unknown"}
      </p>
      <div className="text-gray-600 mb-4">{community.description}</div>

      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <CommunityAdminPanel communityId={community._id?.toString() || ""} />
        </div>
      )}

      {!isMember && !isAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Join Community</h2>
          <CommunityJoinForm
            communityId={community._id?.toString() || ""}
            questions={adminQuestions}
            onSuccess={fetchData}
          />
        </div>
      )}

      {isMember && (
        <div className="mt-4">
          <p className="text-green-600">You are a member of this community</p>
        </div>
      )}
    </div>
  );
}

export default About;
