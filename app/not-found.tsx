import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  LockKeyhole,
  Search,
  ShieldAlert,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 selection:bg-blue-100 selection:text-blue-950 dark:bg-slate-950 dark:text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />

      <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/20 blur-3xl dark:bg-blue-900/20" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-3xl">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/30 sm:p-8 md:p-10">
            {/* Top badge */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                <ShieldAlert className="h-4 w-4" />
                Karibu VMS Security
              </div>

              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 sm:block">
                Error 404
              </div>
            </div>

            {/* Main content */}
            <div className="grid items-center gap-8 md:grid-cols-[1fr_0.75fr]">
              <div>
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300/60 dark:bg-white dark:text-slate-950 dark:shadow-black/30">
                  <LockKeyhole className="h-8 w-8" />
                </div>

                <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">
                  Page not found
                </p>

                <h1 className="mb-4 text-6xl font-black tracking-tight text-slate-950 dark:text-white sm:text-7xl md:text-8xl">
                  404
                </h1>

                <h2 className="mb-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  This gate does not exist.
                </h2>

                <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  The page you are looking for may have been moved, deleted, or
                  you may not have permission to access this area.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0 dark:focus:ring-blue-900"
                  >
                    <Home className="h-4 w-4" />
                    Go to homepage
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus:ring-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>

              {/* Visual card */}
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl" />

                <div className="relative rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600 dark:bg-red-500/10 dark:text-red-300">
                      Access denied
                    </span>
                  </div>

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                      <Search className="h-8 w-8" />
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Route unavailable
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Karibu VMS could not find a matching page for this
                      request.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        Not Found
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Code
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                        404
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-slate-200 pt-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-400 dark:border-white/10">
              Secure visitor management by Karibu VMS
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


