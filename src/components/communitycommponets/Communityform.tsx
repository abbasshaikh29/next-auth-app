"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNotification } from "../Notification";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import mongoose from "mongoose";

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
  const { showNotification } = useNotification();

  const { data: session } = useSession();
  const router = useRouter();

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
        "How did you hear about us?",
      ],
    },
  });

  const handleUploadProgress = (progress: number) => {
    setCreateProgress(progress);
  };

  const onSubmit = async (data: CommunityFormData) => {
    if (!data.name) {
      showNotification("Please create community", "error");
      return;
    }

    setLoading(true);
    try {
      if (!session?.user?.id) {
        console.error("User ID not found in session");
        return;
      }
      const communityData = {
        ...data,
        createdAt: new Date(),
        createdBy: session.user.id,
        admin: session.user.id,
        members: [session.user.id],
        joinRequests: [],
      };
      const createdCommunity = await apiClient.createCommunity(communityData);
      showNotification("community created successfully!", "success");
      router.push(`/Newcompage/${createdCommunity.slug}`);
      setValue("name", "");
      setValue("description", "");
      setValue("createdAt", undefined);
      setCreateProgress(0);
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to create community",
        "error"
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row gap-20 items-center justify-center min-h-screen py-2 ">
      <div className="w-96 text-2xl font-bold  mb-4">
        <Link href={"/"}>SKOOL</Link>
        <h1>Everything you need to build community and make money online.</h1>
        <div className="flex flex-col items-start gap-3 mt-4">
          <div>🔒 Private & Secure</div>
          <div>📈 Highly engaged</div>
          <div>❤️ Simple to setup </div>
          <div> 🙂 Fun to use </div>
          <div>💰 Charge for membership</div>
          <div>📱 iOS + Android apps</div>
          <div>🌎 Millions of users daily</div>
        </div>
      </div>
      <div className="card w-full  max-w-md shadow-lg ">
        <div className="card-body border-2 border-gray-500 gap-6  p-12  shadow-xl bg-inherit rounded-md">
          <h1 className="text-2xl font-bold text-center">
            Create your Community
          </h1>
          <p className="text-xl text-center">
            {" "}
            Free for 14 days, then $99/month. Cancel anytime. All features.
            Unlimited everything. No hidden fees.{" "}
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
                  createing community...
                </>
              ) : (
                "Create community"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
