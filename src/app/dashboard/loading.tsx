export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-32 bg-gray-200 rounded-lg mb-1" />
      <div className="h-4 w-72 bg-gray-200 rounded mb-8" />

      {/* Site cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
            <div className="mt-auto space-y-2">
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
              <div className="h-10 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
