"use client";

import React from "react";
import Header from "@/components/Header";
import Link from "next/link";

export default function CommunityPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-halloween-purple text-center">
          Community
        </h1>

        <div className="max-w-4xl mx-auto">
          <p className="text-center mb-8">
            Join our community to connect with other members and get the most
            out of TheTribelab.
          </p>

          <div className="flex justify-center">
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
