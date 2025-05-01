"use client";
import mongoose from "mongoose";
import React, { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ICommunity } from "@/models/Community";
import { IPost } from "@/models/Posts";
import CommunityNav from "@/components/communitynav/CommunityNav";

// Dynamically import components for code splitting
const CommunityAboutcard = lazy(
  () => import("@/components/communitycommponets/CommunityAboutcard")
);
const CreatePost = lazy(() =>
  import("@/components/postcommponets/Createpost").then((mod) => ({
    default: mod.CreatePost,
  }))
);
const Searchs = lazy(() => import("@/components/communitycommponets/Search"));
const PostCard = lazy(() => import("@/components/Post"));
const About = lazy(() => import("@/components/communitynav/About"));
const EditPostModal = lazy(() =>
  import("@/components/postcommponets/EditPostModal").then((mod) => ({
    default: mod.EditPostModal,
  }))
);

interface PostWithAuthor extends Omit<IPost, "likes"> {
  _id: string;
  authorName: string;
  likes: mongoose.Types.ObjectId[];
  content: string;
  createdAt: Date;
  profileImage?: string;
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
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to fetch posts (sorted by date, newest first)
  const fetchPosts = async () => {
    if (!slug || !isMember) return;

    try {
      console.log(`Fetching posts for community: ${slug}`);
      const postsResponse = await fetch(
        `/api/community/posts?communitySlug=${slug}`
      );

      if (!postsResponse.ok) {
        const errorText = await postsResponse.text();
        console.error(`Server response (${postsResponse.status}):`, errorText);
        throw new Error(
          `Failed to fetch posts: ${postsResponse.status} ${postsResponse.statusText}`
        );
      }

      const postsData = await postsResponse.json();
      console.log(`Fetched ${postsData.length} posts successfully`);

      // Posts are already sorted by the API (newest first)
      setPosts(postsData);
      setFilteredPosts(searchQuery ? filteredPosts : postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch posts"
      );
    }
  };

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

        // Debug membership check
        console.log("Community data:", {
          communityId: communityData._id,
          name: communityData.name,
          hasMembers: !!communityData.members,
          membersLength: communityData.members?.length || 0,
          userId: session?.user?.id,
          isMember: communityData.members?.includes(session?.user?.id) || false,
        });

        const membershipStatus =
          communityData.members?.includes(session?.user?.id) || false;
        setIsMember(membershipStatus);

        if (membershipStatus) {
          await fetchPosts();
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

    // Set up interval to refresh posts periodically
    const refreshInterval = setInterval(() => {
      if (isMember) {
        fetchPosts();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [slug, session?.user?.id, isMember]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle post edit
  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (post) {
      setEditingPost(post);
      setEditingPostId(postId);
      setIsEditModalOpen(true);
    }
  };

  // Handle post update
  const handlePostUpdated = (updatedPost: any) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );

    // Also update filtered posts if needed
    if (searchQuery) {
      setFilteredPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    }
  };

  // Handle post delete
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch("/api/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // Remove the post from state
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));

      // Also update filtered posts if needed
      if (searchQuery) {
        setFilteredPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      }
    } catch (error: any) {
      console.error("Error deleting post:", error.message);
      alert("Failed to delete post: " + error.message);
    }
  };

  // Effect to filter posts when search query or posts change
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search query is empty, show all posts (already sorted by API)
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

    // Filtered posts should maintain the same sort order (newest first)
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
    <>
      <div>
        <CommunityNav />
        {isMember ? (
          <div className="container mt-6 mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              {/* Main content - Posts */}
              <div className="flex flex-col mt-6 w-full lg:w-2/3 gap-3">
                <div className="mb-4">
                  <Suspense
                    fallback={<div className="skeleton h-12 w-full"></div>}
                  >
                    <Searchs onSearch={handleSearch} />
                  </Suspense>
                </div>
                <div>
                  <Suspense
                    fallback={<div className="skeleton h-32 w-full"></div>}
                  >
                    <CreatePost
                      communitySlug={slug}
                      authorId={session?.user?.id as string}
                      onPostCreated={(newPost) => {
                        setPosts((prevPosts) => [newPost, ...prevPosts]);
                      }}
                    />
                  </Suspense>
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
                        profileImage: post.profileImage,
                        // Convert createdBy to string if it's an object
                        createdBy:
                          typeof post.createdBy === "object" &&
                          post.createdBy !== null
                            ? post.createdBy._id?.toString() ||
                              post.createdBy.toString()
                            : post.createdBy,
                      };
                      return (
                        <Suspense
                          key={post._id}
                          fallback={
                            <div className="skeleton h-48 w-full"></div>
                          }
                        >
                          <PostCard
                            key={post._id}
                            post={postData}
                            onLike={(liked) => {
                              // The Post component will handle the API call
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
                                                id.toString() !==
                                                session?.user?.id
                                            ),
                                      }
                                    : p
                                );
                              });
                            }}
                            onEdit={(postId) => handleEditPost(postId)}
                            onDelete={(postId) => handleDeletePost(postId)}
                          />
                        </Suspense>
                      );
                    })
                  )}
                </div>
              </div>

              {/* About card - Hidden on mobile, visible on large screens */}
              <div className="hidden lg:block lg:w-1/3 mt-6">
                <Suspense
                  fallback={<div className="skeleton h-96 w-full"></div>}
                >
                  <CommunityAboutcard slug={slug} />
                </Suspense>
              </div>

              {/* Mobile-only about button that opens a modal */}
              <div className="lg:hidden w-full mt-4 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const modal = document.getElementById(
                      "community-about-modal"
                    ) as HTMLDialogElement;
                    if (modal) modal.showModal();
                  }}
                  className="btn btn-outline w-full"
                >
                  About This Community
                </button>

                <dialog
                  id="community-about-modal"
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    <Suspense
                      fallback={<div className="skeleton h-96 w-full"></div>}
                    >
                      <CommunityAboutcard slug={slug} />
                    </Suspense>
                    <div className="modal-action">
                      <form method="dialog">
                        <button type="submit" className="btn">
                          Close
                        </button>
                      </form>
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-4">
              <Suspense fallback={<div className="skeleton h-96 w-full"></div>}>
                <About slug={slug} />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          }
        >
          <EditPostModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingPost(null);
              setEditingPostId(null);
            }}
            postId={editingPostId || ""}
            initialTitle={editingPost.title}
            initialContent={
              typeof editingPost.content === "string"
                ? JSON.parse(editingPost.content)
                : editingPost.content
            }
            onPostUpdated={handlePostUpdated}
          />
        </Suspense>
      )}
    </>
  );
}
