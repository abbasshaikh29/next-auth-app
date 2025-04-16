"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import CommunityAdminPanel from "../CommunityAdminPanel";
import { useNotification } from "@/components/Notification";
import { UserPlus, UserMinus, Plus, Minus, Save } from "lucide-react";

interface Member {
  id: string;
  username: string;
  isSubAdmin: boolean;
}

export default function AdminPanelSettings() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const [communityId, setCommunityId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const { showNotification } = useNotification();

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/community/${slug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch community data");
      }

      const data = await res.json();
      setCommunityId(data._id?.toString() || "");

      // Check if user is admin or sub-admin
      const userId = session?.user?.id;
      setIsAdmin(data.admin === userId);
      setIsSubAdmin(data.subAdmins?.includes(userId) || false);

      // Set questions
      setQuestions(data.adminQuestions || []);

      // Fetch members with their usernames
      const membersWithUsernames = await Promise.all(
        data.members.map(async (memberId: string) => {
          const userRes = await fetch(`/api/user/${memberId}`);
          const userData = await userRes.json();
          return {
            id: memberId,
            username: userData.username,
            isSubAdmin: data.subAdmins?.includes(memberId) || false,
          };
        })
      );
      setMembers(membersWithUsernames);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching community:", error);
      showNotification("Failed to fetch community data", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchCommunity();
    }
  }, [slug, session?.user?.id]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAdmin && !isSubAdmin) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <p className="text-error">
          Only community admins and sub-admins can access the admin panel.
        </p>
      </div>
    );
  }

  const handleAddSubAdmin = async (memberId: string) => {
    if (!isAdmin) {
      showNotification("Only admins can add sub-admins", "error");
      return;
    }

    try {
      const response = await fetch(`/api/community/${slug}/subadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add sub-admin");
      }

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, isSubAdmin: true } : member
        )
      );
      showNotification("Sub-admin added successfully", "success");
    } catch (error) {
      showNotification("Failed to add sub-admin", "error");
    }
  };

  const handleRemoveSubAdmin = async (memberId: string) => {
    if (!isAdmin) {
      showNotification("Only admins can remove sub-admins", "error");
      return;
    }

    try {
      const response = await fetch(`/api/community/${slug}/subadmin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove sub-admin");
      }

      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, isSubAdmin: false } : member
        )
      );
      showNotification("Sub-admin removed successfully", "success");
    } catch (error) {
      showNotification("Failed to remove sub-admin", "error");
    }
  };

  const handleAddQuestion = () => {
    if (questions.length >= 3) {
      showNotification("Maximum 3 questions allowed", "error");
      return;
    }
    setQuestions([...questions, ""]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSaveQuestions = async () => {
    if (!isAdmin) {
      showNotification("Only admins can update questions", "error");
      return;
    }

    // Filter out empty questions
    const filteredQuestions = questions.filter((q) => q.trim() !== "");

    if (filteredQuestions.length > 3) {
      showNotification("Maximum 3 questions allowed", "error");
      return;
    }

    setSavingQuestions(true);
    try {
      const response = await fetch(`/api/community/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
          questions: filteredQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update questions");
      }

      setQuestions(filteredQuestions);
      showNotification("Questions updated successfully", "success");
    } catch (error) {
      showNotification("Failed to update questions", "error");
      console.error(error);
    } finally {
      setSavingQuestions(false);
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Admin Panel</h2>

      <div className="mb-6 sm:mb-8">
        <CommunityAdminPanel communityId={communityId} />
      </div>

      <div className="divider text-sm sm:text-base">Join Questions</div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-semibold">
            Questions for New Members
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              {questions.length}/3 questions
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAddQuestion}
                disabled={questions.length >= 3}
                className="btn btn-xs sm:btn-sm btn-primary"
                title="Add question"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Add Question</span>
                <span className="xs:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {questions.length === 0 ? (
            <div className="text-gray-500 italic text-sm sm:text-base">
              No questions set. New members can join without answering any
              questions.
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-grow">
                  <textarea
                    value={question}
                    onChange={(e) =>
                      handleQuestionChange(index, e.target.value)
                    }
                    placeholder={`Question ${index + 1}`}
                    className="textarea textarea-bordered w-full text-sm sm:text-base"
                    rows={2}
                    disabled={!isAdmin}
                  />
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="btn btn-xs sm:btn-sm btn-error mt-2"
                    title="Remove question"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveQuestions}
              className="btn btn-sm sm:btn-md btn-primary"
              disabled={savingQuestions}
            >
              {savingQuestions ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden xs:inline">Save Questions</span>
                  <span className="xs:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="divider text-sm sm:text-base">Sub-Admin Management</div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold">Members</h3>
        <div className="overflow-x-auto">
          <table className="table table-sm sm:table-md w-full">
            <thead>
              <tr>
                <th className="text-xs sm:text-sm">Username</th>
                <th className="text-xs sm:text-sm">Role</th>
                <th className="text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="text-xs sm:text-sm">{member.username}</td>
                  <td className="text-xs sm:text-sm">
                    {member.id === session?.user?.id
                      ? "Admin"
                      : member.isSubAdmin
                      ? "Sub-Admin"
                      : "Member"}
                  </td>
                  <td>
                    {member.id !== session?.user?.id && isAdmin && (
                      <div className="flex flex-col xs:flex-row gap-1 xs:gap-2">
                        {!member.isSubAdmin ? (
                          <button
                            type="button"
                            className="btn btn-xs sm:btn-sm btn-primary"
                            onClick={() => handleAddSubAdmin(member.id)}
                          >
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              Make Sub-Admin
                            </span>
                            <span className="xs:hidden">Add</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-xs sm:btn-sm btn-error"
                            onClick={() => handleRemoveSubAdmin(member.id)}
                          >
                            <UserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">
                              Remove Sub-Admin
                            </span>
                            <span className="xs:hidden">Remove</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
