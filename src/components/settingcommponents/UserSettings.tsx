"use client";

import React from "react";
import UserProfileForm from "./UserProfileForm";

export default function UserSettings() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UserProfileForm />
      </div>
    </div>
  );
}
