"use client";

import { useRouter } from "next/router";
import Link from "next/link";
import ProfileSettings from "@/components/settingcommponents/ProfileSettings";

import AccountSettings from "@/components/settingcommponents/AccountSettings";

export default function Settings() {
  const router = useRouter();
  const { t } = router.query; // Get the `t` query parameter

  return (
    <div>
      <h1>Settings</h1>
      <nav>
        <Link href="/settings?t=profile">Profile</Link> |
        <Link href="/settings?t=account">Account</Link>
      </nav>
      <div>
        {t === "profile" && <ProfileSettings />}
        {t === "account" && <AccountSettings />}
        {!t && <p>Please select a settings section.</p>}
      </div>
    </div>
  );
}
