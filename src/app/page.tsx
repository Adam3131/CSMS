import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-slate-50 font-sans text-slate-900 p-6">
      <main className="flex w-full max-w-2xl flex-col items-center justify-between rounded-2xl border border-slate-200/60 bg-white py-16 px-10 shadow-xl sm:items-start">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg shadow-md shadow-blue-500/10">
            C
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            CSMS Portal
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left mt-12">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Secure Portal
          </span>
          <h1 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Cloud Services Management Suite
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-500">
            Automate infrastructure orchestration, monitor telemetry logs, and scale security compliance under a single unified dashboard.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 text-sm font-semibold sm:flex-row w-full sm:w-auto mt-10">
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-8 text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-center sm:w-[160px]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] text-center sm:w-[140px]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] text-center sm:w-[140px]"
          >
            Sign Up
          </Link>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 mt-12">
          &copy; {new Date().getFullYear()} CSMS Inc. All rights reserved.
        </div>
      </main>
    </div>
  );
}
