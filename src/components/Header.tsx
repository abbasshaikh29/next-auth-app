"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useNotification } from "./Notification";
import Link from "next/link";
import Image from "next/image";
import { User, ChevronDown, Compass, Plus } from "lucide-react";

import CommunityIcon from "./communitynav/CommunityIcon";
import { usePathname } from "next/navigation";
import MessageIcon from "./messages/MessageIcon";
import NotificationIcon from "./notifications/NotificationIcon";
import ThemeSwitcher from "./ThemeSwitcher";
import ProfileAvatar from "./ProfileAvatar";

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

  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(
    null
  );
  const pathname = usePathname();

  // No debug logging in production

  // Fetch user communities
  // Function to preload community icons
  const preloadCommunityIcons = (communities: Community[]) => {
    communities.forEach((community) => {
      if (community.iconImageUrl && community.iconImageUrl.trim() !== "") {
        const img = new window.Image();
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

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Sign out successful", "success");
    } catch (error) {
      showNotification("Sign out failed", "error");
    }
  };
  return (
    <div
      className="navbar sticky top-0 z-40 shadow-sm border-b transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)"
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 lg:flex-none flex items-center gap-2">
          <Link
            href="/"
            className="btn btn-ghost text-xl normal-case font-bold relative group transition-colors duration-200"
            prefetch={true}
            style={{ color: "var(--text-primary)" }}
            onClick={() =>
              showNotification("Welcome to TheTribelab", "success")
            }
          >
            <span className="relative z-10">TheTribelab</span>
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: "var(--brand-primary)" }}
            ></span>
          </Link>

          {/* Communities Dropdown */}
          {session && (
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                aria-label="My communities"
                title="My communities"
                className="btn btn-ghost btn-sm normal-case flex items-center gap-1 rounded-lg transition-colors duration-200"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <ChevronDown size={20} style={{ color: "var(--brand-primary)" }} />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] text-lg menu p-2 rounded-box w-72 border transition-all duration-200"
                style={{
                  backgroundColor: "var(--dropdown-bg)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-lg)"
                }}
              >
                <li className="">
                  <Link
                    href="/community-feed"
                    className="flex items-center gap-2 hover:bg-base-200 rounded-lg py-2"
                  >
                    <div
                      className={`rounded-md overflow-hidden w-8 h-8 sm:w-10 sm:h-10 min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 flex-shrink-0 hover:scale-105 transition-transform duration-200 flex items-center justify-center`}
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
            {/* Message Icon */}
            {session && <MessageIcon />}
            {/* Notification Icon */}
            {session && <NotificationIcon />}
            {/* Theme Switcher */}
            <ThemeSwitcher />
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                aria-label="User menu"
                title="User menu"
                className="btn btn-ghost btn-circle avatar border-2 transition-colors duration-300"
                style={{
                  borderColor: "var(--border-color)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                }}
              >
                {session?.user ? (
                  <ProfileAvatar
                    imageUrl={session.user.profileImage}
                    name={session.user.name || session.user.username}
                    email={session.user.email}
                    size="md"
                  />
                ) : (
                  <User className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                )}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg rounded-box w-64 mt-4"
                style={{
                  backgroundColor: "var(--dropdown-bg)",
                  color: "var(--text-primary)",
                  maxWidth: "300px",
                  overflow: "hidden",
                }}
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
                        className="px-4 py-2 block w-full transition-colors duration-200 rounded-lg"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
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
                        className="px-4 py-2 block w-full transition-colors duration-200 rounded-lg"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() =>
                          showNotification("Create your Community", "info")
                        }
                      >
                        Create Community
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/UserSettings"}
                        className="px-4 py-2 block w-full transition-colors duration-200 rounded-lg"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() =>
                          showNotification("Going to Settings", "info")
                        }
                      >
                        Settings
                      </Link>
                    </li>
                    <li className="divider my-1" style={{ borderColor: "var(--border-color)" }}></li>
                    <li className="items-center px-4 flex justify-center">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="btn btn-primary relative overflow-hidden transition-all duration-200"
                        style={{
                          backgroundColor: "var(--brand-primary)",
                          color: "var(--primary-content)",
                          border: "none"
                        }}
                      >
                        Log Out
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="px-4 py-2 block w-full transition-colors duration-200 rounded-lg"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--hover-bg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
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
    </div>
  );
}
