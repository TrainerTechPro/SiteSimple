export default function SiteDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-2 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
      </div>

      {/* Site header card skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-14 bg-gray-200 rounded-full" />
            </div>
            <div className="space-y-2 mt-3">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-4 w-44 bg-gray-200 rounded" />
              <div className="h-4 w-52 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            <div className="h-10 w-28 bg-gray-200 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Pages table skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-10 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-10 bg-gray-200 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add page form skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="h-3 w-20 bg-gray-200 rounded mb-1.5" />
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
          </div>
          <div className="flex-1">
            <div className="h-3 w-20 bg-gray-200 rounded mb-1.5" />
            <div className="h-10 w-full bg-gray-200 rounded-lg" />
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
