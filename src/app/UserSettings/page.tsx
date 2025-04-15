"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UserSettings from "@/components/settingcommponents/UserSettings";
import Password from "@/components/settingcommponents/Password";
import Payment from "@/components/settingcommponents/Payment";
import Header from "@/components/Header";
import CommunityNav from "@/components/communitynav/CommunityNav";

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
    <div className="container mx-auto mt-3 p-6 space-y-8 ">
      <div className="tabs tabs-boxed mb-8 mt-4">
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
    <div className="  bg-base-100 rounded-box shadow-lg">
      <Header />
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
