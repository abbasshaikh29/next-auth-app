"use client";

import React from "react";
import UserProfileForm from "./UserProfileForm";

export default function UserSettings() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-6">
            <UserProfileForm />
          </div>
      </div>
    </div>
  );
}
