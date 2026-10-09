"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

type DoctorSession = {
  licenseNumber?: string;
  name?: string;
  specialization?: string;
  department?: string;
  hospital?: string;
};

type DoctorInfo = {
  id?: string;
  name?: string;
  specialty?: string;
  specialization?: string;
  department?: string;
  hospital?: string;
};

type Appointment = {
  id?: string;
  doctor?: string | DoctorInfo;
  doctorId?: string;
  date?: string;
  time?: string;
  mode?: string;
  hospital?: string | { name?: string; address?: string };
  specialty?: string;
  patientId?: string;
  patientMobile?: string;
  patientName?: string;
};

type PatientRecord = {
  id?: string;
  mobile?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  abhaId?: string;
};

type InterviewAnswers = Record<string, unknown>;

type RedFlag = {
  detected?: boolean;
  reason?: string;
  detectedAt?: string;
  answers?: InterviewAnswers;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function patientKey(value: string) {
  return value.replace(/\D/g, "");
}

function formatDate(date?: string) {
  if (!date) return "Not available";

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
  if (!doctor) return "Doctor";
  return typeof doctor === "string" ? doctor : doctor.name || "Doctor";
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

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${displayValue(item)}`)
      .join(" · ");
  }

  return String(value);
}

function labelize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function DoctorPatientPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [doctor, setDoctor] = useState<DoctorSession | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [redFlag, setRedFlag] = useState<RedFlag | null>(null);
  const [verified, setVerified] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorRaw = sessionStorage.getItem("medikiosk-doctor");

    if (!doctorRaw) {
      router.replace("/doctor/login");
      return;
    }

    try {
      setDoctor(JSON.parse(doctorRaw));
    } catch {
      sessionStorage.removeItem("medikiosk-doctor");
      router.replace("/doctor/login");
      return;
    }

    const patientId = searchParams.get("patientId") || "";
    const mobileParam = searchParams.get("mobile") || "";
    const appointmentId = searchParams.get("appointmentId") || "";

    let selectedAppointment: Appointment | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("medikiosk-appointment-")) continue;

      const item = readJson<Appointment>(key);
      if (!item) continue;

      const matches =
        (appointmentId && item.id === appointmentId) ||
        (patientId && item.patientId === patientId) ||
        (mobileParam &&
          patientKey(item.patientMobile || "") === patientKey(mobileParam));

      if (matches) {
        selectedAppointment = item;
        break;
      }
    }

    if (!selectedAppointment) {
      const legacy = readJson<Appointment>("medikiosk-appointment");

      if (
        legacy &&
        ((appointmentId && legacy.id === appointmentId) ||
          (patientId && legacy.patientId === patientId) ||
          (mobileParam &&
            patientKey(legacy.patientMobile || "") === patientKey(mobileParam)))
      ) {
        selectedAppointment = legacy;
      }
    }

    if (!selectedAppointment) {
      setLoading(false);
      return;
    }

    setAppointment(selectedAppointment);

    const mobile = patientKey(
      selectedAppointment.patientMobile || mobileParam
    );

    let selectedPatient: PatientRecord | null = null;

    if (mobile) {
      selectedPatient = readJson<PatientRecord>(
        `medikiosk-patient-${mobile}`
      );
    }

    if (!selectedPatient && selectedAppointment.patientId) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("medikiosk-patient-")) continue;

        const item = readJson<PatientRecord>(key);

        if (item?.id === selectedAppointment.patientId) {
          selectedPatient = item;
          break;
        }
      }
    }

    setPatient(
      selectedPatient || {
        id: selectedAppointment.patientId,
        mobile: selectedAppointment.patientMobile,
        fullName: selectedAppointment.patientName,
      }
    );

    if (mobile) {
      const interview = readJson<InterviewAnswers>(
        `medikiosk-interview-${mobile}`
      );

      const flag = readJson<RedFlag>(`medikiosk-red-flag-${mobile}`);

      setAnswers(interview || {});
      setRedFlag(flag || null);

      const savedNotes = localStorage.getItem(
        `medikiosk-doctor-notes-${mobile}`
      );

      if (savedNotes) setNotes(savedNotes);

      setVerified(
        localStorage.getItem(`medikiosk-doctor-verified-${mobile}`) ===
          "true"
      );
    }

    setLoading(false);
  }, [router, searchParams]);

  const answerEntries = useMemo(() => {
    return Object.entries(answers).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
    );
  }, [answers]);

  const patientAge = useMemo(() => {
    if (!patient?.dob) return null;

    const dob = new Date(patient.dob);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const month = today.getMonth() - dob.getMonth();

    if (
      month < 0 ||
      (month === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }, [patient?.dob]);

  function saveDoctorReview() {
    const mobile = patientKey(patient?.mobile || appointment?.patientMobile || "");

    if (!mobile) return;

    localStorage.setItem(
      `medikiosk-doctor-notes-${mobile}`,
      notes
    );

    localStorage.setItem(
      `medikiosk-doctor-verified-${mobile}`,
      verified ? "true" : "false"
    );

    alert(
      verified
        ? "Case summary verified and doctor notes saved."
        : "Doctor notes saved."
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#61716C]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#CBD8D4] border-t-[#365A91]" />
          Loading patient record...
        </div>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="min-h-screen bg-[#F6F8F7] px-4 py-10 text-[#17332D]">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#DDE7E3] bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#A36B16]" />
          <h1 className="mt-4 text-2xl font-semibold">
            Patient record not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71817D]">
            The selected appointment or patient record could not be found in
            the current prototype storage.
          </p>
          <button
            type="button"
            onClick={() => router.push("/doctor/dashboard")}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#365A91] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2E4E7D]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const patientName =
    patient?.fullName ||
    appointment.patientName ||
    (patient?.mobile
      ? `Patient ${patient.mobile.slice(-4)}`
      : "Patient");

  const mobile = patient?.mobile || appointment.patientMobile || "";

  return (
    <main className="min-h-screen bg-[#F6F8F7] text-[#17332D]">
      <header className="sticky top-0 z-30 border-b border-[#DDE7E3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/doctor/dashboard")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#D7E1DE] bg-white hover:bg-[#F5F8F6]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5 text-[#365A91]" />
            </button>

            <div>
              <p className="font-semibold tracking-tight">MEDIKIOSK</p>
              <p className="text-xs text-[#71817D]">
                Patient Case Workspace
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">
              Dr. {doctor?.name || "Doctor"}
            </p>
            <p className="text-xs text-[#71817D]">
              {doctor?.specialization || doctor?.department || "Doctor"}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/doctor/dashboard")}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#365A91] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to patient queue
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EEF3F9] px-3 py-1 text-xs font-semibold text-[#365A91]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Doctor verification workspace
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {patientName}
              </h1>

              <p className="mt-1 text-sm text-[#71817D]">
                Patient ID: {patient?.id || appointment.patientId || "Not available"}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm shadow-sm border border-[#DDE7E3]">
              <Stethoscope className="h-4 w-4 text-[#365A91]" />
              AI prepares information. Doctor makes the final clinical decision.
            </div>
          </div>
        </div>

        {/* Patient + appointment */}
        <section className="mb-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5F2] text-[#2D6657]">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#365A91]">
                  Patient profile
                </p>
                <h2 className="text-xl font-semibold">{patientName}</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F7F9F8] p-4">
                <p className="text-xs text-[#71817D]">Age</p>
                <p className="mt-1 font-semibold">
                  {patientAge !== null ? `${patientAge} years` : "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-[#F7F9F8] p-4">
                <p className="text-xs text-[#71817D]">Gender</p>
                <p className="mt-1 font-semibold">
                  {patient?.gender || "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-[#F7F9F8] p-4 sm:col-span-2">
                <p className="text-xs text-[#71817D]">Mobile</p>
                <p className="mt-1 flex items-center gap-2 font-semibold">
                  <Phone className="h-4 w-4 text-[#365A91]" />
                  {mobile || "Not available"}
                </p>
              </div>

              <div className="rounded-xl bg-[#F7F9F8] p-4 sm:col-span-2">
                <p className="text-xs text-[#71817D]">ABHA ID</p>
                <p className="mt-1 font-semibold">
                  {patient?.abhaId || "Not linked"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#365A91]">
                  Appointment
                </p>
                <h2 className="mt-1 text-xl font-semibold">Consultation details</h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5F2] text-[#2D6657]">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-[#F7F9F8] p-4">
                <p className="text-xs text-[#71817D]">Doctor</p>
                <p className="mt-1 font-semibold">
                  {getDoctorName(appointment.doctor)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[#F7F9F8] p-4">
                  <p className="text-xs text-[#71817D]">Date</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <CalendarDays className="h-4 w-4 text-[#365A91]" />
                    {formatDate(appointment.date)}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F7F9F8] p-4">
                  <p className="text-xs text-[#71817D]">Time</p>
                  <p className="mt-1 flex items-center gap-2 font-semibold">
                    <Clock3 className="h-4 w-4 text-[#365A91]" />
                    {appointment.time || "Not available"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#F7F9F8] p-4">
                <p className="text-xs text-[#71817D]">Location</p>
                <p className="mt-1 flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 text-[#365A91]" />
                  {getHospitalName(appointment.hospital, appointment.doctor)}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#EAF5F2] p-4">
                <span className="text-sm text-[#527069]">Consultation mode</span>
                <span className="font-semibold capitalize">
                  {appointment.mode || "In-person"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Red flags */}
        <section className="mb-6">
          {redFlag?.detected ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-red-900">
                      Red flag alert
                    </h2>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Requires review
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-red-800">
                    {redFlag.reason ||
                      "The intake system detected information that requires clinician review."}
                  </p>

                  <p className="mt-3 text-xs text-red-700">
                    AI alert only — verify the underlying patient response before
                    taking clinical action.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5F2] text-[#2D6657]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">No red flag detected</h2>
                  <p className="text-xs text-[#71817D]">
                    Continue with normal clinical review. This is not a diagnosis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* AI summary */}
        <section className="mb-6 rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#365A91]">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#365A91]">
                  AI-generated case summary
                </p>
                <h2 className="text-xl font-semibold">Structured intake history</h2>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E7] px-3 py-1.5 text-xs font-semibold text-[#8B641F]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Doctor verification required
            </span>
          </div>

          {answerEntries.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#CBD8D4] bg-[#F8FAF9] p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-[#879691]" />
              <p className="mt-3 font-semibold">No interview responses found</p>
              <p className="mt-1 text-sm text-[#71817D]">
                This patient has not completed a structured intake in the current
                prototype.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {answerEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-[#E1E9E6] bg-[#FAFCFB] p-4"
                >
                  <p className="text-xs font-medium text-[#71817D]">
                    {labelize(key)}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#17332D]">
                    {displayValue(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Review */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5F2] text-[#2D6657]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Uploaded reports</h2>
                <p className="text-xs text-[#71817D]">
                  Document intelligence workspace
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-[#CBD8D4] bg-[#F8FAF9] p-6 text-center">
              <FileText className="mx-auto h-8 w-8 text-[#879691]" />
              <p className="mt-3 font-semibold">No linked report preview</p>
              <p className="mt-1 text-xs leading-5 text-[#71817D]">
                Uploaded documents can be connected to this patient record when
                document storage is integrated with the backend.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DDE7E3] bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-[#365A91]">
                Doctor review
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Verify before consultation
              </h2>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#DDE7E3] bg-[#F8FAF9] p-4">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer accent-[#365A91]"
              />
              <span>
                <span className="block text-sm font-semibold">
                  I have reviewed the AI-prepared information
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#71817D]">
                  The AI summary is an assistive record and does not replace
                  clinical judgement.
                </span>
              </span>
            </label>

            <div className="mt-4">
              <label
                htmlFor="doctorNotes"
                className="mb-2 block text-sm font-medium"
              >
                Doctor notes
              </label>

              <textarea
                id="doctorNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add clinical observations or consultation notes..."
                rows={7}
                className="w-full resize-none rounded-2xl border border-[#D7E1DE] bg-white p-4 text-sm outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
              />
            </div>

            <button
              type="button"
              onClick={saveDoctorReview}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#365A91] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2E4E7D]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Save Doctor Review
            </button>

            <button
              type="button"
              onClick={() => alert("Consultation workspace is ready for backend integration.")}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D7E1DE] bg-white py-3.5 text-sm font-semibold text-[#365A91] transition hover:bg-[#F5F8FC]"
            >
              <Stethoscope className="h-4 w-4" />
              Start Consultation
            </button>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#DDE7E3] py-5 text-xs text-[#82918D] sm:flex-row">
          <span>MEDIKIOSK · Smart India Hackathon 2026</span>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Doctor Portal
          </span>
        </footer>
      </div>
    </main>
  );
}

export default function DoctorPatientPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#61716C]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#CBD8D4] border-t-[#365A91]" />
            Loading patient record...
          </div>
        </main>
      }
    >
      <DoctorPatientPageContent />
    </Suspense>
  );
}