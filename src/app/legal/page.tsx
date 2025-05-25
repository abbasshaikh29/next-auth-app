"use client";

import React, { Suspense } from "react";
import LegalTabLayout from "@/components/legal/LegalTabLayout";

// Loading component to show while the content is loading
function Loading() {
  return <div className="p-8 text-center">Loading legal content...</div>;
}

export default function LegalPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LegalTabLayout />
    </Suspense>
  );
}
