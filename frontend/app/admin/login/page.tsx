"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LockKeyhole, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo credentials
    if (adminId === "ADM-001" && password === "admin123") {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid Admin ID or password.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex items-center justify-center px-6 py-10">
      <section className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#10201D] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="mt-5 text-3xl font-semibold text-[#10201D]">
            Admin Portal
          </h1>

          <p className="mt-2 text-[#5C6B67]">
            Hospital administration access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#DCE3E0] rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Admin ID */}
            <div>
              <label className="block text-sm font-medium text-[#10201D] mb-2">
                Admin ID
              </label>

              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9995]" />

                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#DCE3E0] outline-none focus:border-[#1B7A6B]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#10201D] mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9995]" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#DCE3E0] outline-none focus:border-[#1B7A6B]"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#10201D] text-white font-medium hover:bg-[#18332E] transition"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <p className="mt-5 text-center text-xs text-[#6B7975]">
          Demo: ADM-001 / admin123
        </p>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#1B7A6B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-[#7A8783]">
          MEDIKIOSK · Hospital Administration
        </p>

      </section>
    </main>
  );
}