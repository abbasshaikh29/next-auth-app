"use client";
import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import ConditionalHero from "@/components/ConditionalHero";
import Link from "next/link";
import Hero from "@/components/Hero";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
    </main>
  );
}
