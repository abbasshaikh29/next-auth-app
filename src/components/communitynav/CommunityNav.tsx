"use client";

import React from "react";
import About from "./About";
import Calander from "./Calander";
import Courses from "./Courses";
import Members from "./Members";
import Link from "next/link";
function CommunityNav() {
  return (
    <div className="flex bg-slate-50  justify-center">
      <div className="flex flex-row gap-5 ">
        <Link href={"/communityAbout"}>About</Link>
        <Calander />
        <Courses />
        <Members />
      </div>
    </div>
  );
}

export default CommunityNav;
