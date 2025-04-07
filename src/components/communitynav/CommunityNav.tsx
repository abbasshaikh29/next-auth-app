"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { User } from "lucide-react";
import { useNotification } from "@/components/Notification";
import { useSession, signOut } from "next-auth/react";
function CommunityNav() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [Name, setName] = useState("");
  const fetchCommunity = async () => {
    const res = await fetch(`/api/community/${slug}`);
    const data = await res.json();
    setName(data.name);
  };

  useEffect(() => {
    fetchCommunity();
  }, [slug]);

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Sign out successful", "success");
    } catch (error) {
      showNotification("Sign out failed", "error");
    }
  };
  return (
    <div className="navbar sticky top-0 bg-base-300 shadow-md z-10">
      <div className="flex flex-col justify-center w-full">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1 px-2 lg:flex-none">
            <Link
              href="/"
              className="btn btn-ghost text-xl gap-2 normal-case font-bold"
              prefetch={true}
              onClick={() =>
                showNotification("Welcome to TheTribelab", "success")
              }
            >
              {Name}
            </Link>
          </div>
          <div className="flex flex-1 justify-end px-2">
            <div className="flex items-stretch gap-2">
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle"
                >
                  <User className="w-5 h-5" />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] shadow-lg bg-base-100 rounded-box w-64 mt-4 py-2"
                >
                  {session ? (
                    <>
                      <li className="px-4 py-1">
                        <span className="text-sm opacity-70">
                          {session.user?.id}
                        </span>
                      </li>
                      <li className="divider my-1"></li>
                      <li>
                        <Link
                          href={"/profile"}
                          className="px-4 py-2 hover:bg-base-200 block w-full"
                          onClick={() =>
                            showNotification("Create your Community", "info")
                          }
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={"/communityform"}
                          className="px-4 py-2 hover:bg-base-200 block w-full"
                          onClick={() =>
                            showNotification("Create your Community", "info")
                          }
                        >
                          CreateCommunity
                        </Link>
                      </li>
                      <li>
                        <Link
                          href={"/UserSettings"}
                          className="px-4 py-2 hover:bg-base-200 block w-full"
                          onClick={() =>
                            showNotification("GOing to Setting", "info")
                          }
                        >
                          Settings
                        </Link>
                      </li>
                      <li className="divider my-1"></li>{" "}
                      <li className="items-center px-20">
                        <button
                          onClick={handleSignOut}
                          className="btn btn-primary"
                        >
                          Log Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link
                        href="/login"
                        className="px-4 py-2 hover:bg-base-200 block w-full"
                        onClick={() =>
                          showNotification("Please sign in to continue", "info")
                        }
                      >
                        Login
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <li className="divider my-1"></li>
        <div className="flex  gap-2">
          <Link
            href={`/Newcompage/${slug}`}
            className="btn text-lg btn-ghost hover:text-primary"
          >
            Community
          </Link>
          <Link
            href={`/Newcompage/${slug}/Courses`}
            className="btn text-lg btn-ghost hover:text-primary"
          >
            Courses
          </Link>
          <Link
            href={`/Newcompage/${slug}/Calander`}
            className="btn text-lg btn-ghost hover:text-primary"
          >
            Calander
          </Link>
          <Link
            href={`/Newcompage/${slug}/about`}
            className="btn text-lg btn-ghost "
          >
            About
          </Link>

          <Link
            href={`/Newcompage/${slug}/communitysetting`}
            className="btn text-lg btn-ghost hover:text-primary"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CommunityNav;
