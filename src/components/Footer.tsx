"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on legal pages to avoid duplication
  if (pathname.startsWith("/legal")) {
    return null;
  }

  return (
    <footer className="border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8">
          {/* Navigation Links */}
          <div className="flex items-center gap-6 text-gray-600">
            <Link
              href="/legal"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Legal
            </Link>
            <Link
              href="/community"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Community
            </Link>
            <Link
              href="/affiliates"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Affiliates
            </Link>
            <Link
              href="/support"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Support
            </Link>
            <Link
              href="/careers"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              Careers
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} TheTribelab. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
