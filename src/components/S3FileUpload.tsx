"use client";

import { useState, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import { convertS3UrlToR2, isS3Url } from "@/utils/s3-to-r2-migration";

interface S3FileUploadProps {
  onSuccess: (response: {
    url: string;
    key: string;
    fileName: string;
    fileType: string;
  }) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video" | "document";
  uploadType?:
    | "profile"
    | "community"
    | "community-banner"
    | "community-icon"
    | "community-about-media"
    | "course"
    | "thumbnail"
    | "post-image"
    | "message-image";
  entityId?: string; // Community ID, course ID, etc.
}

/**
 * S3FileUpload component that actually uses R2 storage
 * This is a wrapper around the R2 upload functionality for backward compatibility
 */
export default function S3FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
  uploadType = "community-banner",
  entityId,
}: S3FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!validateFile(file)) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Step 1: Get a presigned URL from our API
      const response = await fetch("/api/upload/r2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          type: uploadType,
          communityId: entityId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, key, fileUrl } = await response.json();

      // Step 2: Upload the file directly to R2 using the presigned URL
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
          if (onProgress) {
            onProgress(percentComplete);
          }
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("R2 upload successful:", fileUrl);
          setUploading(false);
          // Call the success callback with the file URL and metadata
          onSuccess({
            url: fileUrl,
            key,
            fileName: file.name,
            fileType: file.type,
          });

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          console.error(
            "R2 upload failed with status:",
            xhr.status,
            xhr.statusText
          );
          console.error("Response:", xhr.responseText);
          setUploading(false);
          setError(`Upload failed: ${xhr.statusText || xhr.status}`);
        }
      };

      // Handle errors
      xhr.onerror = () => {
        console.error("R2 upload request failed");
        setUploading(false);
        setError("Upload failed: Network error");
      };

      // Send the file
      xhr.send(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
      setError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during upload"
      );
    }
  };

  const validateFile = (file: File): boolean => {
    // Different size limits based on file type
    let maxSize = 5 * 1024 * 1024; // Default 5MB limit

    // For videos, allow larger files (100MB for 10-minute videos)
    if (fileType === "video") {
      maxSize = 100 * 1024 * 1024; // 100MB
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(
        `File size exceeds ${maxSizeMB}MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      );
      return false;
    }

    // Validate file type
    if (fileType === "image") {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, GIF, and WebP images are allowed");
        return false;
      }
    } else if (fileType === "video") {
      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only MP4, WebM, and OGG videos are allowed");
        return false;
      }
    }

    return true;
  };

  return (
    <div className="w-full">
      {error && (
        <div className="text-error text-sm mb-2 p-2 bg-error/10 rounded">
          {error}
        </div>
      )}

      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-base-100 border-base-300 hover:bg-base-200 transition-colors duration-200">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-sm text-base-content">
                Uploading... {progress}%
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-base-content mb-2" />
              <p className="text-sm text-base-content">
                <span className="font-medium">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-base-content/70">
                {fileType === "image"
                  ? "JPG, PNG, GIF, WebP (max 5MB)"
                  : fileType === "video"
                    ? "MP4, WebM, OGG (max 100MB, 10 min)"
                    : "Max 5MB"}
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={
            fileType === "image"
              ? "image/jpeg,image/png,image/gif,image/webp"
              : fileType === "video"
                ? "video/mp4,video/webm,video/ogg"
                : undefined
          }
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-base-300 rounded-full h-1.5 mt-2">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
