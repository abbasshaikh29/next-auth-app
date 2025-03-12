"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import Communityfeed from "@/components/communitycommponets/Communityfeed";
import { ICommunity } from "@/models/Community";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
export default function Home() {
  const [community, setcommunity] = useState<ICommunity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // body
      try {
        const data = await apiClient.getcommunities();
        setcommunity(data);
      } catch (error) {
        console.error("Error fetching coummunites:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <main className=" ">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto flex flex-col items-center px-8 py-16  ">
          <h1 className="text-6xl font-bold  ">Discover Communities</h1>
          <h1 className="text-4xl px-6 font-bold mb-8 ">or create one </h1>
          <Link href={"/communityform"}>
            <button className="btn btn-neutral">Create Community</button>
          </Link>
        </div>
        <div className="flex felx-col justify-center ">
          <Communityfeed communitys={community} />
        </div>
      </div>
    </main>
  );
}
