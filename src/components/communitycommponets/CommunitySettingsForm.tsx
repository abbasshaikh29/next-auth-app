"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IKContext, IKUpload } from "imagekitio-react";

export default function CommunitySettings() {
  const { slug } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchCommunity = async () => {
    const res = await fetch(`/api/community/${slug}`);
    const data = await res.json();
    setName(data.name);
    setDescription(data.description ?? "");
  };

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }
      alert("Settings updated successfully!");
      fetchCommunity(); // Re-fetch community data after successful update
    } catch (error) {
      console.error("Error updating community:", error);
      alert("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-control space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Community Banner</h2>
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded w-full"
          aria-label="Community banner image upload"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              // Get signed URL from our API
              const res = await fetch(
                `/api/upload?filename=${encodeURIComponent(
                  file.name
                )}&filetype=${encodeURIComponent(file.type)}`
              );
              const { url } = await res.json();

              // Upload directly to S3
              await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
              });

              // Get public URL
              const publicUrl = url.split("?")[0];
              setBannerImage(publicUrl);
            } catch (err) {
              console.error("Upload failed:", err);
              alert("File upload failed");
            }
          }}
        />
        {bannerImage && (
          <div className="mt-2">
            <span className="text-sm">Current banner:</span>
            <img
              src={bannerImage}
              alt="Community banner"
              className="mt-1 max-h-32 object-cover"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="communityName" className="label-text">
          Community Name
        </label>
        <input
          id="communityName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
          required
          aria-label="Community name"
        />
      </div>

      <div>
        <label htmlFor="communityDescription" className="label-text">
          Description
        </label>
        <textarea
          id="communityDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full h-32"
          aria-label="Community description"
          placeholder="Enter community description"
        />
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary">
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
