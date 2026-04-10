export default function SitesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg" />
          <div className="h-4 w-44 bg-gray-200 rounded mt-2" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-14 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-14 bg-gray-200 rounded" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded mt-1" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded mt-1" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-14 bg-gray-200 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-8 bg-gray-200 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
