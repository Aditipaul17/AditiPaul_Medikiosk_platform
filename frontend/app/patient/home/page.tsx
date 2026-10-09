"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

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
    const currentPatient = readJson<Patient>("medikiosk-current-patient");

    if (!currentPatient?.mobile) {
      router.replace("/patient/login");
      return;
    }

    setPatient(currentPatient);

    const mobileKey = getPatientKey(currentPatient.mobile);
    const patientAppointment = readJson<Appointment>(
      `medikiosk-appointment-${mobileKey}`
    );

    if (patientAppointment) {
      setAppointment(patientAppointment);
    } else {
      // Legacy migration: only use the old global appointment
      // if it belongs to the currently logged-in patient.
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
  }, [router]);

  const firstName = useMemo(() => {
    const name = patient?.fullName?.trim();
    return name ? name.split(/\s+/)[0] : "there";
  }, [patient]);

  function handleLogout() {
    // Important: keep appointment + patient record intact.
    localStorage.removeItem("medikiosk-current-patient");
    router.push("/patient/login");
  }

  function startNewConsultation() {
    router.push("/patient/language");
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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-900">MediKiosk</div>
              <div className="text-xs text-slate-500">
                Patient Health Portal
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-700 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your health information is protected
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Welcome back, {firstName} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50 sm:text-base">
                Your patient information, appointment and consultation journey
                are available in one place.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/10 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-teal-100">Patient ID</p>
                <p className="font-semibold">{patient?.id || "Not available"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Appointment */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-teal-600">
                  Upcoming appointment
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {appointment ? "Your consultation is scheduled" : "No appointment yet"}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            {appointment ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirmed
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {getDoctorName(appointment.doctor)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {getDoctorSpecialty(appointment.doctor, appointment.specialty)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-4 py-3 text-left shadow-sm sm:min-w-36">
                    <p className="text-xs text-slate-500">Appointment ID</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {appointment.id || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <CalendarDays className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(appointment.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <Clock3 className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-slate-500">Time</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {appointment.time || "Time not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-slate-500">Consultation</p>
                      <p className="text-sm font-semibold capitalize text-slate-800">
                        {appointment.mode || "In-person"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {getHospitalName(appointment.hospital, appointment.doctor)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  You have no upcoming appointment
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Start your consultation journey to find a suitable doctor
                  and book an appointment.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/patient/care-navigation")}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Find a doctor
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {appointment && (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/patient/summary")}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4" />
                  View health summary
                </button>

                <button
                  type="button"
                  onClick={startNewConsultation}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Tell us what&apos;s new
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>

          {/* Patient details + quick actions */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Patient details</h2>
                  <p className="text-xs text-slate-500">Your registered information</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Full name</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.fullName || "Not available"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                      {patient?.gender || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">DOB</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {patient?.dob || "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.mobile || "Not available"}
                  </p>
                </div>

                {patient?.abhaId && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">ABHA ID</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {patient.abhaId}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-900">Quick actions</h2>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => router.push("/patient/documents")}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        My documents
                      </span>
                      <span className="block text-xs text-slate-500">
                        Reports & prescriptions
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/patient/care-navigation")}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-teal-600" />
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        Find care
                      </span>
                      <span className="block text-xs text-slate-500">
                        Doctors & specialists
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/patient/emergency")}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3 text-left transition hover:bg-red-100"
                >
                  <span className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <span>
                      <span className="block text-sm font-semibold text-red-700">
                        Emergency help
                      </span>
                      <span className="block text-xs text-red-600/80">
                        Get urgent assistance
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom reassurance */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Consent-first sharing
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your information is shared with healthcare providers only with
                appropriate consent.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Multilingual support
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Continue your intake in your preferred language.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Doctor stays in control
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                AI organizes information; your doctor verifies and decides
                your care.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
