"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

function Hero() {
  const animatedWords = ["Empire", "Tribe", "Community", "Group"];
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {
    const detectTheme = () => {
      const theme =
        document.documentElement.getAttribute("data-theme") || "whiteHalloween";
      setCurrentTheme(theme);
    };

    detectTheme();
    window.addEventListener("theme-change", detectTheme);

    return () => {
      window.removeEventListener("theme-change", detectTheme);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentWord = animatedWords[wordIndex];

    const handleType = () => {
      setDisplayedText((prev) => currentWord.substring(0, prev.length + 1));
      if (displayedText.length === currentWord.length) {
        setIsDeleting(true);
        timer = setTimeout(() => {}, 1000); // Pause at end of word
      }
    };

    const handleDelete = () => {
      setDisplayedText((prev) => currentWord.substring(0, prev.length - 1));
      if (displayedText.length === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % animatedWords.length);
        timer = setTimeout(() => {}, 500); // Pause before typing next word
      }
    };

    if (!isDeleting) {
      timer = setTimeout(handleType, 150); // Typing speed
    } else {
      timer = setTimeout(handleDelete, 100); // Deleting speed
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, wordIndex, animatedWords]);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.6, ease: "easeOut" },
    },
  };

  const floatingCircleVariants = {
    animate: {
      x: [0, 10, -10, 0],
      y: [0, -10, 10, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 8,
        ease: "easeInOut",
      },
    },
  };

  // Auto-moving particles
  const autoMovingVariants = {
    orange: {
      animate: {
        opacity: 0.1,
        x: [0, 20, -20, 0],
        y: [0, -15, 15, 0],
        transition: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: 12,
          ease: "easeInOut",
        },
      },
    },
    purple: {
      animate: {
        opacity: 0.1,
        x: [0, -25, 25, 0],
        y: [0, 20, -20, 0],
        transition: {
          repeat: Infinity,
          repeatType: "reverse" as const,
          duration: 15,
          ease: "easeInOut",
        },
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] flex flex-col items-center justify-center relative bg-[#F5F0E8] text-[#1E1B4B] py-10 px-4">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 relative">
          <h1 className="text-9xl font-bold text-black uppercase text-center leading-tight font-thunder">
            Monetize Your Audience,
            <br />
            Build Your <span className="w-auto">{displayedText}</span>
          </h1>
          <h2 className="text-5xl font-bold text-black uppercase text-center leading-tight font-thunder">
            for creators by creators.
          </h2>
          <p className="text-neutral text-center font-sans text-xl font-normal mt-4">
            For creators, influencers: Build, connect, monetize <br />
            your exclusive community. Your audience, your growth.
          </p>

          {/* Buttons Section */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/communityform">
              <button className="btn bg-[#1E1B4B] text-white hover:bg-[#302d69] border-transparent px-8 py-3 rounded-md text-lg font-medium">
                Get Started
              </button>
            </Link>
            <Link href="/community-feed">
              <button className="btn btn-outline border-[#1E1B4B] text-[#1E1B4B] hover:bg-[#1E1B4B] hover:text-white px-8 py-3 rounded-md text-lg font-medium">
                Explore
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
