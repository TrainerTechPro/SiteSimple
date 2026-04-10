import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const separator = baseUrl.includes("?") ? "&" : "?";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-6">
      {currentPage > 1 && (
        <Link href={`${baseUrl}${separator}page=${currentPage - 1}`} className="px-3 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-100">
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}${separator}page=${page}`}
          className={`px-3 py-2 text-sm rounded-lg ${page === currentPage ? "bg-amber-500 text-black font-medium" : "text-gray-500 hover:bg-gray-100"}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link href={`${baseUrl}${separator}page=${currentPage + 1}`} className="px-3 py-2 text-sm rounded-lg text-gray-500 hover:bg-gray-100">
          Next
        </Link>
      )}
    </nav>
  );
}
