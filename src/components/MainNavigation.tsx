"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function MainNavigation() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/community", label: "Community" },
    { href: "/courses", label: "Courses" },
    { href: "/calendar", label: "Calendar" },
    { href: "/about", label: "About" },
    { href: "/members", label: "Members" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="w-full border-b border-base-300 bg-base-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-primary text-primary-content font-bold text-sm h-8 w-8 flex items-center justify-center rounded mr-2">
                  R/B
                </div>
                <span className="font-semibold text-base-content">reset your brain</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
              {navItems.map((item) => {
                const isActive = 
                  (item.href === "/settings" && pathname.startsWith("/settings")) ||
                  pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 h-full ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent hover:text-base-content/70 hover:border-base-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src="/placeholder-avatar.jpg"
                  alt="User profile"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-avatar.jpg";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
