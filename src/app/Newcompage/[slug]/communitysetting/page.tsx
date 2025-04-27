"use client";
import CommunityNav from "@/components/communitynav/CommunityNav";
import CommunitySettings from "@/components/communitycommponets/CommunitySettingsForm";
import PaymentDisplay from "@/components/communitycommponets/PaymentDisplay";
import AdminPanelSettings from "@/components/communitycommponets/AdminPanelSettings";
import UserCommunitySettings from "@/components/communitycommponets/UserCommunitySettings";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
function CommunitySetting() {
  const searchParams = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const t = searchParams.get("t"); // Get the `t` query parameter

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is admin or sub-admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user) {
        try {
          setLoading(true);
          const res = await fetch(`/api/community/${slug}`);
          if (!res.ok) {
            throw new Error("Failed to fetch community data");
          }
          const data = await res.json();

          const userId = session.user.id;
          setIsAdmin(data.admin === userId);
          setIsSubAdmin(data.subAdmins?.includes(userId) || false);

          setLoading(false);
        } catch (error) {
          console.error("Error checking user role:", error);
          setLoading(false);
        }
      }
    };

    if (session?.user) {
      checkUserRole();
    }
  }, [session, slug]);

  return (
    <>
      <CommunityNav />
      <div className="container mx-auto max-w-6xl p-6 space-y-8">
        <div className="flex flex-row gap-8 mx-auto">
          <div className="flex flex-col mb-8 w-64 items-start bg-base-200 rounded-lg shadow-md overflow-hidden">
            {/* User Settings Link - Always visible */}
            <Link
              href="?t=UserSettings"
              className={
                "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 hover:bg-base-300 " +
                (t === "UserSettings" || (!t && !(isAdmin || isSubAdmin))
                  ? "bg-primary text-primary-content border-l-4 border-primary-focus"
                  : "")
              }
            >
              Your Settings
            </Link>

            {/* Admin/SubAdmin only links */}
            {isAdmin || isSubAdmin ? (
              <>
                <Link
                  href="?t=CommunitySettings"
                  className={
                    "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 hover:bg-base-300 " +
                    (t === "CommunitySettings" ||
                    (!t && (isAdmin || isSubAdmin))
                      ? "bg-primary text-primary-content border-l-4 border-primary-focus"
                      : "")
                  }
                >
                  Community Settings
                </Link>
                <Link
                  href="?t=payments"
                  className={
                    "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 hover:bg-base-300 " +
                    (t === "payments"
                      ? "bg-primary text-primary-content border-l-4 border-primary-focus"
                      : "")
                  }
                >
                  Payment
                </Link>
                {/* Admin only link */}
                {isAdmin && (
                  <Link
                    href="?t=AdminPanel"
                    className={
                      "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 hover:bg-base-300 " +
                      (t === "AdminPanel"
                        ? "bg-primary text-primary-content border-l-4 border-primary-focus"
                        : "")
                    }
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            ) : null}
          </div>

          <div className="p-6 rounded-lg w-3/4 bg-base-100 shadow-md">
            {loading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <>
                {t === "UserSettings" && <UserCommunitySettings />}
                {(isAdmin || isSubAdmin) && t === "CommunitySettings" && (
                  <CommunitySettings />
                )}
                {(isAdmin || isSubAdmin) && t === "payments" && (
                  <PaymentDisplay />
                )}
                {isAdmin && t === "AdminPanel" && <AdminPanelSettings />}
                {!t && <UserCommunitySettings />}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CommunitySetting;
