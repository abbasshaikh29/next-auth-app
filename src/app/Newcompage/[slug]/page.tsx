"use client";
import mongoose from "mongoose";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ICommunity } from "@/models/Community";
import CommunityAboutcard from "@/components/communitycommponets/CommunityAboutcard";
import { CreatePost } from "@/components/postcommponets/Createpost";
import Searchs from "@/components/communitycommponets/Search";
import { IPost } from "@/models/Posts";
import PostCard from "@/components/Post";
import CommunityNav from "@/components/communitynav/CommunityNav";

interface PostWithAuthor extends Omit<IPost, "likes"> {
  _id: string;
  authorName: string;
  likes: mongoose.Types.ObjectId[];
  content: string;
  createdAt: Date;
}

export default function HomeIdPage() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        return;
      }
      if (typeof slug !== "string") return;
      try {
        const communityResponse = await fetch(`/api/community/${slug}`);
        if (!communityResponse.ok) {
          throw new Error("Failed to fetch community");
        }
        const communityData = await communityResponse.json();
        setCommunity(communityData);

        const postsResponse = await fetch(
          `/api/community/posts?communitySlug=${slug}`
        );
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }
        const postsData = await postsResponse.json();
        setPosts(postsData);
        console.log(postsData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch community");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!community) {
    return <div>Community not found.</div>;
  }

  // Check if slug is available before rendering CreatePost
  if (!slug) {
    return <div>Loading community...</div>;
  }

  return (
    <div className=" min-h-screen bg-base-content">
      <CommunityNav />
      {community ? (
        <div className="container mx-auto mt-8">
          <div className="flex flex-row gap-8">
            <div className="w-3/4 flex flex-col">
              <div className="mb-4">
                <Searchs />
              </div>
              <div className=" rounded-lg shadow-md p-4">
                <CreatePost
                  communitySlug={slug as string}
                  authorId={session?.user?.id as string}
                  onPostCreated={(newPost) => {
                    setPosts((prevPosts) => [newPost, ...prevPosts]);
                  }}
                />
              </div>
              <div className="mt-4 space-y-4">
                {posts.map((post) => {
                  const postData = {
                    ...post,
                    _id: post._id.toString(),
                    createdAt:
                      typeof post.createdAt === "string"
                        ? post.createdAt
                        : post.createdAt.toISOString(),
                    likes: post.likes.length,
                    author: {
                      name: post.authorName,
                      avatar: "",
                    },
                  };
                  return (
                    <PostCard
                      key={post._id}
                      post={postData}
                      onLike={(liked) => {
                        setPosts((prev) => {
                          return prev.map((p) =>
                            p._id === post._id
                              ? {
                                  ...p,
                                  likes: liked
                                    ? [
                                        ...p.likes,
                                        new mongoose.Types.ObjectId(),
                                      ]
                                    : p.likes.slice(0, -1),
                                }
                              : { ...p }
                          );
                        });
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="w-1/4">
              <CommunityAboutcard
                title={community?.name}
                description={community?.description}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>Community not found.</p>
      )}
    </div>
  );
}
