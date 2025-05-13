"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { convertS3UrlToR2, isS3Url } from "@/utils/s3-to-r2-migration";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";

interface UserData {
  _id: string;
  username: string;
  image?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  emailVerified?: boolean;
}

interface Community {
  _id: string;
  name: string;
  slug: string;
  role: "admin" | "sub-admin" | "member";
}

interface Post {
  _id: string;
  title: string;
  content: any;
  createdAt: string;
  community: {
    name: string;
    slug: string;
  };
}

interface ApiResponse {
  user: UserData;
  communities: Community[];
  posts: Post[];
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data: ApiResponse = await response.json();
        setUserData(data.user);
        setCommunities(data.communities || []);
        setPosts(data.posts || []);
        setIsOwnProfile(session?.user?.id === id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load user profile. Please try again later.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, session?.user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-error text-error-content p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-base-200 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">User Not Found</h2>
          <p>
            The user profile you're looking for doesn't exist or has been
            removed.
          </p>
          <Link href="/" className="btn btn-primary mt-4">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleResendVerification = async () => {
    if (!userData?.email) {
      showNotification("Email address is required", "error");
      return;
    }

    setResendingVerification(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(
          "Verification email sent. Please check your inbox.",
          "success"
        );
      } else {
        showNotification(
          data.error || "Failed to send verification email",
          "error"
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      showNotification("An error occurred. Please try again later.", "error");
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="bg-base-200 rounded-lg shadow-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary h-24 sm:h-32 relative"></div>

        <div className="p-4 sm:p-6 relative">
          {/* Profile Picture */}
          <div className="absolute -top-16 sm:-top-20 left-4 sm:left-6 avatar">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 bg-base-100">
              {userData.profileImage ? (
                <div
                  className="w-full h-full rounded-full bg-center bg-cover"
                  style={{
                    backgroundImage: `url(${isS3Url(userData.profileImage) ? convertS3UrlToR2(userData.profileImage) : userData.profileImage})`,
                  }}
                />
              ) : userData.image ? (
                <Image
                  src={userData.image}
                  alt={userData.username}
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              ) : (
                <div className="bg-primary text-primary-content w-full h-full rounded-full flex items-center justify-center text-3xl font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mb-12 sm:mb-16 gap-2">
            {isOwnProfile && !userData.emailVerified && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="btn btn-warning btn-sm"
                disabled={resendingVerification}
              >
                {resendingVerification ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Mail className="w-4 h-4 mr-1" />
                )}
                {resendingVerification ? "Sending..." : "Verify Email"}
              </button>
            )}
            {isOwnProfile && (
              <Link href="/UserSettings" className="btn btn-primary btn-sm">
                Edit Profile
              </Link>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold">
              {userData.username}
            </h1>

            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
              {userData.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{userData.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>
                  Joined {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>

              {userData.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon size={16} />
                  <a
                    href={
                      userData.website.startsWith("http")
                        ? userData.website
                        : `https://${userData.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {userData.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              {/* Email verification status - only show on own profile */}
              {isOwnProfile && (
                <div className="flex items-center gap-1">
                  {userData.emailVerified ? (
                    <>
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-success">Email verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-warning" />
                      <span className="text-warning">Email not verified</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {userData.bio && (
              <p className="mt-4 text-base-content">{userData.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Communities Section */}
      {communities.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl font-bold mb-3 sm:mb-4">Communities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {communities.map((community) => (
              <Link
                key={community._id}
                href={`/Newcompage/${community.slug}`}
                className="card bg-base-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{community.name}</h3>
                  <div className="badge badge-primary">
                    {community.role === "admin"
                      ? "Admin"
                      : community.role === "sub-admin"
                        ? "Sub-Admin"
                        : "Member"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl font-bold mb-3 sm:mb-4">Recent Posts</h2>
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="card bg-base-200 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{post.title}</h3>
                  <div className="text-sm text-gray-500">
                    Posted in{" "}
                    <Link
                      href={`/Newcompage/${post.community.slug}`}
                      className="text-primary hover:underline"
                    >
                      {post.community.name}
                    </Link>{" "}
                    • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    {typeof post.content === "string" ? (
                      <p>
                        {post.content.length > 150
                          ? `${post.content.substring(0, 150)}...`
                          : post.content}
                      </p>
                    ) : (
                      <p>Click to view post</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
