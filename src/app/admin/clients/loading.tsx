export default function ClientsLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg" />
          <div className="h-4 w-48 bg-gray-200 rounded mt-2" />
        </div>
      </div>

      {/* New Client form skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4">
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
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
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-8 bg-gray-200 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
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
