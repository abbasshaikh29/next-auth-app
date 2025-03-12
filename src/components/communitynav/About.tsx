"use client";

import { useState, useEffect } from "react";
import type { ICommunity } from "@/models/Community";
import { IUser } from "@/models/User";

interface AboutProps {
  slug: string;
}

async function getCommunity(slug: string): Promise<ICommunity | null> {
  try {
    const response = await fetch(`/api/community/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to fetch community");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching community:", error);
    return null;
  }
}

function About({ slug }: AboutProps) {
  const [community, setCommunity] = useState<ICommunity | null>(null);
  const [creator, setCreator] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCommunity(slug);
        setCommunity(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div className=" m-10 flex flex-col gap-4 bg-base-300 p-4 rounded-md">
      <h1 className="text-2xl font-bold mb-4">{community?.name}</h1>
      <p className="text-gray-600">Created by @{creator?.slug}</p>
      <div>about content: {community?.description}</div>
    </div>
  );
}

export default About;
