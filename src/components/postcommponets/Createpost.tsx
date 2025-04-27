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

    const finalContents: PostContent[] = [...contents];

    // Add current text input if it exists
    if (currentInput.trim()) {
      // Parse text for URLs and convert them to clickable links
      const parsedContent = parseTextWithLinks(currentInput);
      // Type assertion to ensure compatibility
      finalContents.push(...(parsedContent as PostContent[]));
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
    <div className="bg-amber-50/70 rounded-xl shadow-lg w-full p-4 sm:p-6 border border-amber-200/50 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 text-amber-800 flex items-center">
        <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white p-1 rounded-md mr-2 text-xs">
          ✏️
        </span>
        Create a Post
      </h2>
      <div className="space-y-2 sm:space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          className="w-full px-4 py-2 text-sm sm:text-base bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all duration-200 placeholder-amber-300"
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
            className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-white rounded-lg border border-amber-200 text-xs sm:text-sm shadow-sm"
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
              className="p-1 rounded-full hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors duration-200"
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
              className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all duration-200 resize-none placeholder-amber-300"
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
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-200 border border-amber-200"
              onClick={() => imageInputRef.current?.click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="hidden xs:inline">Add Image</span>
              <span className="xs:hidden">Image</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-200 border border-amber-200"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
              aria-label="Add emoji"
            >
              <Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add Emoji</span>
              <span className="xs:hidden">Emoji</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-200 border border-amber-200"
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
              <Link className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add Link</span>
              <span className="xs:hidden">Link</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-200 border border-amber-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Add File</span>
              <span className="xs:hidden">File</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 mt-2"
          disabled={!title.trim() && contents.length === 0}
        >
          Post
        </button>
      </div>
    </div>
  );
}
