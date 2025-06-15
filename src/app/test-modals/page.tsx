"use client";

import { useSettingsModal } from "@/components/modals/SettingsModalProvider";

export default function TestModalsPage() {
  const { openUserSettings, openCommunitySettings } = useSettingsModal();

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Modal Test Page</h1>
        
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">User Settings Modal</h2>
              <p>Test the user settings modal functionality</p>
              <div className="card-actions justify-end space-x-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => openUserSettings()}
                >
                  Open User Settings
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => openUserSettings("Password")}
                >
                  Open Password Tab
                </button>
                <button 
                  className="btn btn-accent"
                  onClick={() => openUserSettings("Payment")}
                >
                  Open Payment Tab
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Community Settings Modal</h2>
              <p>Test the community settings modal functionality</p>
              <div className="card-actions justify-end space-x-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => openCommunitySettings("test-community")}
                >
                  Open Community Settings
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => openCommunitySettings("test-community", "CommunitySettings")}
                >
                  Open Community Tab
                </button>
                <button
                  className="btn btn-accent"
                  onClick={() => openCommunitySettings("test-community", "Analytics")}
                >
                  Open Analytics Tab
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
