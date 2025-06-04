"use client";

import Courses from "@/components/communitynav/Courses";
import React, { useEffect } from "react";

function Course() {
  // Force the correct background color for this page
  useEffect(() => {
    // Get the current theme
    const currentTheme = document.documentElement.getAttribute("data-theme") || "whiteHalloween";
    
    // Apply the correct background color based on theme
    if (currentTheme === "halloween") {
      document.body.style.backgroundColor = "#2b2b2e"; // Dark theme background from CSS variables
    } else {
      document.body.style.backgroundColor = "#f5f5ee"; // Light theme background
    }
    
    // Cleanup function to remove the style when component unmounts
    return () => {
      document.body.style.removeProperty("backgroundColor");
    };
  }, []);

  return (
    <div className="courses-page" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Courses />
    </div>
  );
}

export default Course;
