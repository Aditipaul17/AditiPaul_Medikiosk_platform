"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  FileText,
  Sparkles,
  Navigation,
  CalendarDays,
  Siren,
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface PatientNavProps {
  currentStep?: "intake" | "documents" | "summary" | "care-navigation" | "booking";
}

export default function PatientNav({ currentStep }: PatientNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patientName, setPatientName] = useState<string>("Patient");
  const [patientId, setPatientId] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("medikiosk-current-patient");
      if (raw) {
        const p = JSON.parse(raw);
        setPatientName(p?.fullName || p?.name || "Patient");
        setPatientId(p?.id || (p?.mobile ? `P-${p.mobile.slice(-4)}` : ""));
      } else {
        // Safe default demo identity if not logged in
        setPatientName("Guest Patient");
      }
    } catch {
      setPatientName("Guest Patient");
    }
  }, []);

  const navLinks = [
    {
      name: "Dashboard",
      href: "/patient/home",
      icon: LayoutDashboard,
      active: pathname === "/patient/home",
    },
    {
      name: "Intake",
      href: "/patient/intake",
      icon: Stethoscope,
      active: pathname === "/patient/intake",
    },
    {
      name: "Documents",
      href: "/patient/documents",
      icon: FileText,
      active: pathname === "/patient/documents",
    },
    {
      name: "AI Summary",
      href: "/patient/summary",
      icon: Sparkles,
      active: pathname === "/patient/summary",
    },
    {
      name: "Care Navigation",
      href: "/patient/care-navigation",
      icon: Navigation,
      active: pathname === "/patient/care-navigation",
    },
    {
      name: "Book Appointment",
      href: "/patient/booking",
      icon: CalendarDays,
      active: pathname === "/patient/booking",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E1E5E3] bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/patient/home"
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B7A6B] text-white shadow-sm transition group-hover:bg-[#155F53]">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-[family-name:var(--font-heading)] font-black text-base tracking-tight text-[#10201D]">
                  MEDIKIOSK
                </span>
                <span className="rounded-md bg-[#E6F2EF] px-1.5 py-0.5 text-[10px] font-bold text-[#1B7A6B]">
                  PATIENT
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#5C6B67] leading-none">
                AI Clinical & Care Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  item.active
                    ? "bg-[#1B7A6B] text-white shadow-xs"
                    : "text-[#4A5754] hover:text-[#10201D] hover:bg-[#F4F6F5]"
                }`}
              >
                <Icon className={`h-4 w-4 ${item.active ? "text-white" : "text-[#7B8B87]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side Actions (SOS + Profile + Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency SOS Button */}
          <Link
            href="/patient/emergency"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              pathname === "/patient/emergency"
                ? "bg-red-600 text-white shadow-sm ring-2 ring-red-400"
                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white"
            }`}
          >
            <Siren className="h-4 w-4 animate-pulse" />
            <span className="font-extrabold tracking-wide">SOS</span>
          </Link>

          {/* User Profile Pill */}
          <Link
            href="/patient/home"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-[#E1E5E3] bg-[#FAFBFA] px-2.5 py-1 text-xs text-[#10201D] hover:bg-[#F0F2F1] transition"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F2EF] text-[#1B7A6B]">
              <UserRound className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="block font-semibold leading-tight line-clamp-1 max-w-[100px]">
                {patientName.split(" ")[0]}
              </span>
              {patientId && (
                <span className="block text-[10px] text-[#7B8B87] leading-none">
                  {patientId}
                </span>
              )}
            </div>
          </Link>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#E1E5E3] text-[#4A5754] hover:bg-[#F4F6F5] transition"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E1E5E3] bg-white px-4 py-3 shadow-lg">
          <div className="grid gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                    item.active
                      ? "bg-[#1B7A6B] text-white"
                      : "text-[#3D4C48] hover:bg-[#F4F6F5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[#E1E5E3] flex items-center justify-between px-2">
              <Link
                href="/patient/home"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#5C6B67] hover:underline"
              >
                Logged in as <b>{patientName}</b>
              </Link>
              <Link
                href="/patient/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                Switch User
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
