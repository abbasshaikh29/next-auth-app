"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ICommunity } from "@/models/Community";
import { useSession } from "next-auth/react";
import { useSettingsModal } from "@/components/modals/SettingsModalProvider";
import CommunityJoinForm from "../CommunityJoinForm";
import { Users, Link as LinkIcon, Copy, Check } from "lucide-react";

async function getCommunity(slug: string): Promise<{
  community: ICommunity | null;
  error?: string;
}> {
  try {
    // First try to fetch with the normal endpoint
    const communityResponse = await fetch(`/api/community/${slug}`);

    if (communityResponse.ok) {
      const communityData: ICommunity = await communityResponse.json();
      return { community: communityData };
    }

    // If that fails, try the debug endpoint to get more information
    const debugResponse = await fetch(
      `/api/community/check?slug=${encodeURIComponent(slug)}`
    );
    const debugData = await debugResponse.json();

    if (debugData.communityFound && debugData.communityData) {
      // Community exists but there was an error fetching it
      return {
        community: null,
        error: `Community exists but couldn't be fetched properly. Database status: ${JSON.stringify(
          debugData.dbStatus
        )}`,
      };
    } else if (debugData.totalCommunities > 0) {
      // Other communities exist but not this one
      return {
        community: null,
        error: `Community with slug "${slug}" not found. ${debugData.totalCommunities} other communities exist.`,
      };
    } else {
      // No communities exist at all
      return {
        community: null,
        error:
          "No communities found in the database. Database may be empty or not properly connected.",
      };
    }
  } catch (error) {
    return {
      community: null,
      error: `Error fetching community: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

interface NewCommmunityPageProps {
  slug: string;
}

function CommunityAboutcard({ slug }: NewCommmunityPageProps) {
  const { data: session } = useSession();
  const { openCommunitySettings } = useSettingsModal();
  const [communityData, setCommunityData] = useState<{
    community: ICommunity | null;
  }>({ community: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const data = await getCommunity(slug);

        if (data.community) {
          setCommunityData({
            community: data.community,
          });
          setIsMember(
            data.community?.members?.includes(session?.user?.id!) || false
          );
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("Community not found");
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();

      // Add a refresh interval to keep the data updated
      const refreshInterval = setInterval(() => {
        if (slug) {
          fetchData();
        }
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(refreshInterval);
    } else {
      setError("Invalid community slug");
      setLoading(false);
    }
  }, [slug, session?.user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Error</h2>
          <p>{error}</p>
          <div className="card-actions justify-end mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
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

  const getInviteLink = () => {
    // Create the invite link to the about page
    const baseUrl = window.location.origin;
    return `${baseUrl}/Newcompage/${slug}/about`;
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = getInviteLink();
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl overflow-hidden flex flex-col justify-between w-full mx-auto">
        <div className="w-full h-48 overflow-hidden relative">
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

          {/* Display member and admin counts */}
          <div className="flex items-center gap-3 mt-2">
            <div className="badge badge-primary  py-3  text-sm rounded-md">
              <div className="mr-2">
                <Users size={16} />
              </div>

              <span>
                {communityData.community?.members?.length || 0} members
              </span>
            </div>
            <div className="badge badge-primary gap-2 py-3 px-4 text-sm rounded-md">
              <span>
                {communityData.community?.admin ? 1 : 0}
                {communityData.community?.subAdmins?.length
                  ? ` + ${communityData.community.subAdmins.length}`
                  : ""}{" "}
                admin
                {(communityData.community?.subAdmins?.length || 0) > 0
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
          {isMember ? (
            <div className="card-actions mt-4 flex-col w-full gap-2">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => openCommunitySettings(slug)}
              >
                Community Settings
              </button>
              <button
                type="button"
                className="btn btn-primary w-full flex items-center gap-2"
                onClick={() => setShowInviteModal(true)}
              >
                <LinkIcon size={16} />
                Invite Members
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
              communitySlug={slug}
              communityName={communityData.community?.name || ""}
              questions={communityData.community?.adminQuestions || []}
              onSuccess={handleJoinSuccess}
            />
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Invite Members</h2>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm mb-2">
                Share this link with people you want to invite to this
                community:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="input-group w-full">
                  <input
                    type="text"
                    value={getInviteLink()}
                    readOnly
                    className="input input-bordered w-full text-sm"
                    aria-label="Invite link"
                    placeholder="Invite link"
                  />
                  <button
                    type="button"
                    className="btn btn-square btn-primary"
                    onClick={handleCopyInviteLink}
                    aria-label="Copy invite link"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-xs text-success mt-2">
                  Link copied to clipboard!
                </p>
              )}
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => setShowInviteModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CommunityAboutcard;
