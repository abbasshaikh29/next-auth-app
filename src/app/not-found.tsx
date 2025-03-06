import Link from "next/link";
import React from "react";

function notfound() {
  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 Error/Page Not Found</h1>
      <p className="mb-4">
        Sorry, but the page you were trying to view does not exist.
      </p>
      <button className="btn btn-neutral">
        <Link href="/">go back to homepage</Link>
      </button>
    </div>
  );
}

export default notfound;
