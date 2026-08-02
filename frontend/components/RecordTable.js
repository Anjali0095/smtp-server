"use client";

const TYPE_COLORS = {
  A: "bg-sky-50 text-sky-700",
  AAAA: "bg-sky-50 text-sky-700",
  CNAME: "bg-violet-50 text-violet-700",
  TXT: "bg-slate-100 text-slate-700",
  MX: "bg-orange-50 text-orange-700",
  DMARC: "bg-rose-50 text-rose-700",
  SPF: "bg-emerald-50 text-emerald-700",
  DKIM: "bg-indigo-50 text-indigo-700",
  NS: "bg-teal-50 text-teal-700",
};

export default function RecordTable({ records, onEdit, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="card mt-4 px-6 py-12 text-center text-sm text-slate-500">
        No DNS records yet. Add an A, CNAME, TXT, MX, SPF, DKIM or DMARC record to get started.
      </div>
    );
  }

  return (
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Value</th>
            <th className="px-5 py-3 font-medium">TTL</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-5 py-3">
                <span className={`badge ${TYPE_COLORS[r.type] || "bg-slate-100 text-slate-700"}`}>
                  {r.type}
                </span>
              </td>
              <td className="px-5 py-3 font-medium text-slate-700">{r.name}</td>
              <td className="max-w-xs truncate px-5 py-3 text-slate-500" title={r.value}>
                {r.value}
                {r.priority ? ` (priority ${r.priority})` : ""}
              </td>
              <td className="px-5 py-3 text-slate-500">{r.ttl}s</td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => onEdit(r)}
                  className="mr-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
