"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import R2FileUpload from "./R2FileUpload";

// For backward compatibility
interface IKUploadResponse {
  url: string;
  fileId: string;
  name: string;
  filePath?: string;
  fileType?: string;
}

interface FileUploadProps {
  onSuccess: (res: IKUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
  uploadType?:
    | "profile"
    | "community"
    | "community-banner"
    | "community-icon"
    | "course"
    | "thumbnail"
    | "post-image";
  entityId?: string;
}

/**
 * File upload component using Cloudflare R2
 */
export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
  uploadType = "community-banner",
  entityId,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  // This component now uses R2FileUpload
  const handleR2Success = (response: {
    url: string;
    key: string;
    fileName: string;
    fileType: string;
  }) => {
    // Convert R2 response to the expected format
    const uploadResponse: IKUploadResponse = {
      url: response.url,
      fileId: response.key,
      name: response.fileName,
      fileType: response.fileType,
    };

    onSuccess(uploadResponse);
  };

  return (
    <div className="space-y-2">
      <R2FileUpload
        onSuccess={handleR2Success}
        onProgress={onProgress}
        fileType={fileType}
        uploadType={uploadType}
        entityId={entityId}
      />

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
