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
  const [isMember, setIsMember] = useState(false);

  const fetchCommunity = async () => {
    const res = await fetch(`/api/community/${slug}`);
    const data = await res.json();
    setName(data.name);
    setIsMember(data.members?.includes(session?.user?.id) || false);
  };

  useEffect(() => {
    fetchCommunity();
  }, [slug, session?.user?.id]);

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
        <div className="container mx-auto flex justify-between  px-16 items-center">
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
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-6 rounded-full">
                    <User />
                  </div>
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
                      <li className="divider my-1"></li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="px-4 py-2 hover:bg-base-200 block w-full"
                        >
                          Sign Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link
                        href="/login"
                        className="px-4 py-2 hover:bg-base-200 block w-full"
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

        <div>
          {isMember ? (
            <>
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
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityNav;
