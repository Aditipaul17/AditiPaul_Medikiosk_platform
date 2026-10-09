"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Phone,
  KeyRound,
  UserRound,
  Calendar,
  Users,
  IdCard,
  AlertCircle,
} from "lucide-react";

type LoginForm = {
  mobile: string;
  pin: string;
};

type LoginErrors = {
  mobile: string;
  pin: string;
};

type RegisterForm = {
  fullName: string;
  mobile: string;
  dob: string;
  gender: string;
  pin: string;
  confirmPin: string;
  abhaId: string;
};

type RegisterErrors = {
  fullName: string;
  mobile: string;
  dob: string;
  gender: string;
  pin: string;
  confirmPin: string;
};

const inputBase =
  "w-full rounded-lg border border-[#E1E5E3] bg-white pl-11 pr-4 py-3.5 text-base text-[#10201D] placeholder:text-[#8A9591] focus:outline-none focus:ring-2 focus:ring-[#1B7A6B] focus:border-transparent transition-shadow";

const labelBase = "block text-sm font-medium text-[#10201D] mb-1.5";

const emptyLoginErrors: LoginErrors = {
  mobile: "",
  pin: "",
};

const emptyRegisterErrors: RegisterErrors = {
  fullName: "",
  mobile: "",
  dob: "",
  gender: "",
  pin: "",
  confirmPin: "",
};

export default function PatientLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");

  const [loginForm, setLoginForm] = useState<LoginForm>({
    mobile: "",
    pin: "",
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>(emptyLoginErrors);

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    fullName: "",
    mobile: "",
    dob: "",
    gender: "",
    pin: "",
    confirmPin: "",
    abhaId: "",
  });
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>(
    emptyRegisterErrors
  );

  function validateLogin() {
    const errors: LoginErrors = { mobile: "", pin: "" };
    let isValid = true;

    if (!/^\d{10}$/.test(loginForm.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
      isValid = false;
    }
    if (!/^\d{4}$/.test(loginForm.pin.trim())) {
      errors.pin = "PIN must be exactly 4 digits.";
      isValid = false;
    }

    setLoginErrors(errors);
    return isValid;
  }

  function validateRegister() {
    const errors: RegisterErrors = {
      fullName: "",
      mobile: "",
      dob: "",
      gender: "",
      pin: "",
      confirmPin: "",
    };
    let isValid = true;

    if (!registerForm.fullName.trim()) {
      errors.fullName = "Full name is required.";
      isValid = false;
    }
    if (!/^\d{10}$/.test(registerForm.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit mobile number.";
      isValid = false;
    }
    if (!registerForm.dob) {
      errors.dob = "Date of birth is required.";
      isValid = false;
    }
    if (!registerForm.gender) {
      errors.gender = "Please select a gender.";
      isValid = false;
    }
    if (!/^\d{4}$/.test(registerForm.pin.trim())) {
      errors.pin = "PIN must be exactly 4 digits.";
      isValid = false;
    }
    if (registerForm.confirmPin.trim() !== registerForm.pin.trim()) {
      errors.confirmPin = "PINs do not match.";
      isValid = false;
    }

    setRegisterErrors(errors);
    return isValid;
  }

  function getPatientKey(mobile: string) {
    return mobile.replace(/\\D/g, "");
  }

  function getPatientRecord(mobile: string) {
    const key = getPatientKey(mobile);
    const raw = localStorage.getItem(`medikiosk-patient-${key}`);

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function getPatientAppointment(mobile: string) {
    const key = getPatientKey(mobile);

    // New patient-specific appointment storage.
    const patientAppointment = localStorage.getItem(
      `medikiosk-appointment-${key}`
    );

    if (patientAppointment) {
      try {
        return JSON.parse(patientAppointment);
      } catch {
        return null;
      }
    }

    // Backward compatibility with the old shared appointment key.
    // This only migrates it when the appointment already contains
    // the correct patient mobile number.
    const legacyAppointment = localStorage.getItem("medikiosk-appointment");

    if (legacyAppointment) {
      try {
        const appointment = JSON.parse(legacyAppointment);

        if (
          appointment?.patientMobile &&
          getPatientKey(String(appointment.patientMobile)) === key
        ) {
          localStorage.setItem(
            `medikiosk-appointment-${key}`,
            JSON.stringify(appointment)
          );

          return appointment;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (validateLogin()) {
      const mobile = loginForm.mobile.trim();
      const key = getPatientKey(mobile);
      const existingPatient = getPatientRecord(mobile);

      const patient = {
        ...(existingPatient || {}),
        id: existingPatient?.id || `P-${key}`,
        mobile,
        loggedInAt: new Date().toISOString(),
      };

      // Store the currently logged-in patient.
      localStorage.setItem(
        "medikiosk-current-patient",
        JSON.stringify(patient)
      );

      // Check whether THIS patient already has an appointment.
      const appointment = getPatientAppointment(mobile);

      if (appointment) {
        // Returning patient with an appointment:
        // skip the complete intake flow.
        router.push("/patient/home");
        return;
      }

      // Do not clear patient-specific history here.
      // The interview/history will be handled per patient.
      router.push("/patient/language");
    }
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (validateRegister()) {
      const mobile = registerForm.mobile.trim();
      const key = getPatientKey(mobile);

      const patient = {
        id: `P-${key}`,
        mobile,
        fullName: registerForm.fullName.trim(),
        dob: registerForm.dob,
        gender: registerForm.gender,
        abhaId: registerForm.abhaId.trim(),
        registeredAt: new Date().toISOString(),
      };

      // Save a persistent demo patient record.
      localStorage.setItem(
        `medikiosk-patient-${key}`,
        JSON.stringify(patient)
      );

      // Start the patient session.
      localStorage.setItem(
        "medikiosk-current-patient",
        JSON.stringify(patient)
      );

      // A genuinely new registration starts the intake flow.
      router.push("/patient/language");
    }
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">
      <header className="w-full px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#10201D] flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-[#F6F7F5]" strokeWidth={2.5} />
          </div>
          <span className="font-[family-name:var(--font-heading)] font-semibold text-[#10201D] tracking-tight">
            MEDIKIOSK
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#5C6B67] hover:text-[#10201D] text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-lg bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">
              <UserRound className="w-6 h-6 text-[#1B7A6B]" strokeWidth={2} />
            </div>
            <h1 className="font-[family-name:var(--font-heading)] font-bold text-2xl sm:text-3xl text-[#10201D]">
              Patient Access
            </h1>
            <p className="mt-2 text-[#5C6B67] text-sm sm:text-base">
              Log in with your mobile number and PIN, or register as a new patient.
            </p>
          </div>

          <div className="flex bg-[#E6F2EF] rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={
                activeTab === "login"
                  ? "flex-1 py-3 rounded-md text-sm sm:text-base font-medium transition-colors bg-white text-[#1B7A6B] shadow-sm cursor-pointer"
                  : "flex-1 py-3 rounded-md text-sm sm:text-base font-medium transition-colors text-[#5C6B67] cursor-pointer"
              }
            >
              Patient Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={
                activeTab === "register"
                  ? "flex-1 py-3 rounded-md text-sm sm:text-base font-medium transition-colors bg-white text-[#1B7A6B] shadow-sm cursor-pointer"
                  : "flex-1 py-3 rounded-md text-sm sm:text-base font-medium transition-colors text-[#5C6B67] cursor-pointer"
              }
            >
              New Patient
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E1E5E3] p-6 sm:p-8">
            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="login-mobile" className={labelBase}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className={inputBase}
                      value={loginForm.mobile}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          mobile: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                  {loginErrors.mobile !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {loginErrors.mobile}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="login-pin" className={labelBase}>
                    4-Digit PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Enter your PIN"
                      className={inputBase}
                      value={loginForm.pin}
                      onChange={(e) =>
                        setLoginForm({
                          ...loginForm,
                          pin: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                  {loginErrors.pin !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {loginErrors.pin}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1B7A6B] text-white rounded-lg py-3.5 text-base font-medium hover:bg-[#166358] transition-colors cursor-pointer"
                >
                  Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="reg-name" className={labelBase}>
                    Full Name
                  </label>
                  <div className="relative">
                    <UserRound className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Your full name"
                      className={inputBase}
                      value={registerForm.fullName}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  {registerErrors.fullName !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {registerErrors.fullName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reg-mobile" className={labelBase}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className={inputBase}
                      value={registerForm.mobile}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          mobile: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                  {registerErrors.mobile !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {registerErrors.mobile}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reg-dob" className={labelBase}>
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-dob"
                      type="date"
                      className={inputBase}
                      value={registerForm.dob}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, dob: e.target.value })
                      }
                    />
                  </div>
                  {registerErrors.dob !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {registerErrors.dob}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="reg-gender" className={labelBase}>
                    Gender
                  </label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      id="reg-gender"
                      className={inputBase + " appearance-none"}
                      value={registerForm.gender}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  {registerErrors.gender !== "" ? (
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {registerErrors.gender}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="reg-pin" className={labelBase}>
                      Create 4-Digit PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="4-digit PIN"
                        className={inputBase}
                        value={registerForm.pin}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            pin: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>
                    {registerErrors.pin !== "" ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {registerErrors.pin}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="reg-confirm-pin" className={labelBase}>
                      Confirm PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-confirm-pin"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="Re-enter PIN"
                        className={inputBase}
                        value={registerForm.confirmPin}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            confirmPin: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>
                    {registerErrors.confirmPin !== "" ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {registerErrors.confirmPin}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-abha" className={labelBase}>
                    ABHA ID <span className="text-[#8A9591] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <IdCard className="w-5 h-5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-abha"
                      type="text"
                      placeholder="Enter ABHA ID if you have one"
                      className={inputBase}
                      value={registerForm.abhaId}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          abhaId: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1B7A6B] text-white rounded-lg py-3.5 text-base font-medium hover:bg-[#166358] transition-colors cursor-pointer"
                >
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}