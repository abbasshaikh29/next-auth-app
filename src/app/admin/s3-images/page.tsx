"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface S3Image {
  key: string;
  url: string;
  lastModified?: string;
  size?: number;
}

export default function S3ImagesPage() {
  const [images, setImages] = useState<S3Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState("uploads");

  // Fetch images from the API
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/s3-images?folder=${encodeURIComponent(folder)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch images');
      }
      
      const data = await response.json();
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImages();
  }, []);

  // Handle folder change
  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFolder(e.target.value);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">S3 Image Browser</h1>
      
      <form onSubmit={handleSubmit} className="mb-6 flex gap-4 items-end">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Folder</span>
          </label>
          <select 
            className="select select-bordered w-full max-w-xs" 
            value={folder}
            onChange={handleFolderChange}
          >
            <option value="uploads">uploads</option>
            <option value="communities">communities</option>
            <option value="profiles">profiles</option>
            <option value="posts/images">posts/images</option>
            <option value="messages/images">messages/images</option>
            <option value="test">test</option>
            <option value="">Root (all files)</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Browse Images
        </button>
      </form>
      
      {error && (
        <div className="alert alert-error mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.key} className="card bg-base-100 shadow-md">
              <figure className="h-48 bg-gray-100">
                {image.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={image.url} 
                    alt={image.key} 
                    className="object-contain h-full w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-image.png";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-500">
                    Non-image file
                  </div>
                )}
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-sm truncate" title={image.key}>
                  {image.key.split('/').pop()}
                </h2>
                <p className="text-xs text-gray-500 truncate" title={image.key}>
                  {image.key}
                </p>
                {image.lastModified && (
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(image.lastModified).toLocaleString()}
                  </p>
                )}
                {image.size !== undefined && (
                  <p className="text-xs text-gray-500">
                    Size: {(image.size / 1024).toFixed(2)} KB
                  </p>
                )}
                <div className="card-actions justify-end mt-2">
                  <a 
                    href={image.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-base-200 rounded-lg">
          <p>No images found in the selected folder.</p>
        </div>
      )}
    </div>
  );
}
