"use client";

import { useState, useEffect } from "react";
import type { ICommunity } from "@/models/Community";
import { IUser } from "@/models/User";
import { useSession } from "next-auth/react";
import CommunityJoinForm from "../CommunityJoinForm";
import Link from "next/link";
import { Link as LinkIcon, Copy, Check } from "lucide-react";

interface AboutProps {
  slug: string;
}

async function getCommunity(slug: string): Promise<{
  community: ICommunity | null;
  adminData: { user: IUser } | null;
  error?: string;
}> {
  try {
    // Fetch community data
    const communityResponse = await fetch(`/api/community/${slug}`);
    if (!communityResponse.ok) {
      // If that fails, try the debug endpoint to get more information
      const debugResponse = await fetch(
        `/api/community/check?slug=${encodeURIComponent(slug)}`
      );
      const debugData = await debugResponse.json();

      if (debugData.communityFound && debugData.communityData) {
        // Community exists but there was an error fetching it
        return {
          community: null,
          adminData: null,
          error: `Community exists but couldn't be fetched properly. Database status: ${JSON.stringify(
            debugData.dbStatus
          )}`,
        };
      } else if (debugData.totalCommunities > 0) {
        // Other communities exist but not this one
        return {
          community: null,
          adminData: null,
          error: `Community with slug "${slug}" not found. ${debugData.totalCommunities} other communities exist.`,
        };
      } else {
        // No communities exist at all
        return {
          community: null,
          adminData: null,
          error:
            "No communities found in the database. Database may be empty or not properly connected.",
        };
      }
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
        // Continue with community data even if admin fetch fails
        return {
          community: communityData,
          adminData: null,
          error: `Admin data could not be fetched: ${
            adminError instanceof Error
              ? adminError.message
              : String(adminError)
          }`,
        };
      }
    }

    return { community: communityData, adminData: null };
  } catch (error) {
    return {
      community: null,
      adminData: null,
      error: `Error fetching community: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getCommunity(slug);

      if (data.community) {
        setCommunityData({
          community: data.community,
          admin: data.adminData ? data.adminData.user : null,
        });
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
      // Silent error handling
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

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

  // Add proper checks for community data
  const community = communityData.community;
  const members = community.members || [];
  const adminQuestions = community.adminQuestions || [];
  const isAdmin = session?.user?.id === community.admin;
  const isMember = members.includes(session?.user?.id || "");

  return (
    <div className="m-3 sm:m-6 md:m-8 flex flex-col gap-3 bg-base-300 p-3 sm:p-4 rounded-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        {community.name}
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        Created by{" "}
        {communityData.admin?.username ||
          communityData.community.createdBy ||
          "Unknown"}
      </p>
      <div className="text-sm sm:text-base text-gray-600 mb-3">
        {community.description}
      </div>

      {isAdmin && (
        <div className="mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            Admin Options
          </h2>
          <Link
            href={`/Newcompage/${slug}/communitysetting?t=AdminPanel`}
            className="btn btn-sm sm:btn-md btn-primary"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      {!isMember && !isAdmin && (
        <div className="mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            Join Community
          </h2>
          <CommunityJoinForm
            communityId={community._id?.toString() || ""}
            questions={adminQuestions}
            onSuccess={fetchData}
          />
        </div>
      )}
    </div>
  );
}

export default About;
