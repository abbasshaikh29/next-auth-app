"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useNotification } from "@/components/Notification";
import FileUpload from "../FileUpload";
import { Settings2Icon } from "lucide-react";
import { useSession } from "next-auth/react";

export default function CommunitySettings() {
  const { slug } = useParams();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<IKUploadResponse | null>(
    null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);

  const { showNotification } = useNotification();

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/community/${slug}`);
      const data = await res.json();
      setName(data.name);
      setDescription(data.description ?? "");
      setBannerImage(data.bannerImageurl || "");
      const userId = session?.user?.id;
      setIsAdmin(data.admin === userId);
      setIsSubAdmin(data.subAdmins?.includes(userId) || false);
    } catch (error) {
      console.error("Error fetching community:", error);
      showNotification("Failed to fetch community data", "error");
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [slug, session?.user?.id]);

  const handleUpdateSettings = async () => {
    if (!isAdmin && !isSubAdmin) {
      showNotification(
        "Only admins and sub-admins can update community settings",
        "error"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/${slug}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          bannerImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update community settings");
      }

      showNotification("Community settings updated successfully", "success");
    } catch (error) {
      showNotification("Failed to update community settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin && !isSubAdmin) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Community Settings</h2>
        <p className="text-error">
          Only community admins and sub-admins can access these settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Community Settings</h2>

      <div className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Community Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            title="Community Name"
            placeholder="Enter community name"
            className="input input-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            title="Community Description"
            placeholder="Enter community description"
            className="textarea textarea-bordered"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Banner Image</span>
          </label>
          <FileUpload
            onSuccess={(response) => {
              setUploadResponse(response);
              setBannerImage(response.url);
            }}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleUpdateSettings}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
