"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  LockKeyhole,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  BadgeCheck,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

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

type Step = "login" | "create-pin" | "reset-pin";

function PinInput({
  value,
  onChange,
  id,
  label,
  show,
  setShow,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  show: boolean;
  setShow: (value: boolean) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879691]" />

        <input
          id={id}
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-[#D7E1DE] bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#879691] hover:text-[#365A91]"
          aria-label={show ? "Hide PIN" : "Show PIN"}
        >
          {show ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function DoctorLoginPage() {
  const router = useRouter();

  // Existing doctors now land directly on PIN login.
  // License verification is only required for Create New PIN / Forgot PIN.
  const [step, setStep] = useState<Step>("login");

  const [licenseNumber, setLicenseNumber] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function findDoctor(license: string): Doctor | null {
    try {
      const stored = localStorage.getItem("medikiosk-doctors");
      if (!stored) return null;

      const doctors: Doctor[] = JSON.parse(stored);

      return (
        doctors.find(
          (d) =>
            d.licenseNumber?.toUpperCase() ===
            license.trim().toUpperCase()
        ) || null
      );
    } catch {
      return null;
    }
  }

  function verifyLicenseForPinAction(): Doctor | null {
    setError("");
    setSuccess("");

    const license = licenseNumber.trim().toUpperCase();

    if (!license) {
      setError("Please enter your medical license number.");
      return null;
    }

    const registeredDoctor = findDoctor(license);

    if (!registeredDoctor) {
      setError(
        "Medical license number is not registered. Please contact hospital administration."
      );
      return null;
    }

    if (registeredDoctor.status !== "Active") {
      setError(
        "Your doctor account is pending activation. Please contact hospital administration."
      );
      return null;
    }

    setDoctor(registeredDoctor);
    return registeredDoctor;
  }

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const license = licenseNumber.trim().toUpperCase();

    if (!license) {
      setError("Please enter your medical license number.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("Please enter your valid 4-digit PIN.");
      return;
    }

    const registeredDoctor = findDoctor(license);

    if (!registeredDoctor) {
      setError(
        "Medical license number is not registered. Please contact hospital administration."
      );
      return;
    }

    if (registeredDoctor.status !== "Active") {
      setError(
        "Your doctor account is pending activation. Please contact hospital administration."
      );
      return;
    }

    if (!registeredDoctor.pinSet || !registeredDoctor.pin) {
      setError(
        "No PIN is set for this account. Use 'Create New PIN' below."
      );
      setDoctor(registeredDoctor);
      return;
    }

    if (registeredDoctor.pin !== pin) {
      setError("Incorrect PIN. Please try again.");
      return;
    }

    sessionStorage.setItem(
      "medikiosk-doctor",
      JSON.stringify({
        licenseNumber: registeredDoctor.licenseNumber,
        name: registeredDoctor.name,
        specialization: registeredDoctor.specialization,
        department: registeredDoctor.department,
        hospital: registeredDoctor.hospital,
      })
    );

    router.push("/doctor/dashboard");
  }

  function openCreatePin() {
    setError("");
    setSuccess("");
    setPin("");
    setConfirmPin("");
    setDoctor(null);
    setStep("create-pin");
  }

  function openResetPin() {
    setError("");
    setSuccess("");
    setPin("");
    setConfirmPin("");
    setDoctor(null);
    setStep("reset-pin");
  }

  function handleCreatePin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const registeredDoctor = verifyLicenseForPinAction();
    if (!registeredDoctor) return;

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("PIN and confirm PIN do not match.");
      return;
    }

    try {
      const stored = localStorage.getItem("medikiosk-doctors");

      if (!stored) {
        setError("Unable to access registered doctor data.");
        return;
      }

      const doctors: Doctor[] = JSON.parse(stored);

      const updatedDoctors = doctors.map((d) => {
        if (
          d.licenseNumber?.toUpperCase() ===
          registeredDoctor.licenseNumber.toUpperCase()
        ) {
          return {
            ...d,
            pinSet: true,
            pin,
          };
        }

        return d;
      });

      localStorage.setItem("medikiosk-doctors", JSON.stringify(updatedDoctors));

      setDoctor({
        ...registeredDoctor,
        pinSet: true,
        pin,
      });

      setPin("");
      setConfirmPin("");
      setSuccess("PIN created successfully. You can now sign in.");

      setTimeout(() => {
        setSuccess("");
        setStep("login");
      }, 1200);
    } catch {
      setError("Something went wrong while creating your PIN.");
    }
  }

  function handleResetPin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const registeredDoctor = verifyLicenseForPinAction();
    if (!registeredDoctor) return;

    if (!/^\d{4}$/.test(pin)) {
      setError("New PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setError("New PIN and confirm PIN do not match.");
      return;
    }

    try {
      const stored = localStorage.getItem("medikiosk-doctors");

      if (!stored) {
        setError("Unable to access registered doctor data.");
        return;
      }

      const doctors: Doctor[] = JSON.parse(stored);

      const updatedDoctors = doctors.map((d) => {
        if (
          d.licenseNumber?.toUpperCase() ===
          registeredDoctor.licenseNumber.toUpperCase()
        ) {
          return {
            ...d,
            pinSet: true,
            pin,
          };
        }

        return d;
      });

      localStorage.setItem("medikiosk-doctors", JSON.stringify(updatedDoctors));

      setDoctor({
        ...registeredDoctor,
        pinSet: true,
        pin,
      });

      setPin("");
      setConfirmPin("");
      setSuccess("PIN reset successfully. Please sign in.");

      setTimeout(() => {
        setSuccess("");
        setStep("login");
      }, 1200);
    } catch {
      setError("Something went wrong while resetting your PIN.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F8F7] text-[#17332D]">
      {/* Header */}
      <header className="border-b border-[#DDE7E3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12332D]">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight">MEDIKIOSK</p>
              <p className="text-xs text-[#6B7D78]">Doctor Portal</p>
            </div>
          </Link>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8EEF8]">
              {step === "login" && (
                <LockKeyhole className="h-8 w-8 text-[#365A91]" />
              )}

              {(step === "create-pin" || step === "reset-pin") && (
                <KeyRound className="h-8 w-8 text-[#365A91]" />
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium text-[#365A91]">
              DOCTOR PORTAL
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              {step === "login" && "Welcome Back"}
              {step === "create-pin" && "Create New PIN"}
              {step === "reset-pin" && "Forgot PIN"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#687A75]">
              {step === "login" &&
                "Sign in using your registered medical license number and 4-digit PIN."}

              {step === "create-pin" &&
                "Enter your registered medical license number and create a secure 4-digit PIN."}

              {step === "reset-pin" &&
                "Verify your registered medical license number and set a new 4-digit PIN."}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[#DCE7E3] bg-white p-7 shadow-sm">
            {/* LOGIN */}
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Medical License Number
                  </label>

                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879691]" />

                    <input
                      id="licenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={(e) =>
                        setLicenseNumber(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. MMC-2026-1001"
                      autoComplete="off"
                      className="w-full rounded-xl border border-[#D7E1DE] bg-white py-3.5 pl-12 pr-4 text-sm uppercase outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
                    />
                  </div>
                </div>

                <PinInput
                  id="loginPin"
                  label="4-Digit PIN"
                  value={pin}
                  onChange={setPin}
                  show={showPin}
                  setShow={setShowPin}
                  placeholder="Enter your PIN"
                />

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#365A91] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2E4E7D]"
                >
                  Sign In
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>

                {/* Requested options */}
                <div className="border-t border-[#E5ECE9] pt-5">
                  <p className="mb-3 text-center text-xs text-[#7A8985]">
                    First time or having trouble signing in?
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={openCreatePin}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D7E1DE] bg-white px-3 py-3 text-sm font-medium text-[#365A91] transition hover:bg-[#F5F8FC]"
                    >
                      <KeyRound className="h-4 w-4" />
                      Create New PIN
                    </button>

                    <button
                      type="button"
                      onClick={openResetPin}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D7E1DE] bg-white px-3 py-3 text-sm font-medium text-[#365A91] transition hover:bg-[#F5F8FC]"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      Forgot PIN
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* CREATE PIN */}
            {step === "create-pin" && (
              <form onSubmit={handleCreatePin} className="space-y-5">
                <div>
                  <label
                    htmlFor="createLicenseNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Medical License Number
                  </label>

                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879691]" />

                    <input
                      id="createLicenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={(e) =>
                        setLicenseNumber(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. MMC-2026-1001"
                      autoComplete="off"
                      className="w-full rounded-xl border border-[#D7E1DE] bg-white py-3.5 pl-12 pr-4 text-sm uppercase outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
                    />
                  </div>
                </div>

                <PinInput
                  id="newPin"
                  label="Create 4-Digit PIN"
                  value={pin}
                  onChange={setPin}
                  show={showPin}
                  setShow={setShowPin}
                  placeholder="Create PIN"
                />

                <PinInput
                  id="confirmPin"
                  label="Confirm PIN"
                  value={confirmPin}
                  onChange={setConfirmPin}
                  show={showConfirmPin}
                  setShow={setShowConfirmPin}
                  placeholder="Re-enter PIN"
                />

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#365A91] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2E4E7D]"
                >
                  Create PIN
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setPin("");
                    setConfirmPin("");
                    setStep("login");
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 text-sm text-[#687A75] hover:text-[#365A91]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>
              </form>
            )}

            {/* RESET PIN */}
            {step === "reset-pin" && (
              <form onSubmit={handleResetPin} className="space-y-5">
                <div>
                  <label
                    htmlFor="resetLicenseNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Medical License Number
                  </label>

                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#879691]" />

                    <input
                      id="resetLicenseNumber"
                      type="text"
                      value={licenseNumber}
                      onChange={(e) =>
                        setLicenseNumber(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. MMC-2026-1001"
                      autoComplete="off"
                      className="w-full rounded-xl border border-[#D7E1DE] bg-white py-3.5 pl-12 pr-4 text-sm uppercase outline-none transition focus:border-[#365A91] focus:ring-2 focus:ring-[#365A91]/10"
                    />
                  </div>
                </div>

                <PinInput
                  id="resetPin"
                  label="New 4-Digit PIN"
                  value={pin}
                  onChange={setPin}
                  show={showPin}
                  setShow={setShowPin}
                  placeholder="Enter new PIN"
                />

                <PinInput
                  id="resetConfirmPin"
                  label="Confirm New PIN"
                  value={confirmPin}
                  onChange={setConfirmPin}
                  show={showConfirmPin}
                  setShow={setShowConfirmPin}
                  placeholder="Re-enter new PIN"
                />

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#365A91] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2E4E7D]"
                >
                  Reset PIN
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setPin("");
                    setConfirmPin("");
                    setStep("login");
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 text-sm text-[#687A75] hover:text-[#365A91]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>
              </form>
            )}

            {/* Security */}
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#F5F8FC] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#365A91]" />

              <div>
                <p className="text-xs font-medium text-[#40536D]">
                  Secure Doctor Access
                </p>

                <p className="mt-1 text-xs leading-5 text-[#71817D]">
                  Doctor accounts are provisioned by hospital administration.
                  Existing doctors can sign in directly using their license
                  number and personal PIN.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#687A75] hover:text-[#365A91]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to role selection
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-[#82918D]">
            MEDIKIOSK · Smart India Hackathon 2026
          </p>
        </div>
      </section>
    </main>
  );
}
