"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import Communityfeed from "@/components/communitycommponets/Communityfeed";
import { ICommunity } from "@/models/Community";
import { apiClient, PaginationResponse } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import PageFooter from "@/components/PageFooter";

export default function CommunityFeedPage() {
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<ICommunity[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    PaginationResponse<ICommunity>["pagination"] | null
  >(null);

  const fetchCommunities = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getcommunities(page);
      setCommunities(response.communities);
      setFilteredCommunities(response.communities);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter communities based on search term
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(
        (community) =>
          community.name.toLowerCase().includes(term.toLowerCase()) ||
          (community.description &&
            community.description.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredCommunities(filtered);
    }
  };

  useEffect(() => {
    fetchCommunities(currentPage);
  }, [currentPage]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 px-4 py-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover communities
          </h1>
          <div className="text-center mt-4">
            <span className="text-gray-600">or </span>
            <a
              href="/communityform"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              create your own
            </a>
          </div>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for anything"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-3 pl-12 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:border-transparent"
              style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--input-border)' }}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => fetchCommunities(currentPage)}
              className="btn btn-primary btn-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <Communityfeed communitys={filteredCommunities} />
        )}

        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={setCurrentPage}
            className="mt-12"
          />
        )}
      </div>
      <PageFooter />
    </main>
  );
}
