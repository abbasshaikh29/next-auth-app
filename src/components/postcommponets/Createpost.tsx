"use client";

import { Link, FileText, X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
interface PostContent {
  type: "text" | "image" | "link" | "file";
  content: string;
}

interface CreatePostProps {
  communitySlug: string;
  authorId: string;
  onPostCreated?: (newPost: any) => void;
}

export function CreatePost({
  communitySlug,

  onPostCreated,
}: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState<PostContent[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File, type: "image" | "file") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setContents([
          ...contents,
          {
            type,
            content: e.target.result as string,
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const finalContents = [...contents];

    // Add current text input if it exists
    if (currentInput.trim()) {
      finalContents.push({ type: "text", content: currentInput });
    }

    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          content: JSON.stringify(finalContents),
          communitySlug: communitySlug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const newPost = await response.json();
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Clear the form
      setTitle("");
      setContents([]);
      setCurrentInput("");
    } catch (error: any) {
      console.error("Error creating post:", error.message);
      throw error;
    }
  };

  return (
    <div className="card bg-base-200 shadow-md w-full p-4">
      <h2 className="font-semibold mb-4">Create a Post</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          className="input input-bordered w-full bg-white"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />
        <label htmlFor="imageInput" className="hidden">
          Image Input
        </label>
        <input
          id="imageInput"
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "image");
          }}
        />
        <label htmlFor="fileInput" className="hidden">
          File Input
        </label>
        <input
          id="fileInput"
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, "file");
          }}
        />

        {contents.map((content, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
          >
            {content.type === "image" ? (
              <div className="relative w-full">
                <Image
                  src={content.content}
                  alt=""
                  className="max-h-60 object-contain mx-auto"
                />
              </div>
            ) : content.type === "link" ? (
              <>
                <Link className="h-4 w-4" />
                <span className="flex-1">{content.content}</span>
              </>
            ) : content.type === "file" ? (
              <>
                <FileText className="h-4 w-4" />
                <span className="flex-1">File uploaded</span>
              </>
            ) : (
              <span className="flex-1">{content.content}</span>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleRemoveContent(index)}
            >
              e<X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="space-y-2">
          <textarea
            placeholder="What's on your mind?"
            value={currentInput}
            className="textarea textarea-bordered w-full bg-white"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCurrentInput(e.target.value)
            }
            rows={4}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => imageInputRef.current?.click()}
            >
              Add Image
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => {
                if (currentInput.trim()) {
                  setContents([
                    ...contents,
                    { type: "link", content: currentInput },
                  ]);
                  setCurrentInput("");
                }
              }}
            >
              <Link className="h-4 w-4 mr-2" />
              Add Link
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add File
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-outline w-full bg-base-300"
          disabled={!title.trim() && contents.length === 0}
        >
          Post
        </button>
      </div>
    </div>
  );
}
