"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <div className="bg-white py-16 relative overflow-hidden">
      {/* Halloween decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-halloween-purple via-halloween-orange to-halloween-green opacity-30"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-halloween-orange opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-halloween-purple opacity-5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-halloween-purple via-halloween-orange to-halloween-green bg-clip-text text-transparent">
            Monetize Your Audience with Community
          </h1>
          <p className="text-lg md:text-xl text-halloween-black/70 max-w-2xl mx-auto mb-8">
            Build, grow, and engage your community with our powerful platform.
            Special Halloween pricing: just $39/month for all premium features!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <button
                type="button"
                className="btn btn-halloween px-8 py-3 text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View Pricing{" "}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-halloween-orange opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </button>
            </Link>
            <Link href="/communityform">
              <button
                type="button"
                className="btn btn-outline border-halloween-purple text-halloween-purple hover:bg-halloween-purple/5 px-8 py-3 text-lg"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
