export default function PublicSiteLoading() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Header bar skeleton */}
      <div className="w-full py-4 px-6 flex items-center justify-between bg-[#111111]">
        <div className="h-6 w-36 bg-gray-700 rounded" />
        <div className="h-3 w-28 bg-gray-700 rounded" />
      </div>

      {/* Hero section skeleton */}
      <div className="w-full h-[500px] bg-gray-200" />

      {/* Content sections skeleton */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto w-full py-8 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-56 bg-gray-200 rounded mx-auto" />
          <div className="h-3 w-28 bg-gray-200 rounded mx-auto mt-3" />
        </div>
      </div>
    </div>
  );
}
