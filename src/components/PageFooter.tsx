"use client";

import React from 'react';
import Link from 'next/link';

interface PageFooterProps {
  className?: string;
}

const PageFooter: React.FC<PageFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`py-4 border-t border-gray-200 mt-auto ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8">
          <div className="flex items-center gap-6 text-gray-600">
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
            <button
              className="hover:text-halloween-purple transition-colors"
              aria-label="More options"
            >
              •••
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
