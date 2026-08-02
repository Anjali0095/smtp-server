"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function SmtpSettingsForm({ domain, onSaved }) {
  const [form, setForm] = useState({
    smtp_host: domain.smtp_host || "",
    smtp_port: domain.smtp_port || 587,
    smtp_username: domain.smtp_username || "",
    smtp_password: "",
    smtp_secure: domain.smtp_secure ?? true,
    from_email: domain.from_email || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.smtp_password) delete payload.smtp_password;
      const data = await api.updateDomain(domain.id, payload);
      onSaved(data.domain);
      setForm((f) => ({ ...f, smtp_password: "" }));
      setSuccess("SMTP settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card mt-4 space-y-4 p-6">
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">SMTP host</label>
          <input
            className="input"
            placeholder="smtp.example.com"
            value={form.smtp_host}
            onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
          />
        </div>
        <div>
          <label className="label">SMTP port</label>
          <input
            type="number"
            className="input"
            placeholder="587"
            value={form.smtp_port}
            onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
          />
        </div>
        <div>
          <label className="label">SMTP username</label>
          <input
            className="input"
            placeholder="smtp-user"
            value={form.smtp_username}
            onChange={(e) => setForm({ ...form, smtp_username: e.target.value })}
          />
        </div>
        <div>
          <label className="label">
            SMTP password {domain.has_smtp_password && <span className="text-slate-400">(set — leave blank to keep)</span>}
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.smtp_password}
            onChange={(e) => setForm({ ...form, smtp_password: e.target.value })}
          />
        </div>
        <div>
          <label className="label">From email</label>
          <input
            type="email"
            className="input"
            placeholder="noreply@example.com"
            value={form.from_email}
            onChange={(e) => setForm({ ...form, from_email: e.target.value })}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.smtp_secure}
              onChange={(e) => setForm({ ...form, smtp_secure: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Use TLS / SSL
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : "Save SMTP settings"}
        </button>
      </div>
    </form>
  );
}
