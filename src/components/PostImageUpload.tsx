"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import S3FileUpload from "./S3FileUpload";
import { ImageIcon, X } from "lucide-react";

interface PostImageUploadProps {
  communityId?: string;
  onImageUploaded: (imageUrl: string) => void;
}

export default function PostImageUpload({
  communityId,
  onImageUploaded,
}: PostImageUploadProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const { showNotification } = useNotification();

  const handleImageUploadSuccess = async (response: any) => {
    if (!response.url) {
      showNotification("Failed to get image URL from upload", "error");
      return;
    }

    // Call the callback with the image URL
    onImageUploaded(response.url);
    showNotification("Image uploaded successfully", "success");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Add Image</span>
      </div>
      
      <S3FileUpload
        onSuccess={handleImageUploadSuccess}
        fileType="image"
        uploadType="post-image"
        entityId={communityId}
      />
      
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP. Maximum size: 5MB.
      </p>
    </div>
  );
}
