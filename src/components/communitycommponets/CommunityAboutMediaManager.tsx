"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import S3FileUpload from "../S3FileUpload";
import { Trash2, Image, Video, X, Info } from "lucide-react";
import type { CommunityMediaItem } from "@/models/Community";

export default function CommunityAboutMediaManager() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [mediaItems, setMediaItems] = useState<CommunityMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [communityId, setCommunityId] = useState("");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [mediaTitle, setMediaTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  // Fetch community data and media items
  const fetchCommunityData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/community/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch community data");
      }

      const data = await response.json();
      setCommunityId(data._id);

      // Check if user is admin or sub-admin
      const userId = session?.user?.id;
      setIsAdmin(data.admin === userId);
      setIsSubAdmin(data.subAdmins?.includes(userId) || false);

      // Fetch media items
      const mediaResponse = await fetch(`/api/community/${slug}/about-media`);
      if (!mediaResponse.ok) {
        throw new Error("Failed to fetch media items");
      }

      const mediaData = await mediaResponse.json();
      setMediaItems(mediaData.aboutMedia || []);
    } catch (error) {
      console.error("Error fetching community data:", error);
      showNotification("Failed to fetch community data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchCommunityData();
    }
  }, [slug, session?.user?.id]);

  // Handle media upload success
  const handleUploadSuccess = async (response: {
    url: string;
    key: string;
    fileName: string;
    fileType: string;
  }) => {
    try {
      setIsUploading(true);

      // Determine media type based on file type
      const mediaType = response.fileType.startsWith("image/")
        ? "image"
        : "video";

      // Add the media item to the community
      const apiResponse = await fetch(`/api/community/${slug}/about-media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: response.url,
          type: mediaType,
          title: mediaTitle || response.fileName,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Failed to add media item");
      }

      const data = await apiResponse.json();
      setMediaItems(data.aboutMedia || []);
      setMediaTitle("");
      showNotification("Media added successfully", "success");
    } catch (error) {
      console.error("Error adding media:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to add media",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaUrl: string) => {
    try {
      const response = await fetch(`/api/community/${slug}/about-media`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete media item");
      }

      const data = await response.json();
      setMediaItems(data.aboutMedia || []);
      showNotification("Media deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting media:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to delete media",
        "error"
      );
    }
  };

  // Count media items by type
  const imageCount = mediaItems.filter((item) => item.type === "image").length;
  const videoCount = mediaItems.filter((item) => item.type === "video").length;
  const totalCount = mediaItems.length;

  // Check if we can add more media
  const canAddMedia = totalCount < 5;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!isAdmin && !isSubAdmin) {
    return (
      <div className="alert alert-warning">
        <Info className="h-5 w-5" />
        <span>Only admins and sub-admins can manage community media.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg font-semibold">Community About Media</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="badge badge-neutral">{imageCount} Images</span>
          <span className="badge badge-neutral">{videoCount} Videos</span>
          <span className="badge badge-primary">{totalCount}/5 Total</span>
        </div>
      </div>

      {/* Media Gallery */}
      {mediaItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.url}
              className="relative group border rounded-lg overflow-hidden bg-base-200"
            >
              {item.type === "image" ? (
                <div className="aspect-video">
                  <img
                    src={item.url}
                    alt={item.title || `Community media item - ${item.type}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video">
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleDeleteMedia(item.url)}
                  className="btn btn-sm btn-error"
                  aria-label="Delete media item"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              {item.title && (
                <div className="p-2 text-sm font-medium truncate">
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Form */}
      {canAddMedia ? (
        <div className="border rounded-lg p-4 bg-base-100">
          <div className="tabs tabs-boxed mb-4">
            <button
              type="button"
              className={`tab ${activeTab === "image" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("image")}
              aria-label="Switch to image upload"
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-4 w-4 mr-2" />
              Upload Image
            </button>
            <button
              type="button"
              className={`tab ${activeTab === "video" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("video")}
              aria-label="Switch to video upload"
            >
              <Video className="h-4 w-4 mr-2" />
              Upload Video
            </button>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Title (Optional)</span>
            </label>
            <input
              type="text"
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="Enter a title for this media"
              className="input input-bordered w-full"
            />
          </div>

          <S3FileUpload
            fileType={activeTab}
            uploadType="community-about-media"
            entityId={communityId}
            onSuccess={handleUploadSuccess}
          />

          <div className="mt-2 text-xs text-gray-500">
            <p>
              {activeTab === "image"
                ? "Upload images to showcase your community. Max 5MB per image."
                : "Upload videos up to 10 minutes long (max 100MB) to showcase your community."}
            </p>
            <p className="mt-1">
              Total limit: 5 media items (images and videos combined).
            </p>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          <Info className="h-5 w-5" />
          <span>
            You've reached the maximum limit of 5 media items. Delete some to
            add more.
          </span>
        </div>
      )}
    </div>
  );
}
