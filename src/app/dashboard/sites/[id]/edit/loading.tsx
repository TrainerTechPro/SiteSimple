export default function EditSiteLoading() {
  return (
    <div className="animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />

      {/* Heading skeleton */}
      <div className="mb-8">
        <div className="h-8 w-56 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-gray-200 rounded" />
      </div>

      {/* Section editor card skeletons */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-1.5" />
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
              </div>
              <div>
                <div className="h-3 w-20 bg-gray-200 rounded mb-1.5" />
                <div className="h-24 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
