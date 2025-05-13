"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileImageDisplay from "./ProfileImageDisplay";
import styles from "./UserProfileForm.module.css";
import { CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react";

interface UserProfileData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage: string;
  emailVerified?: boolean;
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
    emailVerified: false,
  });

  const [resendingVerification, setResendingVerification] = useState(false);

  // Add validation state
  const [errors, setErrors] = useState({
    username: "",
    email: "",
  });

  // Add state to track if fields have been modified
  const [modified, setModified] = useState({
    username: false,
    email: false,
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
          emailVerified: userData.user.emailVerified || false,
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

    // Track modified fields for username and email
    if (name === "username" || name === "email") {
      setModified((prev) => ({ ...prev, [name]: true }));

      // Validate as user types
      validateField(name, value);
    }
  };

  // Validate individual fields
  const validateField = (name: string, value: string) => {
    let errorMessage = "";

    if (name === "username") {
      if (!value.trim()) {
        errorMessage = "Username is required";
      } else if (value.length < 3) {
        errorMessage = "Username must be at least 3 characters";
      } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        errorMessage =
          "Username can only contain letters, numbers, and underscores";
      }
    } else if (name === "email") {
      if (!value.trim()) {
        errorMessage = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessage = "Please enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    return !errorMessage; // Return true if valid, false if invalid
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      showNotification("Email address is required", "error");
      return;
    }

    setResendingVerification(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(
          "Verification email sent. Please check your inbox.",
          "success"
        );
      } else {
        showNotification(
          data.error || "Failed to send verification email",
          "error"
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      showNotification("An error occurred. Please try again later.", "error");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      showNotification("You must be logged in to update your profile", "error");
      return;
    }

    // Validate all fields before submission
    const isUsernameValid = validateField("username", formData.username);
    const isEmailValid = validateField("email", formData.email);

    // Check if username or email has been modified and is invalid
    if (
      (modified.username && !isUsernameValid) ||
      (modified.email && !isEmailValid)
    ) {
      showNotification("Please fix the errors before submitting", "error");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Submitting profile data:", formData);

      // First, update username and email if they've been modified
      if (modified.username || modified.email) {
        const settingsResponse = await fetch(`/api/user/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            bio: formData.bio,
            profileImageUrl: formData.profileImage,
          }),
        });

        if (!settingsResponse.ok) {
          const errorData = await settingsResponse.json();
          console.error("Settings update error:", errorData);

          // Handle specific errors
          if (settingsResponse.status === 409) {
            setErrors((prev) => ({
              ...prev,
              username: "Username already taken",
            }));
            throw new Error("Username already taken");
          } else {
            throw new Error("Failed to update username and email");
          }
        }

        // Reset modified flags after successful update
        setModified({ username: false, email: false });
      }

      // Then update other profile fields
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

      // Update the session to reflect the changes
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          profileImage: formData.profileImage,
          username: formData.username,
          email: formData.email,
        },
      };

      console.log("New session data:", updatedSession);
      await updateSession(updatedSession);

      // Force a reload to ensure the session is updated everywhere
      window.location.reload();

      showNotification("Profile updated successfully", "success");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showNotification(error.message || "Failed to update profile", "error");
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
            <ProfileImageDisplay
              imageUrl={formData.profileImage}
              username={formData.username}
              size="md"
            />

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
            className={`input input-bordered w-full ${
              errors.username ? "input-error" : ""
            }`}
            placeholder="Your username"
          />
          {errors.username && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.username}
              </span>
            </label>
          )}
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Choose a unique username with letters, numbers, and underscores
              only
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
            className={`input input-bordered w-full ${
              errors.email ? "input-error" : ""
            }`}
            placeholder="Your email address"
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Make sure to use a valid email address you can access
            </span>
          </label>

          {/* Email Verification Status */}
          <div className="mt-2 p-3 rounded-lg border border-base-300 bg-base-200">
            <div className="flex items-center gap-2">
              {formData.emailVerified ? (
                <>
                  <CheckCircle className="text-success w-5 h-5" />
                  <span className="font-medium">Email verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-warning w-5 h-5" />
                  <span className="font-medium">Email not verified</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline btn-warning ml-auto"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                  >
                    {resendingVerification ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Mail className="w-4 h-4 mr-1" />
                    )}
                    {resendingVerification
                      ? "Sending..."
                      : "Resend Verification"}
                  </button>
                </>
              )}
            </div>
            {!formData.emailVerified && (
              <p className="text-sm mt-2 text-gray-500">
                Please verify your email address to ensure account security and
                receive important notifications.
              </p>
            )}
          </div>
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
