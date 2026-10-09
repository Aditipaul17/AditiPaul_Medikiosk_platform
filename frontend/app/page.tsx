import Link from "next/link";
import { Activity, UserRound, Stethoscope, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">
      {/* Top bar */}
      <header className="w-full px-6 sm:px-10 py-6 flex items-center gap-2 fade-in-item" style={{ animationDelay: "0ms" }}>
        <div className="w-8 h-8 rounded-md bg-[#10201D] flex items-center justify-center">
          <Activity className="w-4.5 h-4.5 text-[#F6F7F5]" strokeWidth={2.5} />
        </div>
        <span className="font-[family-name:var(--font-heading)] font-semibold text-[#10201D] tracking-tight">
           MEDIKIOSK
        </span>
      </header>

      {/* Hero + role selection */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16">
        <div className="max-w-2xl text-center fade-in-item" style={{ animationDelay: "80ms" }}>
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[#10201D] text-4xl sm:text-5xl tracking-tight">
            MEDIKIOSK
          </h1>
          <p className="mt-4 text-[#5C6B67] text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            AI-powered patient case-taking &amp; care platform
          </p>
        </div>

        {/* Role cards */}
        <div className="mt-12 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Patient */}
          <Link
            href="/patient/login"
            className="group fade-in-item"
            style={{ animationDelay: "180ms" }}
          >
            <div className="relative h-full bg-white rounded-xl border border-[#E1E5E3] pl-6 pr-6 py-8 sm:py-10 flex flex-col gap-5 transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
              <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-[#1B7A6B] transition-[width] duration-200 group-hover:w-2" />
              <div className="w-12 h-12 rounded-lg bg-[#E6F2EF] flex items-center justify-center">
                <UserRound className="w-6 h-6 text-[#1B7A6B]" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h2 className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[#10201D]">
                  Patient
                </h2>
                <p className="mt-2 text-[#5C6B67] text-sm leading-relaxed">
                  Record your symptoms, medical history and records.
                </p>
              </div>
              <div className="mt-auto pt-2 inline-flex items-center gap-2 text-[#1B7A6B] font-medium text-sm min-h-[44px] items-center">
                Continue as Patient
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Doctor */}
          <Link
            href="/doctor/login"
            className="group fade-in-item"
            style={{ animationDelay: "260ms" }}
          >
            <div className="relative h-full bg-white rounded-xl border border-[#E1E5E3] pl-6 pr-6 py-8 sm:py-10 flex flex-col gap-5 transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
              <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl bg-[#2F4C7A] transition-[width] duration-200 group-hover:w-2" />
              <div className="w-12 h-12 rounded-lg bg-[#E9EEF6] flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-[#2F4C7A]" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h2 className="font-[family-name:var(--font-heading)] font-semibold text-xl text-[#10201D]">
                  Doctor
                </h2>
                <p className="mt-2 text-[#5C6B67] text-sm leading-relaxed">
                  Review AI-assisted patient case summaries.
                </p>
              </div>
              <div className="mt-auto pt-2 inline-flex items-center gap-2 text-[#2F4C7A] font-medium text-sm min-h-[44px]">
                Continue as Doctor
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-[#8A9591] fade-in-item" style={{ animationDelay: "320ms" }}>
        Smart India Hackathon 2026 · Problem Statement SIH 26047
      </footer>

      <style>{`
        @keyframes fadeRiseIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-item {
          animation: fadeRiseIn 0.5s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-item { animation: none; }
        }
      `}</style>
    </main>
  );
}
