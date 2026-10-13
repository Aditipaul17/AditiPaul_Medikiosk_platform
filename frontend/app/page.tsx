"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  UserRound,
  Stethoscope,
  Siren,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Calendar,
} from "lucide-react";

type RoleMode = "patient" | "doctor";

type Doctor = {
  licenseNumber: string;
  name: string;
  specialization: string;
  department: string;
  hospital: string;
  status: "Active" | "Pending";
  pinSet?: boolean;
  pin?: string;
};

const DEFAULT_DOCTORS: Doctor[] = [
  {
    licenseNumber: "MMC-2026-1001",
    name: "Dr. Rahul Sharma",
    specialization: "General Medicine",
    department: "Medicine",
    hospital: "City Care Hospital",
    status: "Active",
    pinSet: true,
    pin: "1234",
  },
  {
    licenseNumber: "MMC-2026-1002",
    name: "Dr. Priya Patil",
    specialization: "Cardiology",
    department: "Cardiology",
    hospital: "City Care Hospital",
    status: "Active",
    pinSet: true,
    pin: "1234",
  },
  {
    licenseNumber: "MMC-2026-1004",
    name: "Dr. Neha Joshi",
    specialization: "Pediatrics",
    department: "Pediatrics",
    hospital: "City Care Hospital",
    status: "Active",
    pinSet: true,
    pin: "1234",
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Role selection state: Patient vs Doctor
  const [role, setRole] = useState<RoleMode>("patient");

  // Patient Login State
  const [patientMobile, setPatientMobile] = useState("");
  const [patientPin, setPatientPin] = useState("");
  const [patientError, setPatientError] = useState("");
  const [patientShowPin, setPatientShowPin] = useState(false);

  // Doctor Login State
  const [doctorLicense, setDoctorLicense] = useState("");
  const [doctorPin, setDoctorPin] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [doctorShowPin, setDoctorShowPin] = useState(false);

  // Seed default doctors in localStorage if not yet present
  useEffect(() => {
    try {
      const existing = localStorage.getItem("medikiosk-doctors");
      if (!existing) {
        localStorage.setItem("medikiosk-doctors", JSON.stringify(DEFAULT_DOCTORS));
      }
    } catch {
      // ignore
    }
  }, []);

  /* =========================================================
     PATIENT LOGIN SUBMISSION
  ========================================================= */
  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError("");

    const mobileClean = patientMobile.replace(/\D/g, "");
    if (mobileClean.length !== 10) {
      setPatientError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{4}$/.test(patientPin.trim())) {
      setPatientError("PIN must be exactly 4 digits.");
      return;
    }

    // Retrieve or register patient
    const patientKey = mobileClean;
    const existingRaw = localStorage.getItem(`medikiosk-patient-${patientKey}`);
    let patientRecord: any = null;

    if (existingRaw) {
      try {
        patientRecord = JSON.parse(existingRaw);
      } catch {
        patientRecord = null;
      }
    }

    const currentPatient = {
      ...(patientRecord || {}),
      id: patientRecord?.id || `P-${patientKey}`,
      fullName: patientRecord?.fullName || `Patient (${patientKey.slice(-4)})`,
      mobile: mobileClean,
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem("medikiosk-current-patient", JSON.stringify(currentPatient));

    // If patient already has an appointment, route to dashboard; else language/intake
    const appointmentRaw = localStorage.getItem(`medikiosk-appointment-${patientKey}`);
    if (appointmentRaw) {
      router.push("/patient/home");
    } else {
      router.push("/patient/language");
    }
  };

  /* =========================================================
     1-CLICK DEMO PATIENT SIGN-IN
  ========================================================= */
  const handleDemoPatientLogin = () => {
    const demoPatient = {
      id: "P-9876543210",
      fullName: "Aditi Paul",
      mobile: "9876543210",
      dob: "1996-04-12",
      gender: "Female",
      abhaId: "aditi.paul@abdm",
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem("medikiosk-current-patient", JSON.stringify(demoPatient));
    localStorage.setItem("medikiosk-patient-9876543210", JSON.stringify(demoPatient));

    // Seed a confirmed appointment for Aditi Paul
    const demoAppointment = {
      bookingId: "BK-2026-9876",
      patientName: "Aditi Paul",
      patientMobile: "9876543210",
      doctorName: "Dr. Rahul Sharma",
      specialization: "General Medicine",
      department: "Medicine",
      hospital: "City Care Hospital",
      slotDate: new Date().toISOString().split("T")[0],
      slotTime: "10:30 AM",
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("medikiosk-appointment-9876543210", JSON.stringify(demoAppointment));

    router.push("/patient/home");
  };

  /* =========================================================
     DOCTOR LOGIN SUBMISSION
  ========================================================= */
  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorError("");

    const license = doctorLicense.trim().toUpperCase();
    if (!license) {
      setDoctorError("Please enter your medical license number (e.g. MMC-2026-1001).");
      return;
    }

    if (!/^\d{4}$/.test(doctorPin.trim())) {
      setDoctorError("Doctor PIN must be exactly 4 digits.");
      return;
    }

    try {
      const doctorsRaw = localStorage.getItem("medikiosk-doctors");
      const doctors: Doctor[] = doctorsRaw ? JSON.parse(doctorsRaw) : DEFAULT_DOCTORS;

      const found = doctors.find(
        (d) => d.licenseNumber.toUpperCase() === license
      );

      if (!found) {
        setDoctorError("License number not registered in hospital directory.");
        return;
      }

      if (found.status !== "Active") {
        setDoctorError("Doctor account is pending verification.");
        return;
      }

      if (found.pin && found.pin !== doctorPin.trim()) {
        setDoctorError("Incorrect PIN. Please try again.");
        return;
      }

      // Store active doctor session
      sessionStorage.setItem(
        "medikiosk-doctor",
        JSON.stringify({
          licenseNumber: found.licenseNumber,
          name: found.name,
          specialization: found.specialization,
          department: found.department,
          hospital: found.hospital,
        })
      );

      router.push("/doctor/dashboard");
    } catch {
      setDoctorError("An error occurred during authentication.");
    }
  };

  /* =========================================================
     1-CLICK DEMO DOCTOR SIGN-IN
  ========================================================= */
  const handleDemoDoctorLogin = () => {
    const demoDoctor = {
      licenseNumber: "MMC-2026-1001",
      name: "Dr. Rahul Sharma",
      specialization: "General Medicine",
      department: "Medicine",
      hospital: "City Care Hospital",
    };

    sessionStorage.setItem("medikiosk-doctor", JSON.stringify(demoDoctor));
    router.push("/doctor/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#F6F8F7] flex flex-col justify-between text-[#10201D]">
      {/* Top Bar */}
      <header className="border-b border-[#E1E5E3] bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10201D] text-white shadow-xs">
              <Activity className="h-5 w-5 text-[#30D5C8]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-heading)] font-black text-lg tracking-tight text-[#10201D]">
                  MEDIKIOSK
                </span>
                <span className="hidden sm:inline-block rounded-md bg-[#E6F2EF] px-2 py-0.5 text-[10px] font-bold text-[#1B7A6B]">
                  Ministry of AYUSH • Digital Health
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#5C6B67] leading-none">
                AI Clinical Intake &amp; Care Navigation Platform
              </p>
            </div>
          </div>

          {/* Emergency SOS Shortcut (for urgent patients) */}
          <Link
            href="/patient/emergency"
            className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition shadow-xs"
          >
            <Siren className="h-4 w-4 animate-pulse text-red-600 group-hover:text-white" />
            <span>Emergency SOS</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">

          {/* Role Selection Switcher */}
          <div className="text-center mb-6">
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-black text-[#10201D] tracking-tight">
              Sign In to MediKiosk
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5C6B67]">
              Please choose whether you are a Patient or a Doctor
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-[#E9EFEF] rounded-2xl mb-6 border border-[#DCE4E1]">
            <button
              type="button"
              onClick={() => {
                setRole("patient");
                setPatientError("");
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "patient"
                  ? "bg-white text-[#1B7A6B] shadow-sm"
                  : "text-[#5C6B67] hover:text-[#10201D]"
              }`}
            >
              <UserRound className="h-4 w-4" />
              <span>I am a Patient</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("doctor");
                setDoctorError("");
              }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                role === "doctor"
                  ? "bg-[#2F4C7A] text-white shadow-sm"
                  : "text-[#5C6B67] hover:text-[#10201D]"
              }`}
            >
              <Stethoscope className="h-4 w-4" />
              <span>I am a Doctor</span>
            </button>
          </div>

          {/* =======================================================
              PATIENT SIGN-IN CARD
          ======================================================= */}
          {role === "patient" && (
            <div className="bg-white border border-[#DCE3E0] rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EEF2F0]">
                <div className="h-10 w-10 rounded-xl bg-[#EAF6F3] text-[#1B7A6B] flex items-center justify-center">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#10201D] text-base">Patient Sign In</h2>
                  <p className="text-xs text-[#6E7C79]">Enter your 10-digit mobile number &amp; PIN</p>
                </div>
              </div>

              <form onSubmit={handlePatientSubmit} className="space-y-4">
                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3835] mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9591]" />
                    <input
                      type="tel"
                      maxLength={10}
                      inputMode="numeric"
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-xl border border-[#DCE3E0] pl-10 pr-4 py-3 text-sm text-[#10201D] outline-none focus:border-[#1B7A6B] focus:ring-2 focus:ring-[#1B7A6B]/15"
                    />
                  </div>
                </div>

                {/* 4-digit PIN */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3835] mb-1.5">
                    4-Digit Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9591]" />
                    <input
                      type={patientShowPin ? "text" : "password"}
                      maxLength={4}
                      inputMode="numeric"
                      value={patientPin}
                      onChange={(e) => setPatientPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 1234"
                      className="w-full rounded-xl border border-[#DCE3E0] pl-10 pr-10 py-3 text-sm text-[#10201D] outline-none focus:border-[#1B7A6B] focus:ring-2 focus:ring-[#1B7A6B]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setPatientShowPin(!patientShowPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A9591] hover:text-[#1B7A6B]"
                    >
                      {patientShowPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Patient Error */}
                {patientError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{patientError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1B7A6B] py-3.5 text-sm font-bold text-white hover:bg-[#155F53] transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In as Patient</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick 1-Click Demo Patient */}
              <div className="mt-4 pt-4 border-t border-[#EEF2F0]">
                <button
                  type="button"
                  onClick={handleDemoPatientLogin}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EAF6F3] border border-[#C5E5DC] py-2.5 px-3 text-xs font-bold text-[#1B7A6B] hover:bg-[#DCF0EB] transition cursor-pointer"
                >
                  <UserRound className="h-4 w-4 text-[#1B7A6B]" />
                  <span>Demo Patient Sign-In (Aditi Paul)</span>
                </button>
              </div>

              {/* Registration & Walk-in links */}
              <div className="mt-4 flex flex-col gap-2 text-center text-xs text-[#5C6B67]">
                <div>
                  Don&apos;t have an account?{" "}
                  <Link href="/patient/login" className="font-bold text-[#1B7A6B] hover:underline">
                    Register New Patient
                  </Link>
                </div>
                <div>
                  Walk-in Kiosk?{" "}
                  <Link href="/patient/language" className="font-bold text-[#1B7A6B] hover:underline">
                    Direct Symptom Intake Check-in &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              DOCTOR SIGN-IN CARD
          ======================================================= */}
          {role === "doctor" && (
            <div className="bg-white border border-[#DCE3E0] rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#EEF2F0]">
                <div className="h-10 w-10 rounded-xl bg-[#E9EEF6] text-[#2F4C7A] flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#10201D] text-base">Doctor OPD Portal</h2>
                  <p className="text-xs text-[#6E7C79]">State Medical Council (MMC) License &amp; PIN</p>
                </div>
              </div>

              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                {/* License */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3835] mb-1.5">
                    Medical Council License Number
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9591]" />
                    <input
                      type="text"
                      value={doctorLicense}
                      onChange={(e) => setDoctorLicense(e.target.value.toUpperCase())}
                      placeholder="e.g. MMC-2026-1001"
                      className="w-full rounded-xl border border-[#DCE3E0] pl-10 pr-4 py-3 text-sm text-[#10201D] uppercase outline-none focus:border-[#2F4C7A] focus:ring-2 focus:ring-[#2F4C7A]/15 font-mono"
                    />
                  </div>
                </div>

                {/* 4-digit PIN */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3835] mb-1.5">
                    Doctor Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9591]" />
                    <input
                      type={doctorShowPin ? "text" : "password"}
                      maxLength={4}
                      inputMode="numeric"
                      value={doctorPin}
                      onChange={(e) => setDoctorPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 1234"
                      className="w-full rounded-xl border border-[#DCE3E0] pl-10 pr-10 py-3 text-sm text-[#10201D] outline-none focus:border-[#2F4C7A] focus:ring-2 focus:ring-[#2F4C7A]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setDoctorShowPin(!doctorShowPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A9591] hover:text-[#2F4C7A]"
                    >
                      {doctorShowPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Doctor Error */}
                {doctorError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{doctorError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2F4C7A] py-3.5 text-sm font-bold text-white hover:bg-[#253D63] transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In as Doctor</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick 1-Click Demo Doctor */}
              <div className="mt-4 pt-4 border-t border-[#EEF2F0]">
                <button
                  type="button"
                  onClick={handleDemoDoctorLogin}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E9EEF6] border border-[#CCD7E8] py-2.5 px-3 text-xs font-bold text-[#2F4C7A] hover:bg-[#DFE7F4] transition cursor-pointer"
                >
                  <Stethoscope className="h-4 w-4 text-[#2F4C7A]" />
                  <span>Demo Doctor Sign-In (Dr. Rahul Sharma)</span>
                </button>
              </div>

              {/* Help & Pin Setup */}
              <div className="mt-4 flex flex-col gap-2 text-center text-xs text-[#5C6B67]">
                <div>
                  Need to setup or reset your PIN?{" "}
                  <Link href="/doctor/login" className="font-bold text-[#2F4C7A] hover:underline">
                    Doctor PIN Setup &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Compliance notice */}
          <div className="mt-6 text-center text-[11px] text-[#788783] flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#1B7A6B]" />
            <span>ABDM &amp; FHIR R4 Compliant • DPDP Act 2023 Encrypted</span>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E1E5E3] bg-white py-3.5 px-4 text-center text-xs text-[#7B8A86]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} MEDIKIOSK • Ministry of AYUSH (Government of India)</span>
          <div className="flex items-center gap-4 text-[#5C6B67]">
            <Link href="/patient/emergency" className="text-red-600 font-bold hover:underline">
              Emergency SOS 108
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
