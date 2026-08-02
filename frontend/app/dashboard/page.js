"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import AddDomainModal from "../../components/AddDomainModal";

export default function DomainsPage() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listDomains();
      setDomains(data.domains);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Delete this domain and all of its DNS records?")) return;
    try {
      await api.deleteDomain(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Domains</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add sending domains and manage their DNS records and SMTP credentials.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + Add domain
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : domains.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 6l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No domains yet</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Add your first sending domain to configure DNS records and SMTP credentials.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-5">
            + Add domain
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Link key={d.id} href={`/dashboard/domains/${d.id}`} className="card group p-5 transition hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{d.domain_name}</h3>
                <span
                  className={`badge ${
                    d.verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {d.verified ? "Verified" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {d.record_count} DNS record{d.record_count === 1 ? "" : "s"}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
                  Manage →
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(d.id);
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showAdd && (
        <AddDomainModal
          onClose={() => setShowAdd(false)}
          onCreated={(domain) => {
            setDomains((prev) => [domain, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
