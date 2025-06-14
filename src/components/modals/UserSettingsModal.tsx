"use client";

import React, { useState } from "react";
import SettingsModal from "./SettingsModal";
import UserSettings from "@/components/settingcommponents/UserSettings";
import Password from "@/components/settingcommponents/Password";
import Payment from "@/components/settingcommponents/Payment";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export default function UserSettingsModal({
  isOpen,
  onClose,
  initialTab = "UserSettings",
}: UserSettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Reset to default tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Password":
        return <Password />;
      case "Payment":
        return <Payment />;
      case "UserSettings":
      default:
        return <UserSettings />;
    }
  };

  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Settings"
      maxWidth="max-w-5xl"
    >
      <div className="p-6">
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 flex overflow-x-auto">
          <button
            className={`tab ${activeTab === "UserSettings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("UserSettings")}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === "Password" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("Password")}
          >
            Password
          </button>
          <button
            className={`tab ${activeTab === "Payment" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("Payment")}
          >
            Payment
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </SettingsModal>
  );
}
