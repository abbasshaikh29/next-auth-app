"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { useNotification } from "@/components/Notification";
import FileUpload from "../FileUpload";
import { Settings2Icon, UserPlus, UserMinus } from "lucide-react";
import { useSession } from "next-auth/react";

interface Member {
  id: string;
  username: string;
  isSubAdmin: boolean;
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newSubAdminId, setNewSubAdminId] = useState("");

  const { showNotification } = useNotification();

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/community/${slug}`);
      const data = await res.json();
      setName(data.name);
      setDescription(data.description ?? "");
      setIsAdmin(data.admin === session?.user?.id);

      // Fetch members with their usernames
      const membersWithUsernames = await Promise.all(
        data.members.map(async (memberId: string) => {
          const userRes = await fetch(`/api/user/${memberId}`);
          const userData = await userRes.json();
          return {
            id: memberId,
            username: userData.username,
            isSubAdmin: data.subAdmins?.includes(memberId) || false,
          };
        })
      );
      setMembers(membersWithUsernames);
    } catch (error) {
      console.error("Error fetching community:", error);
      showNotification("Failed to fetch community data", "error");
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [slug, session?.user?.id]);

  const handleUpdateSettings = async () => {
    if (!isAdmin) {
      showNotification("Only admins can update community settings", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/${slug}`, {
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

  const handleAddSubAdmin = async (memberId: string) => {
    if (!isAdmin) {
      showNotification("Only admins can add sub-admins", "error");
      return;
    }

    try {
      const response = await fetch(`/api/community/${slug}/subadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add sub-admin");
      }

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, isSubAdmin: true } : member
        )
      );
      showNotification("Sub-admin added successfully", "success");
    } catch (error) {
      showNotification("Failed to add sub-admin", "error");
    }
  };

  const handleRemoveSubAdmin = async (memberId: string) => {
    if (!isAdmin) {
      showNotification("Only admins can remove sub-admins", "error");
      return;
    }

    try {
      const response = await fetch(`/api/community/${slug}/subadmin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove sub-admin");
      }

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, isSubAdmin: false } : member
        )
      );
      showNotification("Sub-admin removed successfully", "success");
    } catch (error) {
      showNotification("Failed to remove sub-admin", "error");
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Community Settings</h2>
        <p className="text-error">
          Only community admins can access these settings.
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

        <div className="divider">Sub-Admin Management</div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Members</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.username}</td>
                    <td>
                      {member.id === session?.user?.id
                        ? "Admin"
                        : member.isSubAdmin
                        ? "Sub-Admin"
                        : "Member"}
                    </td>
                    <td>
                      {member.id !== session?.user?.id && (
                        <div className="flex gap-2">
                          {!member.isSubAdmin ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAddSubAdmin(member.id)}
                            >
                              <UserPlus className="w-4 h-4" />
                              Make Sub-Admin
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => handleRemoveSubAdmin(member.id)}
                            >
                              <UserMinus className="w-4 h-4" />
                              Remove Sub-Admin
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
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
