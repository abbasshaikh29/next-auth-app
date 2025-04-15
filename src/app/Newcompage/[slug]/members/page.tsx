"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CommunityNav from "@/components/communitynav/CommunityNav";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";

interface Member {
  _id: string;
  username: string;
  image?: string;
  profileImage?: string;
  role: "admin" | "sub-admin" | "member";
  joinedAt: string;
}

export default function MembersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        console.log("Fetching members for community:", slug);
        const response = await fetch(`/api/community/${slug}/members`);

        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }

        const data = await response.json();
        console.log("Members data received:", data);
        setMembers(data.members);
        setIsAdmin(data.isAdmin);
        setIsSubAdmin(data.isSubAdmin);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError("Failed to load members. Please try again later.");
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchMembers();
    }
  }, [slug, session?.user?.id]);

  if (!session) {
    return (
      <>
        <CommunityNav />
        <div className="container mx-auto p-6">
          <div className="bg-base-200 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Please Sign In</h2>
            <p>You need to be signed in to view community members.</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <CommunityNav />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CommunityNav />
        <div className="container mx-auto p-6">
          <div className="bg-error text-error-content p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CommunityNav />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Community Members</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member._id}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      {member.profileImage ? (
                        <div
                          className="w-20 h-20 rounded-full bg-center bg-cover"
                          style={{
                            backgroundImage: `url(${member.profileImage})`,
                          }}
                        />
                      ) : member.image ? (
                        <Image
                          src={member.image}
                          alt={member.username}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="bg-primary text-primary-content w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold">
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="card-title">{member.username}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`badge ${
                          member.role === "admin"
                            ? "badge-primary"
                            : member.role === "sub-admin"
                            ? "badge-secondary"
                            : "badge-ghost"
                        }`}
                      >
                        {member.role === "admin"
                          ? "Admin"
                          : member.role === "sub-admin"
                          ? "Sub-Admin"
                          : "Member"}
                      </div>
                      <div className="text-xs opacity-70">
                        Joined: {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link
                    href={`/profile/${member._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="bg-base-200 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-4">No Members Found</h2>
            <p>This community doesn't have any members yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
