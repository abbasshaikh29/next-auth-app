"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import ProfileImageUpload from "@/components/ProfileImageUpload";

interface UserProfileData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
}

export default function UserProfileForm() {
  const { data: session, update: updateSession } = useSession();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  // No longer need uploadResponse state with the new ProfileImageUpload component
  const [formData, setFormData] = useState<UserProfileData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    bio: "",
    profileImage: "",
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/user/${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        setFormData({
          username: userData.user.username || "",
          email: userData.user.email || "",
          firstName: userData.user.firstName || "",
          lastName: userData.user.lastName || "",
          bio: userData.user.bio || "",
          profileImage: userData.user.profileImage || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotification("Failed to load user data", "error");
      }
    };

    fetchUserData();
  }, [session, showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      showNotification("You must be logged in to update your profile", "error");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting profile data:", formData);

      const response = await fetch(`/api/user/${session.user.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Profile update error:", errorData);
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);

      // Update the session to reflect the new profile image
      console.log(
        "Updating session with new profile image:",
        formData.profileImage
      );

      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          profileImage: formData.profileImage,
        },
      };

      console.log("New session data:", updatedSession);
      await updateSession(updatedSession);

      // Force a reload to ensure the session is updated everywhere
      window.location.reload();

      showNotification("Profile updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Profile Picture</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200">
              {formData.profileImage ? (
                <div
                  className="w-full h-full bg-center bg-cover"
                  style={{ backgroundImage: `url(${formData.profileImage})` }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-content">
                  <span className="text-3xl font-bold">
                    {formData.username
                      ? formData.username.charAt(0).toUpperCase()
                      : "?"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <ProfileImageUpload
                currentImage={formData.profileImage}
                onImageUpdated={(imageUrl) => {
                  setFormData((prev) => ({
                    ...prev,
                    profileImage: imageUrl,
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Your first name"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Your last name"
            />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Bio</span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="textarea textarea-bordered h-24"
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Username</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Your username"
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Username cannot be changed
            </span>
          </label>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Your email address"
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Email cannot be changed
            </span>
          </label>
        </div>

        <div className="form-control mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            className="btn btn-primary w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="btn btn-outline w-full sm:w-auto"
            onClick={async () => {
              try {
                showNotification("Refreshing session...", "info");
                await updateSession();
                showNotification("Session refreshed successfully", "success");
              } catch (error) {
                console.error("Error refreshing session:", error);
                showNotification("Failed to refresh session", "error");
              }
            }}
          >
            Refresh Session
          </button>
        </div>
      </form>
    </div>
  );
}
