"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ICommunity } from "@/models/Community";
import { useSession } from "next-auth/react";
import CommunityJoinForm from "../CommunityJoinForm";

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

function CommunityAboutcard({ slug }: NewCommmunityPageProps) {
  const { data: session } = useSession();
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
  }>({ community: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCommunity(slug);
        setCommunityData({
          community: data.community,
        });
        setIsMember(
          data.community?.members?.includes(session?.user?.id!) || false
        );
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, session?.user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!communityData.community) {
    return <div>Community not found</div>;
  }

  const truncateDescription = (description: string | undefined) => {
    if (!description) return "";
    return description.length > 100
      ? description.substring(0, 100) + "..."
      : description;
  };

  const handleJoinSuccess = () => {
    setShowJoinForm(false);
    setIsMember(true);
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col justify-between w-full max-w-sm mx-auto">
        <div className="w-full h-52 overflow-hidden relative">
          {communityData.community?.bannerImageurl ? (
            <div
              className="w-full h-full bg-gray-200"
              style={{
                backgroundImage: `url(${communityData.community.bannerImageurl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              aria-label={`${
                communityData.community.name || "Community"
              } banner`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No banner image</span>
            </div>
          )}
        </div>
        <div className="card-body">
          <h1 className="card-title">
            {communityData.community?.name || "NewCommmunityPage"}
          </h1>

          <div className="mt-2">
            <p>
              {truncateDescription(
                communityData.community?.description || "this is a community"
              )}
            </p>
          </div>

          {isMember ? (
            <div className="card-actions mt-4">
              <button type="button" className="btn btn-secondary">
                <Link href={`/Newcompage/${slug}/communitysetting`}>
                  Community Setting
                </Link>
              </button>
            </div>
          ) : (
            <div className="card-actions mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowJoinForm(true)}
              >
                Join Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Join Form Modal */}
      {showJoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Join Community</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowJoinForm(false)}
              >
                ✕
              </button>
            </div>
            <CommunityJoinForm
              communityId={communityData.community?._id?.toString() || ""}
              questions={communityData.community?.adminQuestions || []}
              onSuccess={handleJoinSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CommunityAboutcard;
