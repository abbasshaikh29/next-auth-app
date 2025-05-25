"use client";

import Calander from "@/components/communitynav/Calander";
import React, { useEffect } from "react";

function CalendarPage() {
  // Force the correct background color for this page
  useEffect(() => {
    // Get the current theme
    const currentTheme = document.documentElement.getAttribute("data-theme") || "whiteHalloween";
    
    // Apply the correct background color based on theme
    if (currentTheme === "halloween") {
      document.body.style.backgroundColor = "#2b2b2e"; // Dark theme background from CSS variables
    } else {
      document.body.style.backgroundColor = "#ffffff"; // Light theme background
    }
    
    // Cleanup function to remove the style when component unmounts
    return () => {
      document.body.style.removeProperty("backgroundColor");
    };
  }, []);

  return (
    <div className="calander-page" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Calander />
    </div>
  );
}

export default CalendarPage;
