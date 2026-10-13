"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  ShieldAlert,
  Hospital,
  Loader2,
  Siren,
  Ambulance,
  ExternalLink,
  FileText,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import PatientNav from "../../components/PatientNav";

type Lang = "english" | "hindi" | "marathi";

const text = {
  english: {
    title: "SOS ACTIVATED",
    sub: "A red-flag symptom was detected. Please seek emergency medical help immediately.",
    warning: "Emergency triage",
    warningText:
      "MediKiosk has stopped the normal consultation flow and activated the emergency pathway.",
    ambulanceTitle: "Emergency Ambulance",
    ambulanceSub:
      "Call 108 for ambulance assistance or 112 for national emergency services.",
    call108: "Call Ambulance • 108",
    call112: "Emergency Services • 112",
    gpsTitle: "Share your live location",
    gpsText:
      "Allow GPS so your current location can be attached to the emergency request and used by the ambulance team.",
    allow: "Allow GPS Location",
    detecting: "Detecting GPS...",
    ready: "GPS location detected",
    gpsError:
      "Location could not be accessed. Please enable browser location permission and try again.",
    request: "Request Ambulance",
    requested: "Ambulance Request Created",
    requestText:
      "Your location is attached to the emergency request. In the production version, this request is sent to the connected ambulance dispatch service.",
    connectedCareTitle: "Connected Clinical Services",
    connectedCareSub:
      "Access medical records, review AI summary, or book an appointment for clinical consultation.",
    docsTitle: "Documents & Medical Records",
    docsDesc:
      "Upload or view prescriptions, test reports, and past medical history for emergency doctors.",
    docsBtn: "Open Documents",
    summaryTitle: "AI Clinical Summary",
    summaryDesc:
      "Review the structured clinical summary, recorded symptoms, and triage findings.",
    summaryBtn: "View Summary",
    bookingTitle: "Appointment Booking",
    bookingDesc:
      "Schedule priority hospital OPD consultation or follow-up doctor appointment.",
    bookingBtn: "Book Appointment",
    hospitals: "Nearby Emergency Hospitals",
    hospitalsSub:
      "Emergency-capable hospitals available near your current location.",
    distance: "Nearby",
    emergency: "24×7 Emergency",
    map: "Open in Maps",
    disclaimer:
      "This is a safety triage alert, not a diagnosis. Final medical assessment must be made by a qualified healthcare professional.",
  },
  hindi: {
    title: "SOS सक्रिय किया गया",
    sub: "रेड-फ्लैग लक्षण मिले हैं। कृपया तुरंत आपातकालीन चिकित्सा सहायता लें।",
    warning: "आपातकालीन ट्रायेज",
    warningText:
      "MediKiosk ने सामान्य consultation flow रोककर emergency pathway सक्रिय कर दिया है।",
    ambulanceTitle: "आपातकालीन एम्बुलेंस",
    ambulanceSub:
      "एम्बुलेंस के लिए 108 या राष्ट्रीय आपातकालीन सेवा के लिए 112 पर कॉल करें।",
    call108: "एम्बुलेंस कॉल करें • 108",
    call112: "आपातकालीन सेवा • 112",
    gpsTitle: "अपना लाइव लोकेशन साझा करें",
    gpsText:
      "GPS की अनुमति दें ताकि आपका वर्तमान स्थान emergency request के साथ भेजा जा सके।",
    allow: "GPS लोकेशन की अनुमति दें",
    detecting: "GPS पता लगाया जा रहा है...",
    ready: "GPS लोकेशन मिल गई",
    gpsError:
      "लोकेशन नहीं मिल सकी। कृपया browser location permission चालू करके फिर प्रयास करें।",
    request: "एम्बुलेंस अनुरोध भेजें",
    requested: "एम्बुलेंस अनुरोध बनाया गया",
    requestText:
      "आपका स्थान emergency request के साथ जोड़ दिया गया है। Production version में यह connected ambulance dispatch service को भेजा जाएगा।",
    connectedCareTitle: "जुड़ी हुई क्लिनिकल सेवाएं",
    connectedCareSub:
      "मेडिकल रिकॉर्ड देखें, AI सारांश जांचें, या क्लिनिकल परामर्श के लिए अपॉइंटमेंट बुक करें।",
    docsTitle: "दस्तावेज़ और मेडिकल रिकॉर्ड्स",
    docsDesc:
      "पर्चे और लैब रिपोर्ट देखें या अपलोड करें ताकि आपातकालीन डॉक्टरों के पास पूरा इतिहास हो।",
    docsBtn: "दस्तावेज़ खोलें",
    summaryTitle: "AI क्लिनिकल सारांश",
    summaryDesc:
      "डॉक्टर के लिए तैयार क्लिनिकल सारांश, दर्ज लक्षण और ट्रायेज निष्कर्ष देखें।",
    summaryBtn: "सारांश देखें",
    bookingTitle: "अपॉइंटमेंट बुकिंग",
    bookingDesc:
      "प्राथमिकता ओपीडी परामर्श या डॉक्टर फॉलो-अप अपॉइंटमेंट बुक करें।",
    bookingBtn: "अपॉइंटमेंट बुक करें",
    hospitals: "पास के आपातकालीन अस्पताल",
    hospitalsSub:
      "आपके वर्तमान स्थान के आसपास उपलब्ध emergency-capable hospitals।",
    distance: "पास में",
    emergency: "24×7 Emergency",
    map: "Maps में खोलें",
    disclaimer:
      "यह safety triage alert है, diagnosis नहीं। अंतिम चिकित्सा मूल्यांकन योग्य healthcare professional द्वारा किया जाना चाहिए।",
  },
  marathi: {
    title: "SOS सक्रिय केले",
    sub: "रेड-फ्लॅग लक्षण आढळले आहेत. कृपया त्वरित आपत्कालीन वैद्यकीय मदत घ्या.",
    warning: "आपत्कालीन ट्रायेज",
    warningText:
      "MediKiosk ने सामान्य consultation flow थांबवून emergency pathway सक्रिय केला आहे.",
    ambulanceTitle: "आपत्कालीन रुग्णवाहिका",
    ambulanceSub:
      "रुग्णवाहिकेसाठी 108 किंवा राष्ट्रीय आपत्कालीन सेवेसाठी 112 वर कॉल करा.",
    call108: "रुग्णवाहिका कॉल • 108",
    call112: "आपत्कालीन सेवा • 112",
    gpsTitle: "तुमचे लाइव्ह लोकेशन शेअर करा",
    gpsText:
      "GPS परवानगी द्या, जेणेकरून तुमचे वर्तमान स्थान emergency request सोबत पाठवता येईल.",
    allow: "GPS लोकेशनला परवानगी द्या",
    detecting: "GPS शोधत आहे...",
    ready: "GPS लोकेशन मिळाले",
    gpsError:
      "लोकेशन मिळू शकले नाही. Browser location permission सुरू करून पुन्हा प्रयत्न करा.",
    request: "रुग्णवाहिका विनंती पाठवा",
    requested: "रुग्णवाहिका विनंती तयार झाली",
    requestText:
      "तुमचे लोकेशन emergency request सोबत जोडले आहे. Production version मध्ये ही विनंती connected ambulance dispatch service कडे पाठवली जाईल.",
    connectedCareTitle: "संलग्न क्लिनिकल सेवा",
    connectedCareSub:
      "वैद्यकीय नोंदी पहा, AI सारांश तपासा किंवा क्लिनिकल सल्ल्यासाठी अपॉइंटमेंट बुक करा.",
    docsTitle: "कागदपत्रे आणि वैद्यकीय नोंदी",
    docsDesc:
      "प्रिस्क्रिप्शन आणि लॅब अहवाल अपलोड करा जेणेकरून डॉक्टरांना संपूर्ण इतिहास उपलब्ध होईल.",
    docsBtn: "कागदपत्रे उघडा",
    summaryTitle: "AI क्लिनिकल सारांश",
    summaryDesc:
      "नोंदवलेली लक्षणे, ट्रायेज मूल्यांकन आणि AI सारांश तपासा.",
    summaryBtn: "सारांश पहा",
    bookingTitle: "अपॉइंटमेंट बुकिंग",
    bookingDesc:
      "प्राधान्य ओपीडी किंवा डॉक्टर सल्लामसलतीसाठी अपॉइंटमेंट आरक्षित करा.",
    bookingBtn: "अपॉइंटमेंट बुक करा",
    hospitals: "जवळची आपत्कालीन रुग्णालये",
    hospitalsSub:
      "तुमच्या वर्तमान स्थानाजवळ उपलब्ध emergency-capable hospitals.",
    distance: "जवळ",
    emergency: "24×7 Emergency",
    map: "Maps मध्ये उघडा",
    disclaimer:
      "हा safety triage alert आहे, diagnosis नाही. अंतिम वैद्यकीय मूल्यांकन पात्र healthcare professional यांनी करावे.",
  },
} as const;

type HospitalItem = {
  id: string;
  name: string;
  area: string;
  distance: string;
  rating: string;
  type: string;
  emergency: boolean;
};

const fallbackHospitals: HospitalItem[] = [
  {
    id: "h1",
    name: "CityCare Multispeciality Hospital",
    area: "Central City",
    distance: "1.8 km",
    rating: "4.7",
    type: "Multispeciality",
    emergency: true,
  },
  {
    id: "h2",
    name: "MediLife General Hospital",
    area: "Station Road",
    distance: "3.2 km",
    rating: "4.5",
    type: "General Hospital",
    emergency: true,
  },
  {
    id: "h3",
    name: "Shanti Healthcare Centre",
    area: "Civil Lines",
    distance: "4.6 km",
    rating: "4.6",
    type: "Community Hospital",
    emergency: true,
  },
];

function readHospitals(): HospitalItem[] {
  try {
    const raw = localStorage.getItem("medikiosk-hospitals");
    if (!raw) return fallbackHospitals;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackHospitals;
    }

    const mapped = parsed.map((hospital: any, index: number) => ({
      id: String(hospital.id ?? `H-${index + 1}`),
      name: String(hospital.name ?? "Hospital"),
      area: String(hospital.area ?? hospital.address ?? "Nearby"),
      distance: String(hospital.distance ?? "Nearby"),
      rating: String(hospital.rating ?? "—"),
      type: String(hospital.type ?? hospital.category ?? "Hospital"),
      emergency:
        hospital.emergency !== false &&
        hospital.emergency24x7 !== false,
    }));

    const emergencyHospitals = mapped.filter((h) => h.emergency);
    return emergencyHospitals.length ? emergencyHospitals : fallbackHospitals;
  } catch {
    return fallbackHospitals;
  }
}

export default function PatientEmergencyPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("english");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [ambulance, setAmbulance] = useState(false);
  const [patientName, setPatientName] = useState("Patient");
  const [redFlagReasons, setRedFlagReasons] = useState<string[]>([]);

  const t = text[lang];

  useEffect(() => {
    const l = localStorage.getItem("medikiosk-language") as Lang | null;
    if (l && text[l]) setLang(l);

    try {
      const patient = JSON.parse(
        localStorage.getItem("medikiosk-current-patient") || "null"
      );
      setPatientName(patient?.fullName || patient?.name || "Patient");

      const mobile = String(patient?.mobile || "").replace(/\D/g, "");
      if (mobile) {
        const raw = localStorage.getItem(`medikiosk-red-flag-${mobile}`);
        if (raw) {
          const record = JSON.parse(raw);
          if (Array.isArray(record?.reasons)) {
            setRedFlagReasons(record.reasons);
          }
        }
      }
    } catch {
      // Keep safe defaults for demo mode.
    }

    const savedLocation = localStorage.getItem(
      "medikiosk-emergency-location"
    );
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
        setStatus("success");
      } catch {
        // Ignore invalid saved location.
      }
    }
  }, []);

  const [hospitals, setHospitals] = useState<HospitalItem[]>(fallbackHospitals);

  useEffect(() => {
    setHospitals(readHospitals());
  }, []);

  function getLocation() {
    setStatus("loading");

    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        const coords = {
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        };

        setLocation(coords);
        setStatus("success");

        localStorage.setItem(
          "medikiosk-emergency-location",
          JSON.stringify(coords)
        );
      },
      () => setStatus("error"),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function requestAmbulance() {
    if (!location) {
      getLocation();
      return;
    }

    const request = {
      id: `SOS-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      location,
      patientName,
      status: "REQUEST_CREATED",
      source: "MediKiosk",
      emergencyNumber: "108",
      redFlagReasons,
    };

    localStorage.setItem(
      "medikiosk-ambulance-request",
      JSON.stringify(request)
    );

    setAmbulance(true);
  }

  function openMaps(query: string) {
    const encoded = encodeURIComponent(query);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF7F7] text-[#10201D]">
      <PatientNav />

      <section className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* SOS Banner */}
          <div className="rounded-3xl border-2 border-red-300 bg-red-50 p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600 shadow-lg">
                <ShieldAlert className="h-7 w-7 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wider text-white">
                    SOS ACTIVE
                  </span>
                  <span className="text-xs font-semibold text-red-700">
                    {t.warning}
                  </span>
                </div>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-red-700 sm:text-4xl">
                  {t.title}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-900/80 sm:text-base">
                  {t.sub}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-red-200 bg-white p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-bold text-red-700">{t.warning}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5C6B67]">
                    {t.warningText}
                  </p>

                  {redFlagReasons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {redFlagReasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency numbers */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                  <Ambulance className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{t.ambulanceTitle}</h2>
                  <p className="mt-1 text-sm text-[#6B7874]">
                    {t.ambulanceSub}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="tel:108"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-center text-sm font-bold text-white hover:bg-red-700"
                >
                  <Phone className="h-5 w-5" />
                  {t.call108}
                </a>

                <a
                  href="tel:112"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-red-600 px-4 py-3.5 text-center text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  <Phone className="h-5 w-5" />
                  {t.call112}
                </a>
              </div>
            </div>

            {/* GPS */}
            <div className="rounded-2xl border border-[#DCE7E3] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F3]">
                  <MapPin className="h-6 w-6 text-[#1B7A6B]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">{t.gpsTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#6B7874]">
                    {t.gpsText}
                  </p>
                </div>
              </div>

              {status === "success" && location ? (
                <div className="mt-5 rounded-xl border border-[#BBDDD5] bg-[#EAF6F3] p-4">
                  <div className="flex items-center gap-2 font-bold text-[#1B7A6B]">
                    <CheckCircle2 className="h-5 w-5" />
                    {t.ready}
                  </div>
                  <p className="mt-2 text-xs text-[#53615D]">
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>
              ) : status === "error" ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {t.gpsError}
                </div>
              ) : null}

              <button
                type="button"
                disabled={status === "loading"}
                onClick={getLocation}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#1B7A6B] py-3.5 font-bold text-[#1B7A6B] hover:bg-[#EAF6F3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Navigation className="h-5 w-5" />
                )}
                {status === "loading" ? t.detecting : t.allow}
              </button>
            </div>
          </div>

          {/* Ambulance request */}
          <div className="rounded-2xl border-2 border-red-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <h2 className="text-xl font-black">{t.ambulanceTitle}</h2>
                </div>
                <p className="mt-1 text-sm text-[#6B7874]">
                  {location
                    ? "GPS location is ready to attach to the ambulance request."
                    : "Allow GPS first so the ambulance team can receive your location."}
                </p>
              </div>

              {!ambulance && (
                <button
                  type="button"
                  onClick={requestAmbulance}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#10201D] px-6 py-3.5 text-sm font-bold text-white hover:bg-black"
                >
                  <Ambulance className="h-5 w-5" />
                  {t.request}
                </button>
              )}
            </div>

            {ambulance && (
              <div className="mt-5 rounded-2xl border border-[#BBDDD5] bg-[#EAF6F3] p-5">
                <div className="flex items-center gap-2 text-lg font-black text-[#1B7A6B]">
                  <CheckCircle2 className="h-6 w-6" />
                  {t.requested}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#53615D]">
                  {t.requestText}
                </p>
                <div className="mt-4 rounded-xl bg-white p-3 text-xs text-[#53615D]">
                  <b>Demo status:</b> REQUEST_CREATED • Patient:{" "}
                  {patientName}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-[#BBDDD5]">
                  <button
                    type="button"
                    onClick={() => router.push("/patient/documents")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-[#1B7A6B] border border-[#BBDDD5] shadow-xs hover:bg-[#F1F7F5]"
                  >
                    <FileText className="h-4 w-4" />
                    Attach Records
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/patient/summary")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-[#2F4C7A] border border-[#BBDDD5] shadow-xs hover:bg-[#F1F7F5]"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/patient/booking")}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-[#10201D] border border-[#BBDDD5] shadow-xs hover:bg-[#F1F7F5]"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Book Priority OPD
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connected Clinical Services (Post-SOS Flow) */}
          <div className="rounded-2xl border-2 border-[#1B7A6B]/20 bg-gradient-to-br from-white to-[#F7FAF9] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF6F3] text-[#1B7A6B]">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-black text-[#10201D]">
                    {t.connectedCareTitle}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-[#5C6B67]">
                  {t.connectedCareSub}
                </p>
              </div>

              <span className="hidden rounded-full bg-[#EAF6F3] px-3 py-1 text-xs font-bold text-[#1B7A6B] sm:inline-block">
                Patient Portal
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {/* 1. Documents & Medical Records */}
              <div className="group flex flex-col justify-between rounded-xl border border-[#E3E9E6] bg-white p-5 transition hover:border-[#1B7A6B] hover:shadow-md">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6F3] text-[#1B7A6B] transition group-hover:scale-105">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-base text-[#10201D]">
                    {t.docsTitle}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5C6B67]">
                    {t.docsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/patient/documents")}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1B7A6B] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#155F53] active:scale-[0.99]"
                >
                  <span>{t.docsBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* 2. AI Clinical Summary */}
              <div className="group flex flex-col justify-between rounded-xl border border-[#E3E9E6] bg-white p-5 transition hover:border-[#2F4C7A] hover:shadow-md">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9EEF6] text-[#2F4C7A] transition group-hover:scale-105">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-base text-[#10201D]">
                    {t.summaryTitle}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5C6B67]">
                    {t.summaryDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/patient/summary")}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2F4C7A] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#233B60] active:scale-[0.99]"
                >
                  <span>{t.summaryBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* 3. Appointment Booking */}
              <div className="group flex flex-col justify-between rounded-xl border border-[#E3E9E6] bg-white p-5 transition hover:border-[#10201D] hover:shadow-md">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F5F4] text-[#10201D] transition group-hover:scale-105">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-bold text-base text-[#10201D]">
                    {t.bookingTitle}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5C6B67]">
                    {t.bookingDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/patient/booking")}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#10201D] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-black active:scale-[0.99]"
                >
                  <span>{t.bookingBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Nearby hospitals */}
          <div className="rounded-2xl border border-[#DCE7E3] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Hospital className="h-5 w-5 text-[#1B7A6B]" />
                  <h2 className="text-xl font-black">{t.hospitals}</h2>
                </div>
                <p className="mt-1 text-sm text-[#6B7874]">
                  {t.hospitalsSub}
                </p>
              </div>

              <span className="hidden rounded-full bg-[#EAF6F3] px-3 py-1.5 text-xs font-bold text-[#1B7A6B] sm:block">
                Emergency Ready
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="rounded-xl border border-[#E3E9E6] p-4 transition hover:border-[#BBDDD5]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F7F5]">
                        <Hospital className="h-5 w-5 text-[#1B7A6B]" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold">{hospital.name}</h3>
                        <p className="mt-1 text-sm text-[#6B7874]">
                          {hospital.type} • {hospital.area}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-[#EAF6F3] px-2.5 py-1 font-semibold text-[#1B7A6B]">
                            {t.emergency}
                          </span>
                          <span className="rounded-full bg-[#F4F5F4] px-2.5 py-1 font-semibold text-[#5C6B67]">
                            {hospital.distance || t.distance}
                          </span>
                          <span className="rounded-full bg-[#F4F5F4] px-2.5 py-1 font-semibold text-[#5C6B67]">
                            ★ {hospital.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openMaps(
                          location
                            ? `${hospital.name}, ${hospital.area}`
                            : `${hospital.name} near me`
                        )
                      }
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#BBDDD5] px-4 py-2.5 text-sm font-bold text-[#1B7A6B] hover:bg-[#EAF6F3]"
                    >
                      <MapPin className="h-4 w-4" />
                      {t.map}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs leading-relaxed text-amber-900">
            {t.disclaimer}
          </div>
        </div>
      </section>
    </main>
  );
}
