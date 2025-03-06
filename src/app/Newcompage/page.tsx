"use client";
import React, { useState, useEffect } from "react";
import CommunityAboutcard from "@/components/communitycommponets/CommunityAboutcard";
import NewCommmunityPage from "@/components/communitycommponets/NewCommmunityPage";
import { CreatePost } from "@/components/postcommponets/Createpost";
import Header from "@/components/Header";
import { apiClient } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { ICommunity } from "@/models/Community";
interface communityId {
  id: string;
}

function page() {
  const { id } = useParams();
  const [community, setcommunity] = useState<ICommunity | null>(null);

  const fetchData = async () => {
    if (typeof id !== "string") return;
    try {
      const data = await apiClient.getcommunity(id);
      setcommunity(data);
      console.log("Fetched community:", data);
    } catch (error) {
      console.error("Error fetching community:", error);
    }
  };

  useEffect(() => {
    fetchData();
    console.log("Community data:", community);
  }, [id]);

  return (
    <div>
      <Header title={community?.name} />
      {community ? (
        <div>
          <NewCommmunityPage title={community?.name} />

          <CommunityAboutcard
            title={community?.name}
            description={community?.description}
          />
        </div>
      ) : (
        <p>Community not found.</p>
      )}
    </div>
  );
}

export default page;
