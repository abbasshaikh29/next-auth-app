"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  href: string;
  label: string;
  active: boolean;
}

const NavItem = ({ href, label, active }: NavItemProps) => {
  return (
    <Link 
      href={href}
      className={`block py-3 px-4 rounded-md transition-colors ${
        active 
          ? "bg-primary text-primary-content font-medium" 
          : "hover:bg-base-200"
      }`}
    >
      {label}
    </Link>
  );
};

export default function SettingsNavigation() {
  const pathname = usePathname();
  
  const settingsLinks = [
    { href: "/settings", label: "Your Settings" },
    { href: "/settings/community", label: "Community Settings" },
    { href: "/settings/media", label: "About Media" },
    { href: "/settings/payment", label: "Payment Settings" },
    { href: "/settings/pricing", label: "Access & Pricing" },
    { href: "/settings/billing", label: "Billing & Trial" },
    { href: "/settings/admin", label: "Admin Panel" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {settingsLinks.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          label={link.label}
          active={pathname === link.href}
        />
      ))}
    </div>
  );
}
