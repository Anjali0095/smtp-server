"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../lib/api";
import RecordTable from "../../../../components/RecordTable";
import RecordModal from "../../../../components/RecordModal";
import SmtpSettingsForm from "../../../../components/SmtpSettingsForm";

export default function DomainDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [domain, setDomain] = useState(null);
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState("records");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState(null); // null | { record: null|obj }

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [domainData, recordsData] = await Promise.all([
        api.getDomain(id),
        api.listRecords(id),
      ]);
      setDomain(domainData.domain);
      setRecords(recordsData.records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onDeleteRecord = async (recordId) => {
    if (!confirm("Delete this DNS record?")) return;
    try {
      await api.deleteRecord(id, recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    } catch (err) {
      alert(err.message);
    }
  };

  const onVerifyToggle = async () => {
    try {
      const data = await api.updateDomain(id, { verified: !domain.verified });
      setDomain(data.domain);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (error || !domain) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error || "Domain not found"}</div>;
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Back to domains
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{domain.domain_name}</h1>
          <span
            className={`badge mt-2 ${domain.verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
          >
            {domain.verified ? "Verified" : "Pending verification"}
          </span>
        </div>
        <button onClick={onVerifyToggle} className="btn-secondary">
          Mark as {domain.verified ? "unverified" : "verified"}
        </button>
      </div>

      <div className="mt-6 flex gap-1 border-b border-slate-200">
        {[
          { key: "records", label: "DNS records" },
          { key: "smtp", label: "SMTP settings" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "records" ? (
        <div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Add A, AAAA, CNAME, TXT, MX, SPF, DKIM or DMARC records for this domain.
            </p>
            <button onClick={() => setModalState({ record: null })} className="btn-primary">
              + Add record
            </button>
          </div>
          <RecordTable
            records={records}
            onEdit={(record) => setModalState({ record })}
            onDelete={onDeleteRecord}
          />
        </div>
      ) : (
        <SmtpSettingsForm domain={domain} onSaved={(d) => setDomain(d)} />
      )}

      {modalState && (
        <RecordModal
          domainId={id}
          record={modalState.record}
          onClose={() => setModalState(null)}
          onSaved={(record) => {
            setRecords((prev) => {
              const exists = prev.some((r) => r.id === record.id);
              return exists ? prev.map((r) => (r.id === record.id ? record : r)) : [record, ...prev];
            });
            setModalState(null);
          }}
        />
      )}
    </div>
  );
}
