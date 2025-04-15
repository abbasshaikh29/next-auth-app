import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X } from "lucide-react";

interface SearchProps {
  onSearch: (query: string) => void;
}

function Searchs({ onSearch }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search posts by title or content"
        className="pl-10 pr-10 rounded-full w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Searchs;
