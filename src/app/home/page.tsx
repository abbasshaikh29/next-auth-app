"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import Communityfeed from "@/components/communitycommponets/Communityfeed";
import { ICommunity } from "@/models/Community";
import { apiClient, PaginationResponse } from "@/lib/api-client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ConditionalHero from "@/components/ConditionalHero";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<ICommunity[]>([]);
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
      console.log("Communities fetched:", response);
      setCommunities(response.communities);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities(currentPage);
  }, [currentPage]);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Conditional Hero based on theme */}
      <ConditionalHero />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mx-4 sm:m-8 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl mt-2 sm:mt-9 font-bold leading-tight">
            Discover Communities
          </h1>
          <h1 className="text-2xl sm:text-3xl md:text-4xl px-2 sm:px-6 font-bold mb-4 sm:mb-8">
            or create one
          </h1>
          <Link href={"/communityform"}>
            <button
              type="button"
              className="btn mb-4 sm:mb-7 btn-accent w-full sm:w-auto"
            >
              Create Community
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="alert alert-error max-w-md mx-auto">
            <span>{error}</span>
          </div>
        ) : communities.length === 0 ? (
          <div className="alert alert-info max-w-md mx-auto">
            <span>No communities found. Create your first community!</span>
          </div>
        ) : (
          <div className="flex flex-col justify-center p-3">
            <Communityfeed communitys={communities} />

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-8">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* First page */}
                  {currentPage > 3 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPage(1)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                        currentPage === 1
                          ? "bg-amber-200 text-gray-900 font-medium"
                          : "border border-gray-300 hover:bg-gray-100"
                      }`}
                      aria-label="Page 1"
                    >
                      1
                    </button>
                  )}

                  {/* Ellipsis if needed */}
                  {currentPage > 4 && (
                    <span className="text-gray-500">...</span>
                  )}

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(pagination.pages, 5) },
                    (_, i) => {
                      let pageToShow;
                      if (pagination.pages <= 5) {
                        // If 5 or fewer pages, show all
                        pageToShow = i + 1;
                      } else if (currentPage <= 3) {
                        // If near the start
                        pageToShow = i + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        // If near the end
                        pageToShow = pagination.pages - 4 + i;
                      } else {
                        // In the middle
                        pageToShow = currentPage - 2 + i;
                      }

                      // Skip if this would duplicate first/last page that we show separately
                      if (
                        (pageToShow === 1 && currentPage > 3) ||
                        (pageToShow === pagination.pages &&
                          currentPage < pagination.pages - 2)
                      ) {
                        return null;
                      }

                      return (
                        <button
                          type="button"
                          key={pageToShow}
                          onClick={() => setCurrentPage(pageToShow)}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                            currentPage === pageToShow
                              ? "bg-amber-200 text-gray-900 font-medium"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                          aria-label={`Page ${pageToShow}`}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                  )}

                  {/* Ellipsis if needed */}
                  {currentPage < pagination.pages - 3 && (
                    <span className="text-gray-500">...</span>
                  )}

                  {/* Last page */}
                  {currentPage < pagination.pages - 2 &&
                    pagination.pages > 5 && (
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pagination.pages)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                          currentPage === pagination.pages
                            ? "bg-amber-200 text-gray-900 font-medium"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                        aria-label={`Page ${pagination.pages}`}
                      >
                        {pagination.pages}
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.pages)
                      )
                    }
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Pagination Info removed as requested */}
          </div>
        )}
      </div>
    </main>
  );
}
