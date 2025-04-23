"use client";

import { Link, FileText, X, Smile } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { parseTextWithLinks } from "@/lib/url-utils";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        currentInput.substring(0, start) + emoji + currentInput.substring(end);
      setCurrentInput(newText);

      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.selectionStart = start + emoji.length;
        textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setCurrentInput(currentInput + emoji);
    }

    // Keep emoji picker open for multiple selections
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const finalContents = [...contents];

    // Add current text input if it exists
    if (currentInput.trim()) {
      // Parse text for URLs and convert them to clickable links
      const parsedContent = parseTextWithLinks(currentInput);
      finalContents.push(...parsedContent);
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
    <div className="card bg-primary shadow-md w-full p-3 sm:p-4">
      <h2 className="text-sm sm:text-base font-semibold mb-2 sm:mb-4">
        Create a Post
      </h2>
      <div className="space-y-2 sm:space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          className="input input-bordered input-sm sm:input-md w-full bg-white text-sm sm:text-base"
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
            className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-gray-50 rounded text-xs sm:text-sm"
          >
            {content.type === "image" ? (
              <div className="relative w-full">
                <Image
                  src={content.content}
                  alt=""
                  className="max-h-40 sm:max-h-60 object-contain mx-auto"
                />
              </div>
            ) : content.type === "link" ? (
              <>
                <Link className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="flex-1">{content.content}</span>
              </>
            ) : content.type === "file" ? (
              <>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="flex-1">File uploaded</span>
              </>
            ) : (
              <span className="flex-1">{content.content}</span>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-xs sm:btn-sm"
              onClick={() => handleRemoveContent(index)}
              title="Remove content"
              aria-label="Remove content"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ))}

        <div className="space-y-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={currentInput}
              className="textarea textarea-bordered textarea-sm sm:textarea-md w-full bg-white text-xs sm:text-sm"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setCurrentInput(e.target.value)
              }
              rows={3}
            />
            {showEmojiPicker && (
              <div
                className="absolute z-10 bottom-0 right-0 mb-16"
                ref={emojiPickerRef}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={280}
                  height={350}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              type="button"
              className="btn btn-outline btn-xs sm:btn-sm flex items-center"
              onClick={() => imageInputRef.current?.click()}
            >
              <span className="hidden xs:inline">Add Image</span>
              <span className="xs:hidden">Image</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs sm:btn-sm flex items-center"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
              aria-label="Add emoji"
            >
              <Smile className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Emoji</span>
              <span className="xs:hidden">Emoji</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs sm:btn-sm flex items-center"
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
              <Link className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Link</span>
              <span className="xs:hidden">Link</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs sm:btn-sm flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add File</span>
              <span className="xs:hidden">File</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-xs sm:btn-sm btn-outline w-full bg-base-300 text-xs sm:text-sm"
          disabled={!title.trim() && contents.length === 0}
        >
          Post
        </button>
      </div>
    </div>
  );
}
