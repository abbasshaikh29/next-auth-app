"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNotification } from "../Notification";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import mongoose from "mongoose";
import CaptchaVerificationWrapper from "../captcha/CaptchaVerificationWrapper";
import { useCaptcha } from "@/contexts/CaptchaContext";

interface CommunityFormData {
  name: string;
  slug?: string;
  description?: string;
  createdBy: string;
  createdAt?: Date;
  admin: string;
  adminQuestions: string[];
  joinRequests?: any[];
}

export default function CommunityCreateForm() {
  const [loading, setLoading] = useState(false);
  const [CreateProgress, setCreateProgress] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData | null>(null);
  const { showNotification } = useNotification();
  const { isCaptchaVerified, setIsCaptchaVerified } = useCaptcha();

  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Move useForm hook before any conditional returns
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CommunityFormData>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      createdBy: "",
      adminQuestions: [
        "Why do you want to join this community?",
        "What can you contribute to this community?",
      ],
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = window ? encodeURIComponent(window.location.pathname) : '';
      router.push(`/api/auth/signin${callbackUrl ? `?callbackUrl=${callbackUrl}` : ''}`);
    }
  }, [status, router]);

  // Show loading state while checking session
  if (status === 'loading' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // useForm hook moved to the top of the component

  const handleUploadProgress = (progress: number) => {
    setCreateProgress(progress);
  };

  const onSubmit = async (data: CommunityFormData) => {
    try {
      // Double-check session
      if (!session?.user?.id) {
        throw new Error('No active session found');
      }

      if (!data.name?.trim()) {
        showNotification("Please enter a community name", "error");
        return;
      }

      // Store form data with user info and show CAPTCHA
      setFormData({
        ...data,
        name: data.name.trim(),
        description: data.description?.trim(),
        createdBy: session.user.id,
        admin: session.user.id,
        adminQuestions: [
          "Why do you want to join this community?",
          "What can you contribute to this community?",
          "How did you hear about us?",
        ],
      });
      setShowCaptcha(true);
    } catch (error) {
      console.error('Error in form submission:', error);
      showNotification("An error occurred. Please try again.", "error");
      if (!session?.user?.id) {
        const callbackUrl = window ? encodeURIComponent(window.location.pathname) : '';
        router.push(`/api/auth/signin${callbackUrl ? `?callbackUrl=${callbackUrl}` : ''}`);
      }
    }
  };

  const handleCaptchaComplete = async (captchaFormData: CommunityFormData | null = formData) => {
    setLoading(true);
    
    try {
      console.log('handleCaptchaComplete called with:', { captchaFormData, formData, session });
      
      // Ensure we have all required data
      if (!session?.user?.id) {
        throw new Error('No active user session found');
      }
      
      const dataToUse = captchaFormData || formData;
      if (!dataToUse) {
        throw new Error('Form data is missing');
      }
      
      // Validate required fields
      if (!dataToUse.name?.trim()) {
        throw new Error('Community name is required');
      }
      
      if (!dataToUse.description?.trim()) {
        throw new Error('Community description is required');
      }

      // If we get here, all validations passed
      try {
      const communityData = {
        ...dataToUse,
        createdAt: new Date(),
        createdBy: session.user.id,
        admin: session.user.id,
        members: [session.user.id],
        joinRequests: [],
      };

          const createdCommunity = await apiClient.createCommunity(communityData);
          showNotification("Community created successfully! Redirecting to billing...", "success");
          router.push(`/billing/${createdCommunity.slug}`);

          // Reset form
          setValue("name", "");
          setValue("description", "");
          setValue("createdAt", undefined);
          setCreateProgress(0);
          setShowCaptcha(false);
          setFormData(null);
          setIsCaptchaVerified(false);
        } catch (error) {
          console.error('Error creating community:', error);
          showNotification(
            error instanceof Error ? error.message : "Failed to create community",
            "error"
          );
        }
      } catch (error) {
        console.error('Error in CAPTCHA verification:', error);
        showNotification(
          error instanceof Error ? error.message : "Verification failed. Please try again.",
          "error"
        );
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-center justify-center min-h-screen py-4 px-4 sm:px-6">
      <div className="w-full lg:w-96 text-xl sm:text-2xl font-bold mb-4 max-w-md">
        <Link href={"/"}>SKOOL</Link>
        <h1 className="text-lg sm:text-2xl mt-2">
          Everything you need to build community and make money online.
        </h1>
        <div className="flex flex-col items-start gap-2 sm:gap-3 mt-3 sm:mt-4 text-base sm:text-lg">
          <div>🔒 Private & Secure</div>
          <div>📈 Highly engaged</div>
          <div>❤️ Simple to setup </div>
          <div>🙂 Fun to use </div>
          <div>💰 Charge for membership</div>
          <div>📱 iOS + Android apps</div>
          <div>🌎 Millions of users daily</div>
        </div>
      </div>

      {showCaptcha ? (
        <div className="card w-full max-w-md shadow-lg">
          <CaptchaVerificationWrapper
            onVerificationComplete={handleCaptchaComplete}
            formData={formData || undefined}
            title="Human Verification Required"
            description="Please verify that you are human before creating a community"
          >
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">Verification Complete!</h2>
              <p className="mb-4">Creating your community...</p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>
          </CaptchaVerificationWrapper>
        </div>
      ) : (
        <div className="card w-full max-w-md shadow-lg">
          <div className="card-body border-2 border-gray-500 gap-4 sm:gap-6 p-6 sm:p-8 md:p-12 shadow-xl bg-inherit rounded-md">
            <h1 className="text-xl sm:text-2xl font-bold text-center">
              Create your Community
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-center">
              Free for 14 days, then $39/month. Cancel anytime. All features.
              Unlimited everything. No hidden fees.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <input
                  placeholder="Community name"
                  type="text"
                  className={`input input-bordered ${
                    errors.name ? "input-error" : ""
                  }`}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <span className="text-error text-sm mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <textarea
                  placeholder="Community Description"
                  className={`textarea textarea-bordered h-38 ${
                    errors.description ? "textarea-error" : ""
                  }`}
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <span className="text-error text-sm mt-1">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating community...
                  </>
                ) : (
                  "Create community"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
