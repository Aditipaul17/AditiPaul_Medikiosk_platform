"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
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
  patientName?: string;
  bookedAt?: string;
};

type PatientRecord = {
  id?: string;
  mobile?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  abhaId?: string;
};

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDoctorName(doctor?: string | DoctorInfo) {
  if (!doctor) return "Doctor";
  if (typeof doctor === "string") return doctor;
  return doctor.name || "Doctor";
}

function getDoctorSpecialty(
  doctor?: string | DoctorInfo,
  specialty?: string
) {
  if (specialty) return specialty;
  if (doctor && typeof doctor !== "string") {
    return doctor.specialty || doctor.specialization || "Medical consultation";
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

function getAppointmentDate(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function DoctorDashboardPage() {
  const router = useRouter();

  const [doctor, setDoctor] = useState<DoctorSession | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawDoctor = sessionStorage.getItem("medikiosk-doctor");

    if (!rawDoctor) {
      router.replace("/doctor/login");
      return;
    }

    try {
      setDoctor(JSON.parse(rawDoctor));
    } catch {
      sessionStorage.removeItem("medikiosk-doctor");
      router.replace("/doctor/login");
      return;
    }

    const loadedAppointments: Appointment[] = [];

    // Current prototype stores the latest appointment per patient.
    // Read all localStorage entries so the doctor can see the patient queue.
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key?.startsWith("medikiosk-appointment-")) continue;

      const appointment = readJson<Appointment>(key);
      if (appointment) loadedAppointments.push(appointment);
    }

    // Backward compatibility with the old global appointment key.
    const legacyAppointment = readJson<Appointment>("medikiosk-appointment");
    if (
      legacyAppointment &&
      !loadedAppointments.some((item) => item.id === legacyAppointment.id)
    ) {
      loadedAppointments.push(legacyAppointment);
    }

    const loadedPatients: PatientRecord[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key?.startsWith("medikiosk-patient-")) continue;

      const patient = readJson<PatientRecord>(key);
      if (patient) loadedPatients.push(patient);
    }

    setAppointments(loadedAppointments);
    setPatients(loadedPatients);
    setLoading(false);
  }, [router]);

  const doctorAppointments = useMemo(() => {
    if (!doctor) return appointments;

    const doctorName = doctor.name?.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const appointmentDoctor = getDoctorName(appointment.doctor)
        .trim()
        .toLowerCase();

      if (!doctorName) return true;

      return (
        appointmentDoctor === doctorName ||
        appointmentDoctor.includes(doctorName) ||
        doctorName.includes(appointmentDoctor)
      );
    });
  }, [appointments, doctor]);

  const filteredAppointments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return doctorAppointments;

    return doctorAppointments.filter((appointment) => {
      const patient = appointment.patientName || "";
      const mobile = appointment.patientMobile || "";
      const id = appointment.patientId || "";
      const appointmentId = appointment.id || "";

      return [patient, mobile, id, appointmentId]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [doctorAppointments, searchTerm]);

  const todayAppointments = useMemo(() => {
    const now = new Date();

    return doctorAppointments.filter((appointment) => {
      const date = getAppointmentDate(appointment.date);
      if (!date) return false;

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    });
  }, [doctorAppointments]);

  const upcomingAppointments = useMemo(() => {
    return doctorAppointments
      .filter((appointment) => {
        const date = getAppointmentDate(appointment.date);
        return date ? date.getTime() >= new Date().setHours(0, 0, 0, 0) : false;
      })
      .sort((a, b) => {
        const dateA = getAppointmentDate(a.date)?.getTime() || 0;
        const dateB = getAppointmentDate(b.date)?.getTime() || 0;
        return dateA - dateB;
      });
  }, [doctorAppointments]);

  const uniquePatients = useMemo(() => {
    const ids = new Set<string>();

    doctorAppointments.forEach((appointment) => {
      if (appointment.patientId) ids.add(appointment.patientId);
      else if (appointment.patientMobile) ids.add(appointment.patientMobile);
      else if (appointment.patientName) ids.add(appointment.patientName);
    });

    return ids.size;
  }, [doctorAppointments]);

  function handleLogout() {
    sessionStorage.removeItem("medikiosk-doctor");
    router.push("/doctor/login");
  }

  function openPatient(appointment: Appointment) {
    const params = new URLSearchParams();

    if (appointment.patientId) {
      params.set("patientId", appointment.patientId);
    }

    if (appointment.patientMobile) {
      params.set("mobile", appointment.patientMobile);
    }

    if (appointment.id) {
      params.set("appointmentId", appointment.id);
    }

    router.push(`/doctor/patient?${params.toString()}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#61716C]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#CBD8D4] border-t-[#365A91]" />
          Loading doctor dashboard...
        </div>
      </main>
    );
  }

  const firstName = doctor?.name?.trim()
    ? doctor.name.trim().split(/\s+/).slice(-1)[0]
    : "Doctor";

  return (
    <main className="min-h-screen bg-[#F6F8F7] text-[#17332D]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#DDE7E3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12332D]">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#17332D]">
                MEDIKIOSK
              </p>
              <p className="text-xs text-[#71817D]">Doctor Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#17332D]">
                Dr. {doctor?.name || "Doctor"}
              </p>
              <p className="text-xs text-[#71817D]">
                {doctor?.specialization || doctor?.department || "Doctor"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#D7E1DE] bg-white px-3 py-2 text-sm font-medium text-[#5E706B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-[#DDE7E3] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EEF3F9] px-3 py-1 text-xs font-semibold text-[#365A91]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure clinical workspace
              </div>

              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Good to see you, Dr. {firstName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687A75]">
                Review today&apos;s patient queue, verify AI-prepared case
                information and continue consultations from one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#F4F8F6] px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCEBE5]">
                <UserRound className="h-5 w-5 text-[#2D6657]" />
              </div>
              <div>
                <p className="text-xs text-[#71817D]">License</p>
                <p className="text-sm font-semibold text-[#17332D]">
                  {doctor?.licenseNumber || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5F2] text-[#2D6657]">
                <CalendarDays className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-[#71817D]">Today</span>
            </div>
            <p className="mt-4 text-3xl font-semibold">{todayAppointments.length}</p>
            <p className="mt-1 text-sm text-[#71817D]">Appointments</p>
          </div>

          <div className="rounded-2xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#365A91]">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-[#71817D]">Unique</span>
            </div>
            <p className="mt-4 text-3xl font-semibold">{uniquePatients}</p>
            <p className="mt-1 text-sm text-[#71817D]">Patients</p>
          </div>

          <div className="rounded-2xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF6E7] text-[#A36B16]">
                <Clock3 className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-[#71817D]">Queue</span>
            </div>
            <p className="mt-4 text-3xl font-semibold">{upcomingAppointments.length}</p>
            <p className="mt-1 text-sm text-[#71817D]">Upcoming</p>
          </div>

          <div className="rounded-2xl border border-[#DDE7E3] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2EEFA] text-[#6B4C99]">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-[#71817D]">Records</span>
            </div>
            <p className="mt-4 text-3xl font-semibold">{patients.length}</p>
            <p className="mt-1 text-sm text-[#71817D]">Registered</p>
          </div>
        </section>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <section className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#365A91]">Patient queue</p>
                <h2 className="mt-1 text-xl font-semibold">Upcoming consultations</h2>
              </div>

              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9995]" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search patient..."
                  className="w-full rounded-xl border border-[#D7E1DE] bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD8D4] bg-[#F8FAF9] p-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-[#879691]" />
                  <p className="mt-3 font-semibold text-[#17332D]">
                    No appointments found
                  </p>
                  <p className="mt-1 text-sm text-[#71817D]">
                    Patient appointments booked with this doctor will appear here.
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <button
                    key={appointment.id || `${appointment.patientId}-${index}`}
                    type="button"
                    onClick={() => openPatient(appointment)}
                    className="group flex w-full cursor-pointer flex-col gap-4 rounded-2xl border border-[#DDE7E3] bg-white p-4 text-left transition hover:border-[#9DB6AD] hover:bg-[#FAFCFB] sm:flex-row sm:items-center"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF5F2] text-[#2D6657]">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#17332D]">
                          {appointment.patientName ||
                            (appointment.patientMobile
                              ? `Patient ${appointment.patientMobile.slice(-4)}`
                              : "Patient")}
                        </p>

                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5F2] px-2 py-1 text-[11px] font-semibold text-[#2D6657]">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#71817D]">
                        {appointment.patientId || "Patient ID not available"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#5E706B]">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-[#365A91]" />
                          {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-[#365A91]" />
                          {appointment.time || "Time not available"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-[#365A91]" />
                          {getDoctorSpecialty(appointment.doctor, appointment.specialty)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                      <div>
                        <p className="text-xs text-[#71817D]">Mode</p>
                        <p className="mt-1 text-sm font-semibold capitalize">
                          {appointment.mode || "In-person"}
                        </p>
                      </div>
                      <span className="mt-2 inline-block text-xs font-semibold text-[#365A91] group-hover:underline">
                        Open patient →
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Right column */}
          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#365A91]">Doctor profile</p>
                  <h2 className="mt-1 text-lg font-semibold">Your details</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F9] text-[#365A91]">
                  <Stethoscope className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-[#F7F9F8] p-3">
                  <p className="text-xs text-[#71817D]">Doctor</p>
                  <p className="mt-1 text-sm font-semibold">Dr. {doctor?.name || "Doctor"}</p>
                </div>

                <div className="rounded-xl bg-[#F7F9F8] p-3">
                  <p className="text-xs text-[#71817D]">Specialization</p>
                  <p className="mt-1 text-sm font-semibold">
                    {doctor?.specialization || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F7F9F8] p-3">
                  <p className="text-xs text-[#71817D]">Department</p>
                  <p className="mt-1 text-sm font-semibold">
                    {doctor?.department || "Not available"}
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-[#F7F9F8] p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#365A91]" />
                  <div>
                    <p className="text-xs text-[#71817D]">Hospital</p>
                    <p className="mt-1 text-sm font-semibold">
                      {doctor?.hospital || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#DDE7E3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E8] text-[#A36B16]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Clinical safety</h2>
                  <p className="text-xs text-[#71817D]">AI assistance policy</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#FFFAF3] p-4">
                <p className="text-sm font-medium text-[#6B4B19]">
                  Doctor verification required
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7C6848]">
                  AI organizes patient information and can surface possible
                  red flags. The treating doctor verifies the information and
                  makes the final clinical decision.
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#2D6657]">
                <ShieldCheck className="h-4 w-4" />
                Human-in-the-loop consultation
              </div>
            </section>

            <section className="rounded-3xl border border-[#DDE7E3] bg-[#12332D] p-5 text-white shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#B9D8CE]">
                    MediKiosk Intelligence
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Ready for consultation
                  </h2>
                </div>
                <HeartPulse className="h-6 w-6 text-[#B9D8CE]" />
              </div>

              <p className="mt-3 text-xs leading-5 text-[#D5E5E0]">
                Review the patient&apos;s structured history, uploaded documents,
                timeline and AI summary before consultation.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#B9D8CE]">
                <Bell className="h-4 w-4" />
                Select a patient from the queue to continue
              </div>
            </section>
          </aside>
        </div>

        {/* Footer */}
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
