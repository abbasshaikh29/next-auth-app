"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";

import { useParams, useRouter } from "next/navigation";
interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
}

interface UserPost {
  _id: string;
  content: any;
  createdAt: string;
  community: {
    name: string;
    slug: string;
  };
}

export default function Profile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    email: "",
    bio: "",
  });
  const [posts, setPosts] = useState<UserPost[]>([]);

  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${id}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();

        setFormData({
          username: data.user.username,
          email: data.user.email,
          bio: data.user.bio || "",
        });

        // Parse post content
        const parsedPosts = data.posts.map((post: UserPost) => ({
          ...post,
          content: parsePostContent(post.content),
        }));

        setPosts(parsedPosts || []);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch user data");
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  // Function to parse post content
  const parsePostContent = (content: any) => {
    try {
      if (typeof content === "string") {
        return JSON.parse(content);
      }
      return content;
    } catch (error) {
      console.error("Failed to parse content", content);
      return [];
    }
  };

  // Function to render post content
  const renderPostContent = (content: any) => {
    if (!Array.isArray(content)) return null;

    return content.map((item, index) => {
      if (item.type === "text") {
        return <p key={index}>{item.content}</p>;
      }
      return null;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Username:</span> {formData.username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {formData.email}
          </p>
          <p>
            <span className="font-medium">Bio:</span>{" "}
            {formData.bio || "No bio provided"}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    Posted in {post.community.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-800">
                  {renderPostContent(post.content)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            `You haven &apos t created any posts yet.`
          </p>
        )}
      </div>
    </div>
  );
}
