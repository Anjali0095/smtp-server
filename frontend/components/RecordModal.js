"use client";

import { useState } from "react";
import { api } from "../lib/api";

const TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "DMARC", "SPF", "DKIM", "NS"];

const PLACEHOLDERS = {
  A: { name: "@", value: "192.0.2.10" },
  AAAA: { name: "@", value: "2001:db8::1" },
  CNAME: { name: "mail", value: "mailgateway.example.com" },
  TXT: { name: "@", value: "v=spf1 include:_spf.example.com ~all" },
  MX: { name: "@", value: "mx.example.com" },
  DMARC: { name: "_dmarc", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com" },
  SPF: { name: "@", value: "v=spf1 include:_spf.example.com ~all" },
  DKIM: { name: "selector1._domainkey", value: "v=DKIM1; k=rsa; p=MIGfMA0GCSq..." },
  NS: { name: "@", value: "ns1.example.com" },
};

export default function RecordModal({ domainId, record, onClose, onSaved }) {
  const isEdit = !!record;
  const [form, setForm] = useState({
    type: record?.type || "TXT",
    name: record?.name || "",
    value: record?.value || "",
    ttl: record?.ttl || 3600,
    priority: record?.priority || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        type: form.type,
        name: form.name,
        value: form.value,
        ttl: Number(form.ttl) || 3600,
        priority: form.priority ? Number(form.priority) : null,
      };
      const data = isEdit
        ? await api.updateRecord(domainId, record.id, payload)
        : await api.createRecord(domainId, payload);
      onSaved(data.record);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const placeholder = PLACEHOLDERS[form.type] || { name: "@", value: "" };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="card w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-slate-900">
          {isEdit ? "Edit record" : "Add DNS record"}
        </h3>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div>
            <label className="label">Record type</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Name / Host</label>
            <input
              required
              className="input"
              placeholder={placeholder.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Value</label>
            <textarea
              required
              rows={3}
              className="input resize-none"
              placeholder={placeholder.value}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">TTL (seconds)</label>
              <input
                type="number"
                className="input"
                value={form.ttl}
                onChange={(e) => setForm({ ...form, ttl: e.target.value })}
              />
            </div>
            {form.type === "MX" && (
              <div>
                <label className="label">Priority</label>
                <input
                  type="number"
                  className="input"
                  placeholder="10"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving..." : isEdit ? "Save changes" : "Add record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
