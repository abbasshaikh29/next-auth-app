"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image, Link, FileText, X } from "lucide-react";
import { useState, useRef, useInsertionEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { log } from "console";

interface PostContent {
  type: "text" | "image" | "link" | "file";
  content: string;
}

interface CreatePostProps {
  communitySlug: string;
  authorId: string;
  onPostCreated?: (newPost: any) => void;
}

interface ApiResponse {
  ok: boolean;
  json: () => Promise<any>;
}

export function CreatePost({
  communitySlug,
  authorId,
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
    <Card className="p-4 border  w-full">
      <h2 className="font-semibold mb-4">Create a Post</h2>
      <div className="space-y-4">
        <Input
          placeholder="Post title"
          value={title}
          className="rounded-md"
          onChange={(e) => setTitle(e.target.value)}
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
            {content.type === "image" && (
              <div className="relative w-full">
                <Image className="h-4 w-4 absolute left-2 top-2" />
                <img
                  src={content.content}
                  alt=""
                  className="max-h-60 object-contain mx-auto"
                />
              </div>
            )}
            {content.type === "link" && (
              <>
                <Link className="h-4 w-4" />
                <span className="flex-1">{content.content}</span>
              </>
            )}
            {content.type === "file" && (
              <>
                <FileText className="h-4 w-4" />
                <span className="flex-1">File uploaded</span>
              </>
            )}
            {content.type === "text" && (
              <span className="flex-1">{content.content}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveContent(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="space-y-2">
          <Textarea
            placeholder="What's on your mind?"
            value={currentInput}
            className="rounded-md"
            onChange={(e) => setCurrentInput(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-200 hover:bg-gray-300 flex items-center"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-200 hover:bg-gray-300 flex items-center"
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
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-200 hover:bg-gray-300 flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full  btn-primary"
          disabled={!title.trim() && contents.length === 0}
        >
          Post
        </Button>
      </div>
    </Card>
  );
}
