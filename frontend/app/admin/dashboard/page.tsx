"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  UserPlus,
  X,
  Power,
} from "lucide-react";

type Doctor = {
  licenseNumber: string;
  name: string;
  specialization: string;
  department: string;
  hospital: string;
  status: "Active" | "Pending";
};

const initialDoctors: Doctor[] = [
  {
    licenseNumber: "MMC-2026-1001",
    name: "Dr. Rahul Sharma",
    specialization: "General Medicine",
    department: "Medicine",
    hospital: "City Care Hospital",
    status: "Active",
  },
  {
    licenseNumber: "MMC-2026-1002",
    name: "Dr. Priya Patil",
    specialization: "Cardiology",
    department: "Cardiology",
    hospital: "City Care Hospital",
    status: "Active",
  },
  {
    licenseNumber: "MMC-2026-1003",
    name: "Dr. Amit Verma",
    specialization: "Orthopedics",
    department: "Orthopedics",
    hospital: "City Care Hospital",
    status: "Pending",
  },
  {
    licenseNumber: "MMC-2026-1004",
    name: "Dr. Neha Joshi",
    specialization: "Pediatrics",
    department: "Pediatrics",
    hospital: "City Care Hospital",
    status: "Active",
  },
];

export default function AdminDashboardPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    specialization: "",
    department: "",
    hospital: "City Care Hospital",
  });

  /* =========================================================
     LOAD DOCTORS
  ========================================================= */

  useEffect(() => {
    const saved = localStorage.getItem("medikiosk-doctors");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        /*
          Backward compatibility:
          If old Doctor ID based records exist,
          they are ignored and replaced with current
          license-number based demo records.
        */

        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed[0]?.licenseNumber
        ) {
          setDoctors(parsed);
        } else {
          setDoctors(initialDoctors);
        }
      } catch {
        setDoctors(initialDoctors);
      }
    }
  }, []);

  /* =========================================================
     SAVE DOCTORS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "medikiosk-doctors",
      JSON.stringify(doctors)
    );
  }, [doctors]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.licenseNumber} ${doctor.specialization} ${doctor.department} ${doctor.hospital}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =========================================================
     STATS
  ========================================================= */

  const activeDoctors = doctors.filter(
    (doctor) => doctor.status === "Active"
  ).length;

  const pendingDoctors = doctors.filter(
    (doctor) => doctor.status === "Pending"
  ).length;

  /* =========================================================
     OPEN ADD DOCTOR
  ========================================================= */

  const openAddDoctor = () => {
    setForm({
      name: "",
      licenseNumber: "",
      specialization: "",
      department: "",
      hospital: "City Care Hospital",
    });

    setShowAddModal(true);
  };

  /* =========================================================
     ADD DOCTOR
  ========================================================= */

  const addDoctor = () => {
    if (
      !form.name.trim() ||
      !form.licenseNumber.trim() ||
      !form.specialization.trim() ||
      !form.department.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const licenseNumber = form.licenseNumber
      .trim()
      .toUpperCase();

    const duplicateLicense = doctors.some(
      (doctor) =>
        doctor.licenseNumber.toUpperCase() === licenseNumber
    );

    if (duplicateLicense) {
      alert(
        "This medical license number is already registered."
      );
      return;
    }

    const newDoctor: Doctor = {
      licenseNumber,
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      department: form.department.trim(),
      hospital: form.hospital,
      status: "Pending",
    };

    setDoctors((current) => [...current, newDoctor]);

    setShowAddModal(false);

    setSelectedDoctor(newDoctor);
  };

  /* =========================================================
     TOGGLE DOCTOR STATUS
  ========================================================= */

  const toggleDoctorStatus = (
    licenseNumber: string
  ) => {
    setDoctors((current) =>
      current.map((doctor) =>
        doctor.licenseNumber === licenseNumber
          ? {
              ...doctor,
              status:
                doctor.status === "Active"
                  ? "Pending"
                  : "Active",
            }
          : doctor
      )
    );

    setSelectedDoctor((current) => {
      if (
        !current ||
        current.licenseNumber !== licenseNumber
      ) {
        return current;
      }

      return {
        ...current,
        status:
          current.status === "Active"
            ? "Pending"
            : "Active",
      };
    });
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#F6F7F5] text-[#10201D]">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="border-b border-[#DCE3E0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10201D]">
              <Activity className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight">
                MEDIKIOSK
              </p>

              <p className="text-xs text-[#6B7975]">
                Hospital Administration
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            {/* Notification */}

            <button
              type="button"
              aria-label="Notifications"
              className="relative cursor-pointer rounded-lg p-2 hover:bg-[#F1F4F2]"
            >
              <Bell className="h-5 w-5 text-[#53635F]" />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-8 w-px bg-[#DCE3E0] sm:block" />

            {/* Admin */}

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4F1EE]">
                <ShieldCheck className="h-5 w-5 text-[#1B7A6B]" />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  Hospital Admin
                </p>

                <p className="text-xs text-[#6B7975]">
                  ADM-001
                </p>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <p className="text-sm font-medium text-[#1B7A6B]">
              ADMINISTRATION
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Hospital Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#667570]">
              Manage doctors, accounts and hospital access.
            </p>

          </div>

          <button
            type="button"
            onClick={openAddDoctor}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#10201D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#18332E]"
          >
            <Plus className="h-4 w-4" />
            Register New Doctor
          </button>

        </div>

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Users className="h-5 w-5" />}
            title="Total Doctors"
            value={String(doctors.length)}
            subtitle="Registered accounts"
          />

          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Active Doctors"
            value={String(activeDoctors)}
            subtitle="Currently active"
          />

          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Pending Activation"
            value={String(pendingDoctors)}
            subtitle="Awaiting activation"
          />

          <StatCard
            icon={<UserPlus className="h-5 w-5" />}
            title="New This Month"
            value="6"
            subtitle="Doctor registrations"
          />

        </div>

        {/* ===================================================
            DOCTORS
        =================================================== */}

        <section className="mt-8 rounded-2xl border border-[#DCE3E0] bg-white">

          <div className="flex flex-col gap-4 border-b border-[#E7ECEA] px-6 py-5 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Doctor Accounts
              </h2>

              <p className="mt-1 text-sm text-[#6B7975]">
                Manage registered healthcare professionals.
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative w-full md:w-72">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9995]" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search doctors..."
                className="h-11 w-full rounded-xl border border-[#DCE3E0] bg-[#FAFBFA] pl-10 pr-4 text-sm outline-none focus:border-[#1B7A6B]"
              />

            </div>

          </div>

          {/* DOCTOR LIST */}

          <div className="divide-y divide-[#E7ECEA]">

            {filteredDoctors.map((doctor) => (

              <div
                key={doctor.licenseNumber}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAFBFA] md:flex-row md:items-center md:justify-between"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F7]">
                    <Stethoscope className="h-6 w-6 text-[#315B91]" />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-medium">
                        {doctor.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          doctor.status === "Active"
                            ? "bg-[#E5F4EC] text-[#24734B]"
                            : "bg-[#FFF4DD] text-[#9A6911]"
                        }`}
                      >
                        {doctor.status}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-[#5F6F6A]">
                      {doctor.specialization} ·{" "}
                      {doctor.department}
                    </p>

                    <p className="mt-1 text-xs text-[#899590]">
                      {doctor.hospital} · License:{" "}
                      {doctor.licenseNumber}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDoctor(doctor)
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-1 text-sm font-medium text-[#1B7A6B] hover:underline"
                >
                  Manage
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            ))}

            {filteredDoctors.length === 0 && (
              <div className="px-6 py-12 text-center">

                <CircleUserRound className="mx-auto h-10 w-10 text-[#A1ADA9]" />

                <p className="mt-3 text-sm text-[#667570]">
                  No doctors found.
                </p>

              </div>
            )}

          </div>

          {/* FOOTER */}

          <div className="flex items-center justify-between border-t border-[#E7ECEA] px-6 py-4">

            <p className="text-xs text-[#7A8783]">
              Showing {filteredDoctors.length} of{" "}
              {doctors.length} doctors
            </p>

            <button
              type="button"
              onClick={openAddDoctor}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#1B7A6B] hover:underline"
            >
              <UserPlus className="h-4 w-4" />
              Add Doctor
            </button>

          </div>

        </section>

        {/* ===================================================
            SECURITY
        =================================================== */}

        <div className="mt-6 flex gap-3 rounded-xl border border-[#DCE8E3] bg-[#F1F8F5] p-4">

          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1B7A6B]" />

          <div>

            <p className="text-sm font-medium text-[#173D35]">
              Role-based access enabled
            </p>

            <p className="mt-1 text-xs leading-5 text-[#5C6B67]">
              Only authorized hospital administrators can
              create and manage doctor accounts. Doctors use
              their registered medical license number and
              personal PIN.
            </p>

          </div>

        </div>

        {/* ===================================================
            BOTTOM
        =================================================== */}

        <div className="mt-8 flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1B7A6B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to role selection
          </Link>

          <Link
            href="/admin/login"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#667570] hover:text-[#10201D]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>

        </div>

      </div>

      {/* =====================================================
          ADD DOCTOR MODAL
      ===================================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#E7ECEA] px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold">
                  Register New Doctor
                </h2>

                <p className="mt-1 text-sm text-[#6B7975]">
                  Create a doctor account for this hospital.
                </p>

              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="cursor-pointer rounded-lg p-2 hover:bg-[#F1F4F2]"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-4 px-6 py-6">

              <FormInput
                label="Doctor Name"
                placeholder="e.g. Dr. Anjali Mehta"
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                  }))
                }
              />

              <FormInput
                label="Medical License Number"
                placeholder="e.g. MMC-2026-1005"
                value={form.licenseNumber}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    licenseNumber:
                      value.toUpperCase(),
                  }))
                }
              />

              <FormInput
                label="Specialization"
                placeholder="e.g. Cardiology"
                value={form.specialization}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    specialization: value,
                  }))
                }
              />

              <FormInput
                label="Department"
                placeholder="e.g. Cardiology"
                value={form.department}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    department: value,
                  }))
                }
              />

              <FormInput
                label="Hospital"
                placeholder="Hospital name"
                value={form.hospital}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    hospital: value,
                  }))
                }
              />

              <div className="rounded-xl bg-[#F1F8F5] p-4">

                <p className="text-sm font-medium text-[#173D35]">
                  Doctor PIN is created by the doctor
                </p>

                <p className="mt-1 text-xs text-[#5C6B67]">
                  The new account will initially remain
                  Pending. After activation, the doctor
                  verifies the registered license number
                  and creates their own personal PIN.
                </p>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end gap-3 border-t border-[#E7ECEA] px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="cursor-pointer rounded-xl border border-[#DCE3E0] px-5 py-2.5 text-sm font-medium hover:bg-[#F6F7F5]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={addDoctor}
                className="cursor-pointer rounded-xl bg-[#10201D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#18332E]"
              >
                Create Doctor Account
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MANAGE DOCTOR MODAL
      ===================================================== */}

      {selectedDoctor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-[#E7ECEA] px-6 py-5">

              <div>

                <p className="text-xs font-medium text-[#1B7A6B]">
                  DOCTOR ACCOUNT
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Manage Doctor
                </h2>

              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() =>
                  setSelectedDoctor(null)
                }
                className="cursor-pointer rounded-lg p-2 hover:bg-[#F1F4F2]"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* CONTENT */}

            <div className="space-y-5 px-6 py-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF2F7]">
                  <Stethoscope className="h-7 w-7 text-[#315B91]" />
                </div>

                <div>

                  <h3 className="font-semibold">
                    {selectedDoctor.name}
                  </h3>

                  <p className="text-sm text-[#667570]">
                    {selectedDoctor.specialization}
                  </p>

                </div>

              </div>

              {/* INFO */}

              <div className="grid grid-cols-2 gap-3">

                <InfoBox
                  label="License Number"
                  value={
                    selectedDoctor.licenseNumber
                  }
                />

                <InfoBox
                  label="Status"
                  value={
                    selectedDoctor.status
                  }
                />

                <InfoBox
                  label="Department"
                  value={
                    selectedDoctor.department
                  }
                />

                <InfoBox
                  label="Hospital"
                  value={
                    selectedDoctor.hospital
                  }
                />

              </div>

              {/* ACCESS */}

              <div className="rounded-xl border border-[#DCE3E0] bg-[#FAFBFA] p-4">

                <p className="text-sm font-medium">
                  Account Access
                </p>

                <p className="mt-1 text-xs leading-5 text-[#667570]">
                  Doctor signs in using the registered medical
                  license number and personal PIN. The PIN is
                  created by the doctor during first-time
                  activation.
                </p>

              </div>

              {/* STATUS BUTTON */}

              <button
                type="button"
                onClick={() =>
                  toggleDoctorStatus(
                    selectedDoctor.licenseNumber
                  )
                }
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
                  selectedDoctor.status === "Active"
                    ? "border border-[#E3CFCF] text-[#A33A3A] hover:bg-[#FFF5F5]"
                    : "bg-[#10201D] text-white hover:bg-[#18332E]"
                }`}
              >

                <Power className="h-4 w-4" />

                {selectedDoctor.status ===
                "Active"
                  ? "Deactivate Doctor"
                  : "Activate Doctor"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#DCE3E0] bg-[#FAFBFA] px-4 text-sm outline-none focus:border-[#1B7A6B]"
      />

    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#F6F7F5] p-3">

      <p className="text-xs text-[#899590]">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DCE3E0] bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3F0] text-[#1B7A6B]">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-sm text-[#6B7975]">
        {title}
      </p>

      <p className="mt-1 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#899590]">
        {subtitle}
      </p>

    </div>
  );
}