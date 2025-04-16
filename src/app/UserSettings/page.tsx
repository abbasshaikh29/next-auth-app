"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UserSettings from "@/components/settingcommponents/UserSettings";
import Password from "@/components/settingcommponents/Password";
import Payment from "@/components/settingcommponents/Payment";
import Header from "@/components/Header";

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
    <div className="container mx-auto mt-2 sm:mt-3 px-4 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-8">
      <div className="tabs tabs-boxed mb-4 sm:mb-8 mt-2 sm:mt-4 flex overflow-x-auto">
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
    </div>
  );
}

export default function Settings() {
  return (
    <div className="bg-base-100 rounded-box shadow-lg min-h-screen">
      <Header />
      <Suspense
        fallback={
          <div className="tabs tabs-boxed mb-4 sm:mb-8 px-4">
            Loading tabs...
          </div>
        }
      >
        <SettingsTabs />
      </Suspense>
      <div className="px-4 sm:px-6 md:px-8 pb-8">
        <Suspense fallback={<div className="p-4">Loading settings...</div>}>
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
