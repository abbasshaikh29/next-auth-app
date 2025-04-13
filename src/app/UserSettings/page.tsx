"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UserSettings from "@/components/settingcommponents/UserSettings";
import Password from "@/components/settingcommponents/Password";
import Payment from "@/components/settingcommponents/Payment";

// Loading component for Suspense
function SettingsContent() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t"); // Get the `t` query parameter

  return (
    <div className="space-y-6">
      {t === "Password" && <Password />}
      {t === "Payment" && <Payment />}
      {(t === "UserSettings" || !t) && <UserSettings />}
    </div>
  );
}

// Tabs component that doesn't depend on searchParams
function SettingsTabs() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t"); // Get the `t` query parameter

  return (
    <div className="tabs tabs-boxed mb-8">
      <Link
        href="/UserSettings"
        as="/UserSettings"
        className={`tab ${t === "UserSettings" || !t ? "tab-active" : ""}`}
      >
        Profile
      </Link>
      <Link
        href="?t=Password"
        className={`tab ${t === "Password" ? "tab-active" : ""}`}
      >
        Password
      </Link>

      <Link
        href="?t=Payment"
        className={`tab ${t === "Payment" ? "tab-active" : ""}`}
      >
        Payment
      </Link>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-box shadow-lg">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>
      <Suspense
        fallback={<div className="tabs tabs-boxed mb-8">Loading tabs...</div>}
      >
        <SettingsTabs />
      </Suspense>
      <Suspense fallback={<div className="p-4">Loading settings...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
