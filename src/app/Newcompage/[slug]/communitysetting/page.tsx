"use client";
import CommunityNav from "@/components/communitynav/CommunityNav";
import CommunitySettings from "@/components/communitycommponets/CommunitySettingsForm";
import PaymentDisplay from "@/components/communitycommponets/PaymentDisplay";
import React from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
function CommunitySetting() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t"); // Get the \`t\` query parameter

  return (
    <React.Fragment>
      <div className="container mx-auto w-3/4 p-6 space-y-8 ">
        <CommunityNav />
        <div className=" flex flex-row gap-12 p-4   mx-auto">
          <div className="tabs flex flex-col gap-5 p-4  h-60 tabs-boxed mb-8 ">
            <Link
              href="?t=CommunitySettings"
              className={
                "tab text-2xl " +
                (t === "CommunitySettings" ? "tab-active" : "")
              }
            >
              Settings
            </Link>
            <Link
              href="?t=payments"
              className={
                "tab text-2xl " + (t === "payments" ? "tab-active" : "")
              }
            >
              Payment
            </Link>
          </div>
          <div className=" p-3  rounded-lg w-3/4">
            {t === "CommunitySettings" && <CommunitySettings />}
            {t === "payments" && <PaymentDisplay />}
            {!t && <CommunitySettings />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default CommunitySetting;
