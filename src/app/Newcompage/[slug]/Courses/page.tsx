"use client";

import Courses from "@/components/communitynav/Courses";
import React, { useEffect } from "react";

function Course() {
  // Force the correct background color for this page
  useEffect(() => {
    // Apply the background color using CSS variables
    document.body.style.backgroundColor = "var(--bg-primary)";
    document.body.style.color = "var(--text-primary)";

    // Cleanup function to remove the style when component unmounts
    return () => {
      document.body.style.removeProperty("backgroundColor");
      document.body.style.removeProperty("color");
    };
  }, []);

  return (
    <div className="courses-page" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Courses />
    </div>
  );
}

export default Course;
