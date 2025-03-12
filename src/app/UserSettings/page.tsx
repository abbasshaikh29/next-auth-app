"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UserSettings from "@/components/settingcommponents/UserSettings";
import Password from "@/components/settingcommponents/Password";
import Theme from "@/components/settingcommponents/Theme";
import Payment from "@/components/settingcommponents/Payment";

export default function Settings() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t"); // Get the `t` query parameter

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-box shadow-lg">
      <h1 className="text-3xl font-bold mb-6">UserSettings</h1>
      <div className="tabs tabs-boxed mb-8">
        <Link
          href="/communitySettings?t=UserSettings"
          className={`tab ${t === "UserSettings" ? "tab-active" : ""}`}
        >
          Profile
        </Link>
        <Link
          href="/communitySettings?t=Password"
          className={`tab ${t === "Password" ? "tab-active" : ""}`}
        >
          Password
        </Link>
        <Link
          href="/communitySettings?t=Theme"
          className={`tab ${t === "Theme" ? "tab-active" : ""}`}
        >
          Theme
        </Link>
        <Link
          href="/communitySettings?t=Payment"
          className={`tab ${t === "Payment" ? "tab-active" : ""}`}
        >
          Payment
        </Link>
      </div>
      <div className="space-y-6">
        {t === "UserSettings" && <UserSettings />}
        {t === "Password" && <Password />}
        {t === "Theme" && <Theme />}
        {t === "Payment" && <Payment />}
        {!t && <UserSettings />}
      </div>
    </div>
  );
}
