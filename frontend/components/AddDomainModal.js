"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function AddDomainModal({ onClose, onCreated }) {
  const [domainName, setDomainName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.createDomain({ domain_name: domainName.trim() });
      onCreated(data.domain);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="card w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900">Add a domain</h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the domain you want to send email from, e.g. mail.example.com
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="label">Domain name</label>
            <input
              autoFocus
              required
              className="input"
              placeholder="example.com"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Adding..." : "Add domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
