"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/components/Notification";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";

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
    <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
        <p className="text-base-content/70">Confirming your email address</p>
      </div>

      {verificationStatus === "loading" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <Loader2 size={64} className="animate-spin text-primary" />
            <Mail size={28} className="absolute text-primary/80" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Verifying your email</h2>
          <p className="text-base-content/70 text-center">
            Please wait while we confirm your email address...
          </p>
        </div>
      )}

      {verificationStatus === "success" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
          <p className="text-base-content/70 text-center mb-8">
            Your email has been successfully verified. You can now access all
            features of your account.
          </p>
          <Link
            href="/login"
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            Continue to Login <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {verificationStatus === "error" && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-6">
            <XCircle size={64} className="text-error" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
          <p className="text-base-content/70 text-center mb-8">
            {errorMessage ||
              "We couldn't verify your email. The link may have expired or is invalid."}
          </p>
          <div className="space-y-4 w-full">
            <Link
              href="/login"
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              Go to Login <ArrowRight size={16} />
            </Link>
            <Link href="/" className="btn btn-outline w-full">
              Return to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <Suspense
        fallback={
          <div className="bg-base-100 p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Email Verification</h1>
              <p className="text-base-content/70">Loading verification page</p>
            </div>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                <Loader2 size={64} className="animate-spin text-primary" />
              </div>
              <p className="text-base-content/70">Please wait...</p>
            </div>
          </div>
        }
      >
        <VerificationContent />
      </Suspense>
    </div>
  );
}
