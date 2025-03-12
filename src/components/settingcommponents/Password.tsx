"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";

export default function PasswordSettings() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      setSuccess("Password updated successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Failed to update password"
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Password Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label htmlFor="currentPassword" className="label">
            <span className="label-text">Current Password</span>
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="newPassword" className="label">
            <span className="label-text">New Password</span>
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
            minLength={8}
          />
        </div>
        <div className="form-control">
          <label htmlFor="confirmPassword" className="label">
            <span className="label-text">Confirm New Password</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && (
          <div className="text-green-500 text-sm mt-2">{success}</div>
        )}
        <button type="submit" className="btn btn-primary">
          Update Password
        </button>
      </form>
    </div>
  );
}
