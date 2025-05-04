"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotification } from "@/components/Notification";
import CommunityNav from "@/components/communitynav/CommunityNav";
import { Calendar } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  releaseDate?: string;
}

export default function CreateModule() {
  const { slug, courseId } = useParams<{ slug: string; courseId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [course, setCourse] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    releaseDate: "",
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        if (!courseId) return;

        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data = await response.json();
        setCourse(data.course);

        // Check if user is admin or creator
        if (session?.user?.id) {
          const communityResponse = await fetch(`/api/community/${slug}`);
          if (communityResponse.ok) {
            const communityData = await communityResponse.json();
            const isUserAdmin = communityData.admin === session.user.id;
            const isUserSubAdmin = communityData.subAdmins?.includes(
              session.user.id
            );
            const isCreator = data.course.createdBy === session.user.id;

            const hasPermission = isUserAdmin || isUserSubAdmin || isCreator;
            setIsAdmin(hasPermission);

            if (!hasPermission) {
              showNotification(
                "You don't have permission to create modules",
                "error"
              );
              router.push(`/Newcompage/${slug}/Courses/${courseId}`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        showNotification("Failed to load course details", "error");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && session) {
      fetchCourseDetails();
    }
  }, [courseId, slug, session, router, showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showNotification("Module title is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          courseId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create module");
      }

      const newModule = await response.json();

      showNotification("Module created successfully", "success");
      router.push(`/Newcompage/${slug}/Courses/${courseId}`);
    } catch (error) {
      console.error("Error creating module:", error);
      showNotification("Failed to create module", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <CommunityNav />
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <CommunityNav />
        <div className="alert alert-error max-w-md mx-auto m-4">
          <span>You don't have permission to create modules</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CommunityNav />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Add Module to {course?.title}</h1>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              router.push(`/Newcompage/${slug}/Courses/${courseId}`)
            }
          >
            Cancel
          </button>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Module Title*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter module title"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter module description"
                  className="textarea textarea-bordered h-24"
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">
                    Release Date (Optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-10"
                  />
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt">
                    If set, the module will be automatically published on this
                    date
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    router.push(`/Newcompage/${slug}/Courses/${courseId}`)
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !formData.title.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Module</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
