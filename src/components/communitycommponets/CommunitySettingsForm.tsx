"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IKUpload } from "imagekitio-next";

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

  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let bannerUrl = bannerImage;

      // Upload new banner if selected
      if (newBannerFile) {
        const formData = new FormData();
        formData.append("file", newBannerFile);
        formData.append("fileType", newBannerFile.type.split("/")[0]);
        formData.append("fileName", newBannerFile.name);

        const uploadResponse = await fetch("/api/imagekit", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        const { url } = await uploadResponse.json();
        bannerUrl = url;
      }

      const response = await fetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          bannerImage: bannerUrl,
        }),
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

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      console.log("Starting image upload for file:", file.name);

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      // Send to your API endpoint
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Upload failed:", data);
        throw new Error(data.message || "Failed to upload image");
      }

      console.log("Upload successful:", data);
      return data.url; // Return the URL from ImageKit
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="form-control space-y-4"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Community Banner</h2>
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded w-full"
          aria-label="Community banner image upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setNewBannerFile(file);
              setBannerImage(URL.createObjectURL(file)); // Show preview
            }
          }}
        />
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
