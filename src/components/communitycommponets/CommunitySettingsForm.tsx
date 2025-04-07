"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useNotification } from "@/components/Notification";
import FileUpload from "../FileUpload";
import { Settings2Icon } from "lucide-react";
export default function CommunitySettings() {
  const { slug } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<IKUploadResponse | null>(
    null
  );

  const { showNotification } = useNotification();

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

    if (!uploadResponse) {
      alert("Please upload a banner image");
      setIsLoading(false);
      return;
    }

    console.log("Success", uploadResponse);
    const url = uploadResponse.filePath;
    try {
      const Response = await fetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          bannerImageurl: url,
        }),
      });

      if (!Response.ok) {
        throw new Error("Failed to update community");
      }
      alert("Settings updated successfully!");
      console.log(uploadResponse.filePath);
      fetchCommunity(); // Re-fetch community data after successful update
    } catch (error) {
      console.error("Error updating community:", error);
      alert("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUploadSuccess = (response: IKUploadResponse) => {
    console.log("Success", response);
    setUploadResponse(response);
    showNotification("Image uploaded successfully!", "success");
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      encType="multipart/form-data"
      className="form-control space-y-4"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Community Banner</h2>

        <FileUpload onSuccess={handleUploadSuccess} />
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
