"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait until session is loaded
    if (status === "loading") return;

    // Redirect to the user's profile page if logged in
    if (session?.user?.id) {
      router.replace(`/profile/${session.user.id}`);
    } else {
      // Redirect to login if not logged in
      router.replace("/auth/signin?callbackUrl=/profile");
    }
  }, [session, status, router]);

  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
