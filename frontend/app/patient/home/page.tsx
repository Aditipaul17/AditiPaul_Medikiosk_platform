"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Sparkles,
  Navigation,
  Siren,
  Activity,
  Check,
} from "lucide-react";
import PatientNav from "../../components/PatientNav";

type Patient = {
  id?: string;
  mobile?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  abhaId?: string;
};

type DoctorInfo = {
  id?: string;
  name?: string;
  specialty?: string;
  hospital?: string;
  experience?: string;
  rating?: number | string;
  nextSlot?: string;
  fee?: number | string;
};

type Appointment = {
  id?: string;
  doctor?: string | DoctorInfo;
  date?: string;
  time?: string;
  mode?: string;
  hospital?: string | { name?: string; address?: string };
  specialty?: string;
  patientId?: string;
  patientMobile?: string;
  bookedAt?: string;
};

function getPatientKey(mobile: string) {
  return mobile.replace(/\D/g, "");
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(date?: string) {
  if (!date) return "Date not available";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDoctorName(doctor?: string | DoctorInfo) {
  if (!doctor) return "Doctor consultation";
  if (typeof doctor === "string") return doctor;
  return doctor.name || "Doctor consultation";
}

function getDoctorSpecialty(
  doctor?: string | DoctorInfo,
  specialty?: string
) {
  if (specialty) return specialty;
  if (doctor && typeof doctor !== "string") {
    return doctor.specialty || "Medical consultation";
  }
  return "Medical consultation";
}

function getHospitalName(
  hospital?: string | { name?: string; address?: string },
  doctor?: string | DoctorInfo
) {
  if (typeof hospital === "string" && hospital) return hospital;
  if (hospital && typeof hospital === "object" && hospital.name) {
    return hospital.name;
  }
  if (doctor && typeof doctor !== "string" && doctor.hospital) {
    return doctor.hospital;
  }
  return "Hospital / Clinic";
}

export default function PatientHome() {
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentPatient = readJson<Patient>("medikiosk-current-patient");

    // Provide friendly demo fallback if not yet signed in
    if (!currentPatient?.mobile) {
      currentPatient = {
        id: "P-9876",
        fullName: "Rahul Verma",
        mobile: "9876543210",
        dob: "1994-08-15",
        gender: "Male",
        abhaId: "91-8840-2910-4491",
      };
      localStorage.setItem("medikiosk-current-patient", JSON.stringify(currentPatient));
    }

    setPatient(currentPatient);

    const mobileKey = getPatientKey(currentPatient.mobile);
    const patientAppointment = readJson<Appointment>(
      `medikiosk-appointment-${mobileKey}`
    );

    if (patientAppointment) {
      setAppointment(patientAppointment);
    } else {
      const legacy = readJson<Appointment>("medikiosk-appointment");
      if (
        legacy?.patientMobile &&
        getPatientKey(String(legacy.patientMobile)) === mobileKey
      ) {
        setAppointment(legacy);
        localStorage.setItem(
          `medikiosk-appointment-${mobileKey}`,
          JSON.stringify(legacy)
        );
      }
    }

    setLoading(false);
  }, []);

  const firstName = useMemo(() => {
    const name = patient?.fullName?.trim();
    return name ? name.split(/\s+/)[0] : "there";
  }, [patient]);

  function handleLogout() {
    localStorage.removeItem("medikiosk-current-patient");
    router.push("/patient/login");
  }

  function startNewConsultation() {
    router.push("/patient/intake");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
          Loading your MediKiosk...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8F7] text-[#10201D]">
      {/* Unified Patient Navigation Bar */}
      <PatientNav />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B7A6B] to-[#2563EB] p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                ABDM &amp; DPDP Act 2023 Protected
              </div>

              <h1 className="text-2xl font-black sm:text-3xl">
                Welcome back, {firstName} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/90">
                Your patient health profile, AI clinical assessments, medical documents, and appointment navigation are systematically organized here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 sm:p-4 backdrop-blur-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-white/80">Patient ID</p>
                  <p className="font-bold text-sm">{patient?.id || "P-9876"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/15 px-3 py-3 text-xs font-bold text-white hover:bg-white/25 transition"
                title="Switch account"
              >
                <LogOut className="h-4 w-4" />
                <span>Switch User</span>
              </button>
            </div>
          </div>
        </section>

        {/* Clinical Journey Stepper */}
        <section className="rounded-2xl border border-[#DCE1DF] bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#10201D] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1B7A6B]" />
                Your Clinical Intake Workflow
              </h2>
              <p className="text-xs text-[#5C6B67]">
                Follow the 5-step patient pathway to complete your doctor-ready case summary.
              </p>
            </div>
            <button
              type="button"
              onClick={startNewConsultation}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1B7A6B] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#155F53] transition self-start sm:self-auto"
            >
              <span>Start New Intake</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            <Link
              href="/patient/intake"
              className="group flex flex-col justify-between rounded-xl border border-[#E1E5E3] bg-[#FAFBFA] p-3 hover:border-[#1B7A6B] hover:bg-white transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F2EF] text-xs font-bold text-[#1B7A6B]">
                  1
                </span>
                <Stethoscope className="h-4 w-4 text-[#7B8B87] group-hover:text-[#1B7A6B]" />
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-[#10201D] group-hover:text-[#1B7A6B]">
                  Symptom Intake
                </h3>
                <p className="text-[10px] text-[#7B8B87]">Voice &amp; Body Map</p>
              </div>
            </Link>

            <Link
              href="/patient/documents"
              className="group flex flex-col justify-between rounded-xl border border-[#E1E5E3] bg-[#FAFBFA] p-3 hover:border-[#1B7A6B] hover:bg-white transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F2EF] text-xs font-bold text-[#1B7A6B]">
                  2
                </span>
                <FileText className="h-4 w-4 text-[#7B8B87] group-hover:text-[#1B7A6B]" />
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-[#10201D] group-hover:text-[#1B7A6B]">
                  Documents &amp; OCR
                </h3>
                <p className="text-[10px] text-[#7B8B87]">Prescriptions &amp; Labs</p>
              </div>
            </Link>

            <Link
              href="/patient/summary"
              className="group flex flex-col justify-between rounded-xl border border-[#E1E5E3] bg-[#FAFBFA] p-3 hover:border-[#2F4C7A] hover:bg-white transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9EEF6] text-xs font-bold text-[#2F4C7A]">
                  3
                </span>
                <Sparkles className="h-4 w-4 text-[#7B8B87] group-hover:text-[#2F4C7A]" />
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-[#10201D] group-hover:text-[#2F4C7A]">
                  AI Summary
                </h3>
                <p className="text-[10px] text-[#7B8B87]">SOCRATES Clinical</p>
              </div>
            </Link>

            <Link
              href="/patient/care-navigation"
              className="group flex flex-col justify-between rounded-xl border border-[#E1E5E3] bg-[#FAFBFA] p-3 hover:border-[#1B7A6B] hover:bg-white transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F2EF] text-xs font-bold text-[#1B7A6B]">
                  4
                </span>
                <Navigation className="h-4 w-4 text-[#7B8B87] group-hover:text-[#1B7A6B]" />
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-[#10201D] group-hover:text-[#1B7A6B]">
                  Care Navigation
                </h3>
                <p className="text-[10px] text-[#7B8B87]">Hospitals &amp; Doctors</p>
              </div>
            </Link>

            <Link
              href="/patient/booking"
              className="group col-span-2 sm:col-span-1 flex flex-col justify-between rounded-xl border border-[#E1E5E3] bg-[#FAFBFA] p-3 hover:border-emerald-700 hover:bg-white transition"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                  5
                </span>
                <CalendarDays className="h-4 w-4 text-[#7B8B87] group-hover:text-emerald-700" />
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold text-[#10201D] group-hover:text-emerald-700">
                  Book Slot
                </h3>
                <p className="text-[10px] text-[#7B8B87]">OPD &amp; Teleconsult</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Main Grid: Upcoming Appointment & Patient Profile */}
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Appointment Section */}
          <section className="rounded-3xl border border-[#DCE1DF] bg-white p-5 shadow-xs sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#1B7A6B] tracking-wide uppercase">
                    Upcoming Consultation
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#10201D]">
                    {appointment ? "Your consultation is scheduled" : "No appointment yet"}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F2EF] text-[#1B7A6B]">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              {appointment ? (
                <div className="rounded-2xl border border-[#C6DDD7] bg-[#F4F9F8] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1B7A6B] shadow-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmed Slot
                      </div>

                      <h3 className="text-lg font-bold text-[#10201D]">
                        {getDoctorName(appointment.doctor)}
                      </h3>

                      <p className="mt-0.5 text-xs text-[#5C6B67]">
                        {getDoctorSpecialty(appointment.doctor, appointment.specialty)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-2 text-left shadow-xs">
                      <p className="text-[10px] text-[#7B8B87] uppercase font-bold">Appointment ID</p>
                      <p className="mt-0.5 text-xs font-black text-[#10201D]">
                        {appointment.id || "APT-2026"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                      <CalendarDays className="h-4 w-4 text-[#1B7A6B]" />
                      <div>
                        <p className="text-[10px] text-[#7B8B87]">Date</p>
                        <p className="text-xs font-bold text-[#10201D]">
                          {formatDate(appointment.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                      <Clock3 className="h-4 w-4 text-[#1B7A6B]" />
                      <div>
                        <p className="text-[10px] text-[#7B8B87]">Time Slot</p>
                        <p className="text-xs font-bold text-[#10201D]">
                          {appointment.time || "10:00 AM"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                      <Stethoscope className="h-4 w-4 text-[#1B7A6B]" />
                      <div>
                        <p className="text-[10px] text-[#7B8B87]">Consultation Mode</p>
                        <p className="text-xs font-bold capitalize text-[#10201D]">
                          {appointment.mode || "In-person OPD"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl bg-white p-3 shadow-xs">
                      <MapPin className="h-4 w-4 text-[#1B7A6B]" />
                      <div>
                        <p className="text-[10px] text-[#7B8B87]">Location</p>
                        <p className="text-xs font-bold text-[#10201D] line-clamp-1">
                          {getHospitalName(appointment.hospital, appointment.doctor)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#DCE1DF] bg-[#FAFBFA] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#7B8B87] shadow-xs">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-[#10201D]">
                    No Upcoming Appointment
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#5C6B67]">
                    You can discover nearby hospitals and book an instant OPD consultation slot anytime.
                  </p>
                  <Link
                    href="/patient/booking"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B7A6B] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#155F53] transition"
                  >
                    <span>Book an Appointment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-[#EEF2F0]">
              <Link
                href="/patient/summary"
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE1DF] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#10201D] hover:bg-[#FAFBFA] transition"
              >
                <Sparkles className="h-4 w-4 text-[#2F4C7A]" />
                <span>View AI Summary</span>
              </Link>

              <Link
                href="/patient/documents"
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE1DF] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#10201D] hover:bg-[#FAFBFA] transition"
              >
                <FileText className="h-4 w-4 text-[#1B7A6B]" />
                <span>Attached Documents</span>
              </Link>

              <Link
                href="/patient/care-navigation"
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE1DF] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#10201D] hover:bg-[#FAFBFA] transition"
              >
                <Navigation className="h-4 w-4 text-[#1B7A6B]" />
                <span>Explore Care Centers</span>
              </Link>
            </div>
          </section>

          {/* Patient Profile & Safety Status */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#DCE1DF] bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F2EF] text-[#1B7A6B]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[#10201D]">Patient Details</h2>
                  <p className="text-[11px] text-[#5C6B67]">ABDM Registered Identity</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="rounded-xl bg-[#FAFBFA] border border-[#EEF2F0] p-3">
                  <p className="text-[10px] text-[#7B8B87]">Full Name</p>
                  <p className="font-bold text-[#10201D] mt-0.5">
                    {patient?.fullName || "Rahul Verma"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#FAFBFA] border border-[#EEF2F0] p-3">
                    <p className="text-[10px] text-[#7B8B87]">Gender</p>
                    <p className="font-bold text-[#10201D] mt-0.5 capitalize">
                      {patient?.gender || "Male"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAFBFA] border border-[#EEF2F0] p-3">
                    <p className="text-[10px] text-[#7B8B87]">DOB</p>
                    <p className="font-bold text-[#10201D] mt-0.5">
                      {patient?.dob || "1994-08-15"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAFBFA] border border-[#EEF2F0] p-3">
                  <p className="text-[10px] text-[#7B8B87]">Mobile</p>
                  <p className="font-bold text-[#10201D] mt-0.5">
                    {patient?.mobile || "9876543210"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAFBFA] border border-[#EEF2F0] p-3">
                  <p className="text-[10px] text-[#7B8B87]">ABHA ID</p>
                  <p className="font-bold text-[#1B7A6B] mt-0.5">
                    {patient?.abhaId || "91-8840-2910-4491"}
                  </p>
                </div>
              </div>
            </section>

            {/* Emergency SOS Shortcut */}
            <section className="rounded-3xl border border-red-200 bg-red-50/50 p-5 shadow-xs">
              <div className="flex items-center gap-2.5 text-red-700">
                <Siren className="h-5 w-5 animate-pulse" />
                <h3 className="font-bold text-sm">Emergency Triage Alert</h3>
              </div>
              <p className="mt-1.5 text-xs text-red-900/80 leading-relaxed">
                If you experience chest pain, breathlessness, or stroke symptoms, activate immediate emergency triage.
              </p>
              <Link
                href="/patient/emergency"
                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Open Emergency SOS (108 / 112)</span>
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
