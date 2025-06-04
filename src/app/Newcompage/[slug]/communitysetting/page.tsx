"use client";
import CommunityNav from "@/components/communitynav/CommunityNav";
import CommunitySettingsForm from "@/components/communitycommponets/CommunitySettingsForm";
import AdminPanelSettingsComponent from "@/components/communitycommponets/AdminPanelSettings";
import UserCommunitySettingsComponent from "@/components/communitycommponets/UserCommunitySettings";
import CommunityAboutMediaManagerComponent from "@/components/communitycommponets/CommunityAboutMediaManager";
import CommunityAccessSettingsComponent from "@/components/communitycommponets/CommunityAccessSettings";
import CommunityBillingInfoComponent from "@/components/communitycommponets/CommunityBillingInfo";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

const UserCommunitySettings = dynamic(() => import('@/components/communitycommponets/UserCommunitySettings'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});
const CommunitySettings = dynamic(() => import('@/components/communitycommponets/CommunitySettingsForm'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});
const CommunityAboutMediaManager = dynamic(() => import('@/components/communitycommponets/CommunityAboutMediaManager'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});
const CommunityAccessSettings = dynamic(() => import('@/components/communitycommponets/CommunityAccessSettings'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});
const CommunityBillingInfo = dynamic(() => import('@/components/communitycommponets/CommunityBillingInfo'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});
const AdminPanelSettings = dynamic(() => import('@/components/communitycommponets/AdminPanelSettings'), {
  loading: () => <div className="flex justify-center items-center min-h-[200px]"><span className="loading loading-spinner loading-md"></span></div>,
});

import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
function CommunitySettingPage() {
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
      <div className="container  mx-auto max-w-6xl m-6 p-6 space-y-8">
        <div className="flex flex-row gap-8 mt-6 ">
          <div className="flex flex-col mb-8 w-64 items-start rounded-lg  overflow-hidden">
            {/* User Settings Link - Always visible */}
            <Link
              href="?t=UserSettings"
              className={
                "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200  rounded-lg hover:bg-base-100 " +
                (t === "UserSettings" || (!t && !(isAdmin || isSubAdmin))
                  ? "bg-primary text-primary-content "
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
                    "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg hover:bg-base-100 " +
                    (t === "CommunitySettings" ||
                    (!t && (isAdmin || isSubAdmin))
                      ? "bg-primary text-primary-content "
                      : "")
                  }
                >
                  Community Settings
                </Link>
                <Link
                  href="?t=AboutMedia"
                  className={
                    "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg hover:bg-base-100 " +
                    (t === "AboutMedia" 
                      ? "bg-primary text-primary-content "
                      : "")
                  }
                >
                  About Media
                </Link>
                <Link
                  href={`/community/${slug}/payment-settings`}
                  className="py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg hover:bg-base-100"
                >
                  Payment Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="?t=AccessSettings"
                    className={
                      "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg hover:bg-base-100 " +
                      (t === "AccessSettings"
                        ? "bg-primary text-primary-content "
                        : "")
                    }
                  >
                    Access & Pricing
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="?t=Billing"
                    className={
                      "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg hover:bg-base-100 " +
                      (t === "Billing"
                        ? "bg-primary text-primary-content "
                        : "")
                    }
                  >
                    Billing & Trial
                  </Link>
                )}
                {/* Admin only link */}
                {isAdmin && (
                  <Link
                    href="?t=AdminPanel"
                    className={
                      "py-3 font-semibold px-6 w-full text-lg transition-colors duration-200 rounded-lg   hover:bg-base-100 " +
                      (t === "AdminPanel"
                        ? "bg-primary text-primary-content "
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
                {(isAdmin || isSubAdmin) && t === "AboutMedia" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">
                      About Page Media
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage images and videos that appear on your community's
                      about page. These media items will be displayed in a
                      gallery format to showcase your community.
                    </p>
                    <CommunityAboutMediaManager />
                  </div>
                )}
                {/* Access & Pricing settings */}
                {isAdmin && t === "AccessSettings" && (
                  <CommunityAccessSettings />
                )}
                {/* Billing & Trial information */}
                {isAdmin && t === "Billing" && (
                  <CommunityBillingInfo />
                )}
                {/* Payment settings moved to dedicated page */}
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

export default CommunitySettingPage;
