import Link from "next/link";
import React from "react";
import { IKImage } from "imagekitio-next";
interface NewCommmunityPageProps {
  title: string | null | undefined;
  slug: string | null | undefined;
  description: string | null | undefined;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
function truncateDescription(description: string | undefined): string {
  if (!description) {
    return "";
  }
  const words = description.split(" ");
  if (words.length > 20) {
    return words.slice(0, 20).join(" ") + "...";
  }
  return description;
}
function CommunityAboutcard({
  slug,
  title,
  description,
}: NewCommmunityPageProps) {
  return (
    <div className="card w-80 bg-base-300 text-base-content shadow-xl h-96 rounded-2xl">
      <div className="App">
        <IKImage
          urlEndpoint={urlEndpoint}
          path="default-image.jpg"
          width={40}
          height={40}
          alt="community banner"
        />
      </div>
      <div className="card-body items-center text-center">
        <h1 className="card-title">{title ? title : "NewCommmunityPage"}</h1>

        <div className="mt-2">
          <p>
            {truncateDescription(
              description ? description : "this is a community"
            )}
          </p>
        </div>

        <div className="card-actions mt-4">
          <button className="btn  btn-secondary">
            <Link href={`/Newcompage/${slug}/communitysetting`}>
              Community Setting
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityAboutcard;
