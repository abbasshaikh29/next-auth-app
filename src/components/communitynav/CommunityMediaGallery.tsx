"use client";

import { useState, useEffect } from "react";
import { CommunityMediaItem } from "@/models/Community";
import { Image, Video, X, ExternalLink, Maximize2 } from "lucide-react";

interface CommunityMediaGalleryProps {
  slug: string;
}

export default function CommunityMediaGallery({
  slug,
}: CommunityMediaGalleryProps) {
  const [mediaItems, setMediaItems] = useState<CommunityMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<CommunityMediaItem | null>(
    null
  );
  const [featuredMedia, setFeaturedMedia] = useState<CommunityMediaItem | null>(
    null
  );

  // Fetch media items
  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/community/${slug}/about-media`);

        if (!response.ok) {
          throw new Error("Failed to fetch media items");
        }

        const data = await response.json();
        const mediaData = data.aboutMedia || [];
        setMediaItems(mediaData);

        // Set the first media item as the featured item
        if (mediaData.length > 0) {
          setFeaturedMedia(mediaData[0]);
        }
      } catch (error) {
        console.error("Error fetching media items:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, [slug]);

  // Open media viewer
  const openMediaViewer = (media: CommunityMediaItem) => {
    setSelectedMedia(media);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  // Close media viewer
  const closeMediaViewer = () => {
    setSelectedMedia(null);
    document.body.style.overflow = ""; // Restore scrolling
  };

  // Set featured media item
  const setAsFeatured = (media: CommunityMediaItem) => {
    setFeaturedMedia(media);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return null; // Don't show anything if there are no media items
  }

  return (
    <div className="mt-4">
      {/* Featured Media Display */}
      {featuredMedia && (
        <div className="mb-4">
          <div
            className="w-full rounded-lg overflow-hidden bg-base-100 shadow-sm cursor-pointer"
            onClick={() => openMediaViewer(featuredMedia)}
          >
            {featuredMedia.type === "image" ? (
              <div className="relative group aspect-[21/9]">
                <img
                  src={featuredMedia.url}
                  alt={featuredMedia.title || "Community image"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white h-8 w-8" />
                </div>
              </div>
            ) : (
              <div className="relative group aspect-[21/9]">
                <video
                  src={featuredMedia.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white h-8 w-8" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white p-1 rounded">
                  <Video className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
          {mediaItems.map((item) => (
            <div
              key={item.url}
              className={`flex-shrink-0 w-28 h-28 border rounded-md overflow-hidden cursor-pointer ${
                featuredMedia?.url === item.url ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setAsFeatured(item)}
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.title || "Community image"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white p-0.5 rounded">
                    <Video className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={closeMediaViewer}
              className="btn btn-circle btn-sm bg-black/50 border-0 text-white hover:bg-black/70"
              type="button"
              aria-label="Close media viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || "Community image"}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
