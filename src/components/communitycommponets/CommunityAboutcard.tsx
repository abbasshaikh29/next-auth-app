import Link from "next/link";
import React from "react";

interface NewCommmunityPageProps {
  title: string | null | undefined;
  description: string | null | undefined;
}

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
function CommunityAboutcard({ title, description }: NewCommmunityPageProps) {
  return (
    <div className="card w-80 bg-base-300 text-base-content shadow-xl h-96 rounded-2xl">
      <figure className="px-4 pt-4">
        <img
          src="https://placeimg.com/400/225/arch"
          alt="Community Image"
          className="rounded-xl"
        />
      </figure>
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
            <Link href={"/communitysetting"}>Community Setting</Link>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityAboutcard;
