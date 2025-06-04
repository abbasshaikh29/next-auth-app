"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

function Hero() {
  const animatedWords = ["Empire", "Tribe", "Community", "Group"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  useEffect(() => {
    const detectTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'whiteHalloween';
      setCurrentTheme(theme);
    };
    
    detectTheme();
    window.addEventListener('theme-change', detectTheme);

    return () => {
      window.removeEventListener('theme-change', detectTheme);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 1000); // Change word every 1 second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [animatedWords.length]);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: "easeOut" } }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.6, ease: "easeOut" } }
  };

  const floatingCircleVariants = {
    animate: {
      x: [0, 10, -10, 0],
      y: [0, -10, 10, 0],
      transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 8, ease: "easeInOut" }
    }
  };

  // Auto-moving particles
  const autoMovingVariants = {
    orange: {
      animate: {
        opacity: 0.1,
        x: [0, 20, -20, 0],
        y: [0, -15, 15, 0],
        transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 12, ease: "easeInOut" }
      }
    },
    purple: {
      animate: {
        opacity: 0.1,
        x: [0, -25, 25, 0],
        y: [0, 20, -20, 0],
        transition: { repeat: Infinity, repeatType: "reverse" as const, duration: 15, ease: "easeInOut" }
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,80px))] flex flex-col items-center justify-center relative bg-[#F5F0E8] text-[#1E1B4B] py-10 px-4">


      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 relative">
          <h1 
            className="font-thunder text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tight text-center text-[#000000]"
          >
            Monetize Your Audience,
            <br />
            Build Your <span className="inline-block text-left w-60 sm:w-72 md:w-96 lg:w-128">{animatedWords[currentWordIndex]}.</span>
          </h1>
          
          <p 
            className="mt-6 text-xl md:text-2xl text-left text-[#000000] max-w-2xl mx-auto">
For creators, influencers: Build, connect, monetize your exclusive community. Your audience, your growth.

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
