"use client";

import { useState, useEffect } from "react";
import type { ICommunity } from "@/models/Community";
import { IUser } from "@/models/User";
import { useSession } from "next-auth/react";
import CommunityJoinForm from "../CommunityJoinForm";
import Link from "next/link";

interface AboutProps {
  slug: string;
}

async function getCommunity(slug: string): Promise<{
  community: ICommunity | null;
  adminData: { user: IUser } | null;
}> {
  try {
    // Fetch community data
    const communityResponse = await fetch(`/api/community/${slug}`);
    if (!communityResponse.ok) {
      throw new Error("Failed to fetch community");
    }
    const communityData: ICommunity = await communityResponse.json();

    // Fetch admin data using the admin ID from community data
    if (communityData.admin) {
      try {
        const adminResponse = await fetch(`/api/user/${communityData.admin}`);
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          return { community: communityData, adminData };
        }
      } catch (adminError) {
        console.error("Error fetching admin:", adminError);
        // Continue with community data even if admin fetch fails
      }
    }

    return { community: communityData, adminData: null };
  } catch (error) {
    console.error("Error fetching community:", error);
    return { community: null, adminData: null };
  }
}

function About({ slug }: AboutProps) {
  const { data: session } = useSession();
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
    admin: IUser | null;
  }>({ community: null, admin: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const data = await getCommunity(slug);
      console.log("Fetched Data:", data); // Log fetched data
      setCommunityData({
        community: data.community,
        admin: data.adminData ? data.adminData.user : null,
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
        Created by{" "}
        {communityData.admin?.username ||
          communityData.community.createdBy ||
          "Unknown"}
      </p>
      <div className="text-gray-600 mb-4">{community.description}</div>

      {isAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Admin Options</h2>
          <Link
            href={`/Newcompage/${slug}/communitysetting?t=AdminPanel`}
            className="btn btn-primary"
          >
            Go to Admin Panel
          </Link>
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
