"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Globe2,
  Mic,
  Hand,
  Check,
  Volume2,
} from "lucide-react";

type Language = {
  id: string;
  name: string;
  nativeName: string;
};

const languages: Language[] = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
  },
  {
    id: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
  },
  {
    id: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
  },
  {
    id: "kannada",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
  },
  {
    id: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
  },
];

export default function PatientLanguagePage() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("");

  const [inputMode, setInputMode] =
    useState<"voice" | "touch">("voice");

  function handleContinue() {
    if (!selectedLanguage) {
      return;
    }

    // Save selected language
    localStorage.setItem(
      "medikiosk-language",
      selectedLanguage
    );

    // Save selected interaction mode
    localStorage.setItem(
      "medikiosk-input-mode",
      inputMode
    );

    // Go to consent
    router.push("/patient/consent");
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">

      {/* ================= HEADER ================= */}

      <header className="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6 flex items-center justify-between gap-4">

        {/* LOGO */}

        <div className="flex items-center gap-2 shrink-0">

          <div className="w-8 h-8 rounded-md bg-[#10201D] flex items-center justify-center">
            <Activity
              className="w-4 h-4 text-[#F6F7F5]"
              strokeWidth={2.5}
            />
          </div>

          <span className="font-[family-name:var(--font-heading)] font-semibold text-[#10201D] tracking-tight">
            MEDIKIOSK
          </span>

        </div>

        {/* BACK */}

        <Link
          href="/patient/login"
          className="inline-flex items-center gap-2 text-[#5C6B67] hover:text-[#10201D] text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

      </header>


      {/* ================= MAIN ================= */}

      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-12">

        <div className="w-full max-w-5xl">

          {/* ================= TITLE ================= */}

          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <Globe2
                className="w-7 h-7 text-[#1B7A6B]"
                strokeWidth={2}
              />

            </div>

            <h1 className="font-[family-name:var(--font-heading)] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#10201D]">
              Choose Your Language
            </h1>

            <p className="mt-2 text-[#5C6B67] text-sm sm:text-base">
              Select your preferred language for the consultation
            </p>

          </div>


          {/* ================= INPUT MODE ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">

            {/* ================= VOICE ================= */}

            <button
              type="button"
              onClick={() => setInputMode("voice")}
              className={`text-left rounded-xl p-4 sm:p-5 flex items-center gap-4 border transition-all duration-200 cursor-pointer ${
                inputMode === "voice"
                  ? "border-[#1B7A6B] bg-[#EAF6F3] ring-2 ring-[#1B7A6B]/20"
                  : "border-[#E1E5E3] bg-white hover:border-[#9FCAC1] hover:bg-[#F8FBFA]"
              }`}
            >

              {/* ICON */}

              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  inputMode === "voice"
                    ? "bg-[#D5EEE8]"
                    : "bg-[#E6F2EF]"
                }`}
              >

                <Mic
                  className="w-5 h-5 text-[#1B7A6B]"
                  strokeWidth={2}
                />

              </div>


              {/* TEXT */}

              <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between gap-2">

                  <p className="font-semibold text-[#10201D]">
                    Voice Enabled
                  </p>

                  {inputMode === "voice" && (
                    <div className="w-6 h-6 rounded-full bg-[#1B7A6B] flex items-center justify-center shrink-0">

                      <Check
                        className="w-4 h-4 text-white"
                        strokeWidth={3}
                      />

                    </div>
                  )}

                </div>

                <p className="text-sm text-[#6B7874] mt-1 leading-relaxed">
                  Speak naturally in your selected language
                </p>

              </div>

            </button>


            {/* ================= TOUCH ================= */}

            <button
              type="button"
              onClick={() => setInputMode("touch")}
              className={`text-left rounded-xl p-4 sm:p-5 flex items-center gap-4 border transition-all duration-200 cursor-pointer ${
                inputMode === "touch"
                  ? "border-[#1B7A6B] bg-[#EAF6F3] ring-2 ring-[#1B7A6B]/20"
                  : "border-[#E1E5E3] bg-white hover:border-[#9FCAC1] hover:bg-[#F8FBFA]"
              }`}
            >

              {/* ICON */}

              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  inputMode === "touch"
                    ? "bg-[#D5EEE8]"
                    : "bg-[#E6F2EF]"
                }`}
              >

                <Hand
                  className="w-5 h-5 text-[#1B7A6B]"
                  strokeWidth={2}
                />

              </div>


              {/* TEXT */}

              <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between gap-2">

                  <p className="font-semibold text-[#10201D]">
                    Touch & Type
                  </p>

                  {inputMode === "touch" && (
                    <div className="w-6 h-6 rounded-full bg-[#1B7A6B] flex items-center justify-center shrink-0">

                      <Check
                        className="w-4 h-4 text-white"
                        strokeWidth={3}
                      />

                    </div>
                  )}

                </div>

                <p className="text-sm text-[#6B7874] mt-1 leading-relaxed">
                  Answer questions using touch and text
                </p>

              </div>

            </button>

          </div>


          {/* ================= LANGUAGE CARD ================= */}

          <div className="bg-white rounded-xl border border-[#E1E5E3] p-5 sm:p-7 lg:p-8">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="font-semibold text-[#10201D] text-lg">
                  Select Language
                </h2>

                <p className="text-sm text-[#7A8581] mt-1">
                  You can change this later
                </p>

              </div>

              <Volume2 className="w-5 h-5 text-[#8A9591]" />

            </div>


            {/* ================= LANGUAGE GRID ================= */}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">

              {languages.map((language) => {

                const isSelected =
                  selectedLanguage === language.id;

                return (

                  <button
                    key={language.id}
                    type="button"
                    onClick={() =>
                      setSelectedLanguage(language.id)
                    }
                    className={`
                      relative
                      min-h-[88px]
                      sm:min-h-[96px]
                      rounded-xl
                      border
                      px-3
                      sm:px-4
                      py-3
                      sm:py-4
                      text-left
                      transition-all
                      duration-200
                      cursor-pointer
                      ${
                        isSelected
                          ? "border-[#1B7A6B] bg-[#EAF6F3] ring-2 ring-[#1B7A6B]/20"
                          : "border-[#E1E5E3] bg-white hover:border-[#9FCAC1] hover:bg-[#F8FBFA]"
                      }
                    `}
                  >

                    {/* SELECTED CHECK */}

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1B7A6B] flex items-center justify-center">

                        <Check
                          className="w-3 h-3 text-white"
                          strokeWidth={3}
                        />

                      </div>
                    )}


                    {/* LANGUAGE NAME */}

                    <p
                      className={`font-semibold text-sm pr-5 ${
                        isSelected
                          ? "text-[#1B7A6B]"
                          : "text-[#10201D]"
                      }`}
                    >
                      {language.name}
                    </p>


                    {/* NATIVE NAME */}

                    <p className="text-lg mt-2 text-[#4E5D58] leading-tight">
                      {language.nativeName}
                    </p>

                  </button>

                );

              })}

            </div>


            {/* ================= SELECTED INFO ================= */}

            {selectedLanguage && (
              <div className="mt-6 rounded-lg bg-[#F4F9F7] border border-[#DCEBE6] px-4 py-3">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <p className="text-sm text-[#53625E]">

                    Language:{" "}

                    <span className="font-semibold text-[#1B7A6B]">
                      {
                        languages.find(
                          (language) =>
                            language.id === selectedLanguage
                        )?.name
                      }
                    </span>

                  </p>

                  <p className="text-sm text-[#53625E]">

                    Mode:{" "}

                    <span className="font-semibold text-[#1B7A6B]">
                      {inputMode === "voice"
                        ? "Voice"
                        : "Touch & Type"}
                    </span>

                  </p>

                </div>

              </div>
            )}


            {/* ================= CONTINUE ================= */}

            <div className="mt-7 pt-6 border-t border-[#E8EBE9]">

              <button
                type="button"
                disabled={!selectedLanguage}
                onClick={handleContinue}
                className={`
                  w-full
                  rounded-lg
                  py-3.5
                  text-base
                  font-medium
                  transition-colors
                  ${
                    selectedLanguage
                      ? "bg-[#1B7A6B] text-white hover:bg-[#166358] cursor-pointer"
                      : "bg-[#DCE4E1] text-[#8A9591] cursor-not-allowed"
                  }
                `}
              >
                Continue
              </button>

            </div>

          </div>


          {/* ================= FOOTER ================= */}

          <p className="text-center text-xs sm:text-sm text-[#89938F] mt-5 px-4 leading-relaxed">
            Your language preference will be used for AI-assisted
            case taking and communication.
          </p>

        </div>

      </section>

    </main>
  );
}