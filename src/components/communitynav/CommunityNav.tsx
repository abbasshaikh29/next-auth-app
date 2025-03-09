"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

function CommunityNav() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="sticky top-0 z-10 flex bg-gray-100 shadow-md justify-center">
      <div className="flex flex-row gap-5 p-4">
        <Link
          href={`/Newcompage/${slug}/about`}
          className="px-4 py-2 rounded-md hover:bg-gray-200"
        >
          About
        </Link>
        <Link
          href={`/Newcompage/${slug}/calander`}
          className="px-4 py-2 rounded-md hover:bg-gray-200"
        >
          Calander
        </Link>
        <Link
          href={`/Newcompage/${slug}/courses`}
          className="px-4 py-2 rounded-md hover:bg-gray-200"
        >
          Courses
        </Link>
        <Link
          href={`/Newcompage/${slug}/members`}
          className="px-4 py-2 rounded-md hover:bg-gray-200"
        >
          Members
        </Link>
      </div>
    </div>
  );
}

export default CommunityNav;
