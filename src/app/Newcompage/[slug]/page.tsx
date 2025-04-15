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
import About from "@/components/communitynav/About";

interface PostWithAuthor extends Omit<IPost, "likes"> {
  _id: string;
  authorName: string;
  likes: mongoose.Types.ObjectId[];
  content: string;
  createdAt: Date;
}

export default function HomeIdPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostWithAuthor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) {
        return;
      }
      try {
        const communityResponse = await fetch(`/api/community/${slug}`);
        if (!communityResponse.ok) {
          throw new Error("Failed to fetch community");
        }
        const communityData = await communityResponse.json();
        setCommunity(communityData);
        setIsMember(
          communityData.members?.includes(session?.user?.id) || false
        );

        if (isMember) {
          const postsResponse = await fetch(
            `/api/community/posts?communitySlug=${slug}`
          );
          if (!postsResponse.ok) {
            throw new Error("Failed to fetch posts");
          }
          const postsData = await postsResponse.json();
          setPosts(postsData);
          setFilteredPosts(postsData);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch community"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, session?.user?.id, isMember]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Effect to filter posts when search query or posts change
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search query is empty, show all posts
      setFilteredPosts(posts);
      return;
    }

    // Filter posts based on search query
    const filtered = posts.filter((post) => {
      const lowerCaseQuery = searchQuery.toLowerCase();

      // Search in title
      if (post.title.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }

      // Search in content
      try {
        let content;
        if (typeof post.content === "string") {
          content = JSON.parse(post.content);
        } else {
          content = post.content;
        }

        if (Array.isArray(content)) {
          return content.some(
            (item) =>
              item.type === "text" &&
              item.content.toLowerCase().includes(lowerCaseQuery)
          );
        }

        return false;
      } catch (e) {
        console.error("Error parsing post content:", e);
        return false;
      }
    });

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!community) {
    return <div>Community not found.</div>;
  }

  return (
    <div>
      <CommunityNav />
      {isMember ? (
        <div className="container mt-6 mx-auto px-4 py-8">
          <div className="flex flex-row justify-between gap-4">
            <div className="flex flex-col mt-6 w-2/4 gap-3">
              <Searchs onSearch={handleSearch} />
              <div>
                <CreatePost
                  communitySlug={slug}
                  authorId={session?.user?.id as string}
                  onPostCreated={(newPost) => {
                    setPosts((prevPosts) => [newPost, ...prevPosts]);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.length === 0 && searchQuery ? (
                  <div className="text-center p-4 bg-base-200 rounded-lg">
                    <p className="text-lg">
                      No posts found matching "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const postData = {
                      ...post,
                      _id: post._id.toString(),
                      createdAt:
                        typeof post.createdAt === "string"
                          ? post.createdAt
                          : post.createdAt.toISOString(),
                      likes: Array.isArray(post.likes) ? post.likes : [],
                      authorName: post.authorName,
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
                                          ...(Array.isArray(p.likes)
                                            ? p.likes
                                            : []),
                                          new mongoose.Types.ObjectId(
                                            session?.user?.id
                                          ),
                                        ]
                                      : (Array.isArray(p.likes)
                                          ? p.likes
                                          : []
                                        ).filter(
                                          (id) =>
                                            id.toString() !== session?.user?.id
                                        ),
                                  }
                                : p
                            );
                          });
                        }}
                      />
                    );
                  })
                )}
              </div>
            </div>
            <div className="w-1/4 mt-6">
              <CommunityAboutcard slug={slug} />
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            <About slug={slug} />
          </div>
        </div>
      )}
    </div>
  );
}
