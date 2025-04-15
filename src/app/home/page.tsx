"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import Communityfeed from "@/components/communitycommponets/Communityfeed";
import { ICommunity } from "@/models/Community";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SessionDebug from "@/components/SessionDebug";
export default function Home() {
  const { data: session, status } = useSession();
  const [community, setcommunity] = useState<ICommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Toggle debug panel with Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getcommunities();
        console.log("Communities fetched:", data);
        setcommunity(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setError("Failed to load communities. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className=" m-8 flex flex-col items-center ">
          <h1 className="text-6xl mt-9 font-bold">Discover Communities</h1>
          <h1 className="text-4xl px-6 font-bold mb-8">or create one</h1>
          <Link href={"/communityform"}>
            <button type="button" className="btn mb-7 btn-accent">
              Create Community
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <span>{error}</span>
          </div>
        ) : community.length === 0 ? (
          <div className="alert alert-info max-w-md mx-auto">
            <span>No communities found. Create your first community!</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center p-3">
            <Communityfeed communitys={community} />
          </div>
        )}
      </div>

      {showDebug && <SessionDebug />}

      {/* Debug info about session status */}
      <div className="fixed bottom-4 left-4 text-xs opacity-50">
        Session status: {status}
      </div>
    </main>
  );
}
