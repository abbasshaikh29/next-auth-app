import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
function Searchs() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search Post"
        className="pl-10 rounded-full w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

export default Searchs;
