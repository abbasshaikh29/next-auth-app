"use client";
import CommunityNav from "@/components/communitynav/CommunityNav";
import CommunitySettings from "@/components/communitycommponets/CommunitySettingsForm";
import PaymentDisplay from "@/components/communitycommponets/PaymentDisplay";
import AdminPanelSettings from "@/components/communitycommponets/AdminPanelSettings";
import React from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
function CommunitySetting() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t"); // Get the \`t\` query parameter

  return (
    <React.Fragment>
      <CommunityNav />
      <div className="container mx-auto w-3/4 p-6 space-y-8 ">
        <div className=" flex flex-row gap-12  mx-auto">
          <div className=" flex flex-col h-60 mb-8 w-64 items-start ">
            <Link
              href="?t=CommunitySettings"
              className={
                " py-2 font-bold px-4 w-full rounded-md text-xl   " +
                (t === "CommunitySettings"
                  ? "bg-accent text-base-content hover:none"
                  : "")
              }
            >
              Settings
            </Link>
            <Link
              href="?t=payments"
              className={
                "  font-bold w-full text-xl py-2 px-4 rounded-md  " +
                (t === "payments" ? "bg-accent text-base-content" : "")
              }
            >
              Payment
            </Link>
            <Link
              href="?t=AdminPanel"
              className={
                "  font-bold w-full text-xl py-2 px-4 rounded-md  " +
                (t === "AdminPanel" ? "bg-accent text-base-content" : "")
              }
            >
              Admin Panel
            </Link>
          </div>
          <div className=" p-3 rounded-lg w-3/4">
            {t === "CommunitySettings" && <CommunitySettings />}
            {t === "payments" && <PaymentDisplay />}
            {t === "AdminPanel" && <AdminPanelSettings />}
            {!t && <CommunitySettings />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default CommunitySetting;
