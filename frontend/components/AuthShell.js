export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6l9 6 9-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="2"/>
            </svg>
          </span>
          SMTP Manager
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Manage your sending domains and DNS records in one place.
          </h2>
          <p className="mt-4 max-w-sm text-brand-100">
            Connect domains, configure A, CNAME, TXT, MX, SPF, DKIM and DMARC records, and keep your SMTP credentials secure.
          </p>
        </div>
        <p className="text-sm text-brand-100/70">© {new Date().getFullYear()} SMTP Manager</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
