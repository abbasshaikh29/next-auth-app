"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/components/Notification";

// Component that uses searchParams
function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { showNotification } = useNotification();

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setVerificationStatus("error");
      setErrorMessage("Verification token is missing");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus("success");
          showNotification("Email verified successfully!", "success");
        } else {
          setVerificationStatus("error");
          setErrorMessage(data.error || "Failed to verify email");
          showNotification(data.error || "Failed to verify email", "error");
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage("An error occurred during verification");
        showNotification("An error occurred during verification", "error");
      }
    };

    verifyEmail();
  }, [token, showNotification]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h1 className="text-2xl font-bold text-center mb-6">
        Email Verification
      </h1>

      {verificationStatus === "loading" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Verifying your email...</p>
        </div>
      )}

      {verificationStatus === "success" && (
        <div className="text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-semibold mb-4">
            Email Verified Successfully!
          </h2>
          <p className="mb-6">
            Your email has been verified. You can now log in to your account.
          </p>
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
          >
            Go to Login
          </Link>
        </div>
      )}

      {verificationStatus === "error" && (
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-xl font-semibold mb-4">Verification Failed</h2>
          <p className="text-red-500 mb-6">{errorMessage}</p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-center"
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 text-center"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-center mb-6">
              Email Verification
            </h1>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Loading verification page...</p>
            </div>
          </div>
        }
      >
        <VerificationContent />
      </Suspense>
    </div>
  );
}
