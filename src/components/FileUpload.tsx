"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import S3FileUpload from "./S3FileUpload";

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
 * @deprecated Use S3FileUpload component directly instead
 */
export default function FileUpload({
  onSuccess,
  onProgress,
  fileType = "image",
  uploadType = "community-banner",
  entityId,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  // This component is now just a wrapper around S3FileUpload for backward compatibility
  const handleS3Success = (response: {
    url: string;
    key: string;
    fileName: string;
    fileType: string;
  }) => {
    // Convert S3 response to IKUploadResponse format for backward compatibility
    const ikResponse: IKUploadResponse = {
      url: response.url,
      fileId: response.key,
      name: response.fileName,
      fileType: response.fileType,
    };

    onSuccess(ikResponse);
  };

  return (
    <div className="space-y-2">
      <S3FileUpload
        onSuccess={handleS3Success}
        onProgress={onProgress}
        fileType={fileType}
        uploadType={uploadType}
        entityId={entityId}
      />

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
