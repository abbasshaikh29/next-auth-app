"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useNotification } from "./Notification";
import Link from "next/link";
import { User, ChevronDown, Compass, Plus, Home } from "lucide-react";
import SessionDebug from "./SessionDebug";
import CommunityIcon from "./communitynav/CommunityIcon";
import { usePathname } from "next/navigation";

interface Community {
  _id: string;
  name: string;
  slug: string;
  iconImageUrl?: string;
  role: string;
}

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [showDebug, setShowDebug] = useState(false);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(
    null
  );
  const pathname = usePathname();

  // Fetch user communities
  // Function to preload community icons
  const preloadCommunityIcons = (communities: Community[]) => {
    communities.forEach((community) => {
      if (community.iconImageUrl && community.iconImageUrl.trim() !== "") {
        const img = new Image();
        img.src = community.iconImageUrl;
      }
    });
  };

  // Effect to detect current community from pathname
  useEffect(() => {
    if (pathname) {
      const match = pathname.match(/\/Newcompage\/([^\/]+)/);
      if (match && match[1]) {
        const communitySlug = match[1];
        // Find the community in userCommunities
        const community = userCommunities.find((c) => c.slug === communitySlug);
        if (community) {
          setCurrentCommunity(community);
        } else {
          // If not found in userCommunities, fetch it
          const fetchCommunity = async () => {
            try {
              const response = await fetch(`/api/community/${communitySlug}`);
              if (response.ok) {
                const data = await response.json();
                setCurrentCommunity({
                  _id: data._id,
                  name: data.name,
                  slug: data.slug,
                  iconImageUrl: data.iconImageUrl || "",
                  role: "visitor",
                });
              }
            } catch (error) {
              // Error handling silently
            }
          };
          fetchCommunity();
        }
      } else {
        setCurrentCommunity(null);
      }
    }
  }, [pathname, userCommunities]);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/communities");
          if (response.ok) {
            const data = await response.json();
            setUserCommunities(data);

            // Preload all community icons
            preloadCommunityIcons(data);
          }
        } catch (error) {
          // Error handling silently
        }
      }
    };

    fetchUserCommunities();
  }, [session]);

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
      showNotification("Sign out failed", "error");
    }
  };
  return (
    <div className="navbar bg-base-300 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex-1 lg:flex-none flex items-center gap-2">
          <Link
            href="/"
            className="btn btn-ghost text-xl normal-case font-bold"
            prefetch={true}
            onClick={() =>
              showNotification("Welcome to TheTribelab", "success")
            }
          >
            SKOOL
          </Link>

          {/* Communities Dropdown */}
          {session && (
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                aria-label="My communities"
                title="My communities"
                className="btn btn-ghost btn-sm normal-case flex items-center gap-1 hover:bg-base-200 rounded-lg"
              >
                <ChevronDown size={20} className="text-primary" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] text-lg menu p-2 shadow-lg bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto border border-base-300"
              >
                <li className="">
                  <Link
                    href="/"
                    className="flex items-center gap-2 hover:bg-base-200 rounded-lg py-2"
                  >
                    <div
                      className={` rounded-md overflow-hidden w-8 h-8 sm:w-10 sm:h-10 min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 flex-shrink-0 hover:scale-105 transition-transform duration-200  flex items-center justify-center`}
                      title="compass"
                    >
                      <Compass size={25} className="text-primary" />
                    </div>
                    <span className="font-medium">Discover Communities</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/communityform"
                    className="flex items-center gap-2 hover:bg-base-200 rounded-lg py-2"
                  >
                    <div
                      className={` rounded-md overflow-hidden w-8 h-8 sm:w-10 sm:h-10 min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 flex-shrink-0 hover:scale-105 transition-transform duration-200  flex items-center justify-center`}
                      title="compass"
                    >
                      <Plus size={25} className="text-primary" />
                    </div>

                    <span className="font-medium">Create Community</span>
                  </Link>
                </li>
                {userCommunities.length > 0 ? (
                  userCommunities.map((community) => {
                    const isCurrentCommunity =
                      currentCommunity?.slug === community.slug;
                    return (
                      <li key={community._id}>
                        <Link
                          href={`/Newcompage/${community.slug}`}
                          className={`flex justify-between hover:bg-base-200 rounded-lg py-2 ${
                            isCurrentCommunity
                              ? "bg-primary/10 border-l-4 border-primary"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CommunityIcon
                              iconUrl={community.iconImageUrl}
                              name={community.name}
                              size="md"
                              className="hover:scale-105 transition-transform duration-200"
                              priority={true}
                            />
                            <div className="flex flex-col">
                              <span className="truncate font-medium">
                                {community.name}
                              </span>
                              {isCurrentCommunity && (
                                <span className="text-xs text-primary">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="px-4 py-2 text-sm text-gray-500">
                    You haven't joined any communities yet
                  </li>
                )}
              </ul>
            </div>
          )}
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
                    <img
                      src={session.user.profileImage}
                      alt="User profile"
                      className="w-full h-full object-cover"
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
