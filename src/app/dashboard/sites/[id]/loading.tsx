export default function SiteOverviewLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />

      {/* Site header card skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded-full" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Pages list skeleton */}
      <div className="h-6 w-16 bg-gray-200 rounded mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-28 bg-gray-200 rounded mb-1" />
                <div className="h-4 w-36 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
