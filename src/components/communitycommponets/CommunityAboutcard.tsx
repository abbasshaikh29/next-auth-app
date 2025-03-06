import React from "react";

interface NewCommmunityPageProps {
  title: string | null | undefined;
  description: string | null | undefined;
}
function CommunityAboutcard({ title, description }: NewCommmunityPageProps) {
  return (
    <div className="card w-96 bg-blue-100 shadow-xl h-96 rounded-lg">
      <figure className="px-4 pt-4">
        <img
          src="https://placeimg.com/400/225/arch"
          alt="Adonis Gang"
          className="rounded-xl"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h1 className="card-title">{title ? title : "NewCommmunityPage"}</h1>

        <div className="mt-2">
          <p>{description ? description : "this is a community"}</p>
        </div>

        <div className="card-actions mt-4">
          <button className="btn  btn-primary">SETTINGS</button>
        </div>
      </div>
    </div>
  );
}

export default CommunityAboutcard;
