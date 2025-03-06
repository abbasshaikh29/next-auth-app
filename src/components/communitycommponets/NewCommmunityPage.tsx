import React from "react";

interface NewCommmunityPageProps {
  title: string | null | undefined;
}

function NewCommmunityPage({ title }: NewCommmunityPageProps) {
  return (
    <div>
      <h1>{title ? title : "NewCommmunityPage"}</h1>
    </div>
  );
}

export default NewCommmunityPage;
