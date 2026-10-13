"use client";

import Link from "next/link";
import { Check, Stethoscope, FileText, Sparkles, Navigation, CalendarDays } from "lucide-react";

export type StepKey = "intake" | "documents" | "summary" | "care-navigation" | "booking";

interface ClinicalStepperProps {
  currentStep: StepKey;
}

const steps = [
  { key: "intake" as StepKey, label: "Symptom Intake", href: "/patient/intake", icon: Stethoscope },
  { key: "documents" as StepKey, label: "Documents & OCR", href: "/patient/documents", icon: FileText },
  { key: "summary" as StepKey, label: "AI Summary", href: "/patient/summary", icon: Sparkles },
  { key: "care-navigation" as StepKey, label: "Care Navigation", href: "/patient/care-navigation", icon: Navigation },
  { key: "booking" as StepKey, label: "Book Appointment", href: "/patient/booking", icon: CalendarDays },
];

export default function ClinicalStepper({ currentStep }: ClinicalStepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full bg-[#F9FBFA] border-b border-[#E1E5E3] px-4 py-3">
      <div className="mx-auto max-w-5xl">
        {/* Desktop / Tablet Stepper */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <Link
                  href={step.href}
                  className={`flex items-center gap-2 group transition cursor-pointer ${
                    isCurrent
                      ? "text-[#1B7A6B] font-bold"
                      : isCompleted
                      ? "text-[#3D4C48] hover:text-[#1B7A6B]"
                      : "text-[#8A9591] hover:text-[#5C6B67]"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-[#1B7A6B] text-white shadow-sm ring-2 ring-[#1B7A6B]/20"
                        : isCompleted
                        ? "bg-[#E6F2EF] text-[#1B7A6B]"
                        : "bg-[#EAEAEA] text-[#7B8B87]"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <span className="text-xs whitespace-nowrap hidden md:inline">
                    {step.label}
                  </span>
                </Link>

                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      idx < currentIndex ? "bg-[#1B7A6B]" : "bg-[#E1E5E3]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="flex sm:hidden items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#1B7A6B] px-2 py-0.5 text-[11px] font-bold text-white">
              Step {currentIndex + 1} of 5
            </span>
            <span className="text-xs font-bold text-[#10201D]">
              {steps[currentIndex]?.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {steps.map((step, idx) => (
              <Link
                key={step.key}
                href={step.href}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-6 bg-[#1B7A6B]"
                    : idx < currentIndex
                    ? "w-3 bg-[#89C3B9]"
                    : "w-2 bg-[#DCE1DF]"
                }`}
                title={step.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
