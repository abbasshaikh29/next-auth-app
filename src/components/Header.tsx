"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useNotification } from "./Notification";
import Link from "next/link";
import { User } from "lucide-react";
import SessionDebug from "./SessionDebug";

export default function Header() {
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  const [showDebug, setShowDebug] = useState(false);

  // Debug session data
  useEffect(() => {
    console.log("Header - Session data:", {
      status,
      user: session?.user,
      profileImage: session?.user?.profileImage,
    });
  }, [session, status]);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Sign out successful", "success");
    } catch (error) {
      console.log(error);
      showNotification("Sign out failed", "error");
    }
  };
  return (
    <div className="navbar bg-base-300 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex-1 px-2 lg:flex-none">
          <Link
            href="/"
            className="btn btn-ghost text-xl gap-2 normal-case font-bold"
            prefetch={true}
            onClick={() =>
              showNotification("Welcome to TheTribelab", "success")
            }
          >
            SKOOL
          </Link>
        </div>
        <div className="flex flex-1 justify-end px-2">
          <div className="flex items-stretch gap-2">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                aria-label="User menu"
                title="User menu"
                className="btn btn-ghost btn-circle avatar"
              >
                {session?.user?.profileImage ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <div
                      className="w-full h-full bg-center bg-cover"
                      style={{
                        backgroundImage: `url(${session.user.profileImage})`,
                      }}
                    />
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] shadow-lg bg-base-100 rounded-box w-64 mt-4 py-2"
              >
                {session ? (
                  <>
                    <li className="px-4 py-1">
                      <span className="text-sm opacity-70">
                        {session.user.id.split("@")[0]}
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
                          showNotification("Going to Settings", "info")
                        }
                      >
                        Settings
                      </Link>
                    </li>
                    <li className="divider my-1"></li>{" "}
                    <li className="items-center px-20">
                      <button
                        type="button"
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
      {showDebug && <SessionDebug />}
    </div>
  );
}
