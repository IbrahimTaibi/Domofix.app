import React from 'react'

export default function TopServices({ rows }: { rows: Array<{ title: string; category: string; completed: number; rating: string; revenue: string }> }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-sm font-semibold text-gray-900 mb-2">Meilleurs services</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Catégorie</th>
              <th className="py-2 pr-4">Terminées</th>
              <th className="py-2 pr-4">Note</th>
              <th className="py-2 pr-4">Revenus</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.title} className="border-t border-gray-100">
                <td className="py-2 pr-4 text-gray-900">{r.title}</td>
                <td className="py-2 pr-4 text-gray-700">{r.category}</td>
                <td className="py-2 pr-4 text-gray-700">{r.completed}</td>
                <td className="py-2 pr-4 text-gray-700">{r.rating}</td>
                <td className="py-2 pr-4 text-gray-900 font-medium">{r.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
