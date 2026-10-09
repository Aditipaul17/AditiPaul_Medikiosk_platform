"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Navigation,
  Stethoscope,
  CalendarDays,
  Clock3,
  Star,
  Building2,
  ChevronRight,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Phone,
  X,
} from "lucide-react";

type LanguageKey =
  | "english"
  |  "hindi"
  | "marathi"
  | "bengali"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "punjabi";

type Hospital = {
  id: string;
  name: string;
  area: string;
  distance: string;
  rating: string;
  type: string;
  emergency: boolean;
};

type Specialist = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  rating: string;
  nextSlot: string;
  fee: string;
  status?: "Active" | "Pending" | string;
  licenseNumber?: string;
};

const hospitals: Hospital[] = [
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
    emergency: false,
  },
];

// Doctor list comes from the Admin Dashboard database.
// Source of truth: localStorage key "medikiosk-doctors".

const translations: Record<
  LanguageKey,
  {
    title: string;
    subtitle: string;
    recommended: string;
    basedOn: string;
    location: string;
    useLocation: string;
    hospitals: string;
    specialists: string;
    nearby: string;
    emergency: string;
    kmAway: string;
    available: string;
    book: string;
    viewDoctors: string;
    search: string;
    searchPlaceholder: string;
    rating: string;
    experience: string;
    nextSlot: string;
    consultation: string;
    selected: string;
    continue: string;
    back: string;
    secure: string;
    map: string;
    close: string;
    doctorSelected: string;
    noResults: string;
  }
> = {
  english: {
    title: "Care Navigation",
    subtitle:
      "Find the right hospital and specialist based on your consultation needs.",
    recommended: "Recommended for you",
    basedOn:
      "Based on the information provided during your intake.",
    location: "Your Location",
    useLocation: "Use current location",
    hospitals: "Nearby Hospitals",
    specialists: "Recommended Specialists",
    nearby: "Nearby",
    emergency: "Emergency Care",
    kmAway: "away",
    available: "Available",
    book: "Book Appointment",
    viewDoctors: "View Doctors",
    search: "Search",
    searchPlaceholder:
      "Search hospital or specialist...",
    rating: "Rating",
    experience: "Experience",
    nextSlot: "Next available",
    consultation: "Consultation",
    selected: "Selected",
    continue: "Continue to Booking",
    back: "Back",
    secure: "Care navigation is based on available information",
    map: "View on Map",
    close: "Close",
    doctorSelected: "Doctor selected",
    noResults: "No matching results found.",
  },

  hindi: {
    title: "केयर नेविगेशन",
    subtitle:
      "अपनी ज़रूरत के अनुसार सही अस्पताल और विशेषज्ञ खोजें।",
    recommended: "आपके लिए सुझाया गया",
    basedOn:
      "आपके द्वारा दी गई जानकारी के आधार पर।",
    location: "आपका स्थान",
    useLocation: "वर्तमान स्थान इस्तेमाल करें",
    hospitals: "नज़दीकी अस्पताल",
    specialists: "सुझाए गए विशेषज्ञ",
    nearby: "नज़दीकी",
    emergency: "इमरजेंसी सेवा",
    kmAway: "दूर",
    available: "उपलब्ध",
    book: "अपॉइंटमेंट बुक करें",
    viewDoctors: "डॉक्टर देखें",
    search: "खोजें",
    searchPlaceholder:
      "अस्पताल या विशेषज्ञ खोजें...",
    rating: "रेटिंग",
    experience: "अनुभव",
    nextSlot: "अगला उपलब्ध समय",
    consultation: "कंसल्टेशन",
    selected: "चयनित",
    continue: "बुकिंग पर जाएं",
    back: "वापस",
    secure:
      "केयर नेविगेशन उपलब्ध जानकारी के आधार पर है",
    map: "मैप पर देखें",
    close: "बंद करें",
    doctorSelected: "डॉक्टर चुना गया",
    noResults: "कोई परिणाम नहीं मिला।",
  },

  marathi: {
    title: "केअर नेव्हिगेशन",
    subtitle:
      "तुमच्या गरजेनुसार योग्य हॉस्पिटल आणि तज्ज्ञ शोधा.",
    recommended: "तुमच्यासाठी सुचवलेले",
    basedOn:
      "तुम्ही दिलेल्या माहितीनुसार.",
    location: "तुमचे स्थान",
    useLocation: "सध्याचे स्थान वापरा",
    hospitals: "जवळची हॉस्पिटल्स",
    specialists: "सुचवलेले तज्ज्ञ",
    nearby: "जवळचे",
    emergency: "आपत्कालीन सेवा",
    kmAway: "अंतर",
    available: "उपलब्ध",
    book: "अपॉइंटमेंट बुक करा",
    viewDoctors: "डॉक्टर पहा",
    search: "शोधा",
    searchPlaceholder:
      "हॉस्पिटल किंवा तज्ज्ञ शोधा...",
    rating: "रेटिंग",
    experience: "अनुभव",
    nextSlot: "पुढील उपलब्ध वेळ",
    consultation: "कन्सल्टेशन",
    selected: "निवडले",
    continue: "बुकिंगकडे जा",
    back: "मागे",
    secure:
      "केअर नेव्हिगेशन उपलब्ध माहितीवर आधारित आहे",
    map: "नकाशावर पहा",
    close: "बंद करा",
    doctorSelected: "डॉक्टर निवडला",
    noResults: "कोणतेही परिणाम सापडले नाहीत.",
  },

  bengali: {
    title: "কেয়ার নেভিগেশন",
    subtitle:
      "আপনার প্রয়োজন অনুযায়ী সঠিক হাসপাতাল ও বিশেষজ্ঞ খুঁজুন।",
    recommended: "আপনার জন্য সুপারিশ",
    basedOn:
      "আপনার দেওয়া তথ্যের ভিত্তিতে।",
    location: "আপনার অবস্থান",
    useLocation: "বর্তমান অবস্থান ব্যবহার করুন",
    hospitals: "কাছাকাছি হাসপাতাল",
    specialists: "সুপারিশকৃত বিশেষজ্ঞ",
    nearby: "কাছাকাছি",
    emergency: "জরুরি সেবা",
    kmAway: "দূরে",
    available: "উপলব্ধ",
    book: "অ্যাপয়েন্টমেন্ট বুক করুন",
    viewDoctors: "ডাক্তার দেখুন",
    search: "খুঁজুন",
    searchPlaceholder:
      "হাসপাতাল বা বিশেষজ্ঞ খুঁজুন...",
    rating: "রেটিং",
    experience: "অভিজ্ঞতা",
    nextSlot: "পরবর্তী সময়",
    consultation: "কনসালটেশন",
    selected: "নির্বাচিত",
    continue: "বুকিংয়ে যান",
    back: "পিছনে",
    secure:
      "কেয়ার নেভিগেশন উপলব্ধ তথ্যের ভিত্তিতে",
    map: "ম্যাপে দেখুন",
    close: "বন্ধ করুন",
    doctorSelected: "ডাক্তার নির্বাচিত",
    noResults: "কোনো ফলাফল পাওয়া যায়নি।",
  },

  gujarati: {
    title: "કેર નેવિગેશન",
    subtitle:
      "તમારી જરૂરિયાત મુજબ યોગ્ય હોસ્પિટલ અને નિષ્ણાત શોધો.",
    recommended: "તમારા માટે ભલામણ",
    basedOn:
      "તમે આપેલી માહિતીના આધારે.",
    location: "તમારું સ્થાન",
    useLocation: "વર્તમાન સ્થાનનો ઉપયોગ કરો",
    hospitals: "નજીકની હોસ્પિટલો",
    specialists: "ભલામણ કરેલા નિષ્ણાતો",
    nearby: "નજીક",
    emergency: "ઇમરજન્સી સેવા",
    kmAway: "દૂર",
    available: "ઉપલબ્ધ",
    book: "અપોઇન્ટમેન્ટ બુક કરો",
    viewDoctors: "ડૉક્ટર જુઓ",
    search: "શોધો",
    searchPlaceholder:
      "હોસ્પિટલ અથવા નિષ્ણાત શોધો...",
    rating: "રેટિંગ",
    experience: "અનુભવ",
    nextSlot: "આગળનો સમય",
    consultation: "કન્સલ્ટેશન",
    selected: "પસંદ કરેલ",
    continue: "બુકિંગ પર જાઓ",
    back: "પાછા",
    secure:
      "કેર નેવિગેશન ઉપલબ્ધ માહિતી પર આધારિત છે",
    map: "નકશા પર જુઓ",
    close: "બંધ કરો",
    doctorSelected: "ડૉક્ટર પસંદ કર્યો",
    noResults: "કોઈ પરિણામ મળ્યું નથી.",
  },

  tamil: {
    title: "கேர் நேவிகேஷன்",
    subtitle:
      "உங்கள் தேவைக்கு ஏற்ற மருத்துவமனை மற்றும் நிபுணரைத் தேர்வு செய்யுங்கள்.",
    recommended: "உங்களுக்கான பரிந்துரை",
    basedOn:
      "நீங்கள் வழங்கிய தகவலின் அடிப்படையில்.",
    location: "உங்கள் இருப்பிடம்",
    useLocation: "தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    hospitals: "அருகிலுள்ள மருத்துவமனைகள்",
    specialists: "பரிந்துரைக்கப்பட்ட நிபுணர்கள்",
    nearby: "அருகில்",
    emergency: "அவசர சேவை",
    kmAway: "தொலைவில்",
    available: "கிடைக்கும்",
    book: "அப்பாயின்ட்மெண்ட் பதிவு",
    viewDoctors: "மருத்துவர்களைப் பார்க்கவும்",
    search: "தேடுக",
    searchPlaceholder:
      "மருத்துவமனை அல்லது நிபுணரைத் தேடுங்கள்...",
    rating: "மதிப்பீடு",
    experience: "அனுபவம்",
    nextSlot: "அடுத்த நேரம்",
    consultation: "ஆலோசனை",
    selected: "தேர்ந்தெடுக்கப்பட்டது",
    continue: "புக்கிங்கிற்கு செல்லவும்",
    back: "பின்செல்",
    secure:
      "கிடைக்கும் தகவலின் அடிப்படையில் கேர் நேவிகேஷன்",
    map: "வரைபடத்தில் பார்க்கவும்",
    close: "மூடு",
    doctorSelected: "மருத்துவர் தேர்ந்தெடுக்கப்பட்டார்",
    noResults: "முடிவுகள் எதுவும் இல்லை.",
  },

  telugu: {
    title: "కేర్ నావిగేషన్",
    subtitle:
      "మీ అవసరానికి సరైన ఆసుపత్రి మరియు నిపుణుడిని కనుగొనండి.",
    recommended: "మీ కోసం సిఫార్సు",
    basedOn:
      "మీరు అందించిన సమాచారాన్ని ఆధారంగా.",
    location: "మీ స్థానం",
    useLocation: "ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    hospitals: "సమీపంలోని ఆసుపత్రులు",
    specialists: "సిఫార్సు చేసిన నిపుణులు",
    nearby: "సమీపంలో",
    emergency: "అత్యవసర సేవ",
    kmAway: "దూరంలో",
    available: "అందుబాటులో",
    book: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    viewDoctors: "డాక్టర్లను చూడండి",
    search: "వెతకండి",
    searchPlaceholder:
      "ఆసుపత్రి లేదా నిపుణుడిని వెతకండి...",
    rating: "రేటింగ్",
    experience: "అనుభవం",
    nextSlot: "తదుపరి సమయం",
    consultation: "కన్సల్టేషన్",
    selected: "ఎంచుకోబడింది",
    continue: "బుకింగ్‌కు వెళ్లండి",
    back: "వెనుకకు",
    secure:
      "కేర్ నావిగేషన్ అందుబాటులో ఉన్న సమాచారం ఆధారంగా ఉంటుంది",
    map: "మ్యాప్‌లో చూడండి",
    close: "మూసివేయండి",
    doctorSelected: "డాక్టర్ ఎంపికయ్యారు",
    noResults: "ఫలితాలు కనుగొనబడలేదు.",
  },

  kannada: {
    title: "ಕೇರ್ ನ್ಯಾವಿಗೇಶನ್",
    subtitle:
      "ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಸರಿಯಾದ ಆಸ್ಪತ್ರೆ ಮತ್ತು ತಜ್ಞರನ್ನು ಹುಡುಕಿ.",
    recommended: "ನಿಮಗಾಗಿ ಶಿಫಾರಸು",
    basedOn:
      "ನೀವು ನೀಡಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ.",
    location: "ನಿಮ್ಮ ಸ್ಥಳ",
    useLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ",
    hospitals: "ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು",
    specialists: "ಶಿಫಾರಸು ಮಾಡಿದ ತಜ್ಞರು",
    nearby: "ಹತ್ತಿರ",
    emergency: "ತುರ್ತು ಸೇವೆ",
    kmAway: "ದೂರ",
    available: "ಲಭ್ಯವಿದೆ",
    book: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    viewDoctors: "ವೈದ್ಯರನ್ನು ನೋಡಿ",
    search: "ಹುಡುಕಿ",
    searchPlaceholder:
      "ಆಸ್ಪತ್ರೆ ಅಥವಾ ತಜ್ಞರನ್ನು ಹುಡುಕಿ...",
    rating: "ರೇಟಿಂಗ್",
    experience: "ಅನುಭವ",
    nextSlot: "ಮುಂದಿನ ಸಮಯ",
    consultation: "ಸಮಾಲೋಚನೆ",
    selected: "ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ",
    continue: "ಬುಕಿಂಗ್‌ಗೆ ಹೋಗಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    secure:
      "ಕೇರ್ ನ್ಯಾವಿಗೇಶನ್ ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಆಧರಿಸಿದೆ",
    map: "ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ",
    close: "ಮುಚ್ಚಿ",
    doctorSelected: "ವೈದ್ಯರನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
    noResults: "ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ.",
  },

  malayalam: {
    title: "കെയർ നാവിഗേഷൻ",
    subtitle:
      "നിങ്ങളുടെ ആവശ്യത്തിന് അനുയോജ്യമായ ആശുപത്രിയും വിദഗ്ധനെയും കണ്ടെത്തുക.",
    recommended: "നിങ്ങൾക്കുള്ള ശുപാർശ",
    basedOn:
      "നിങ്ങൾ നൽകിയ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ.",
    location: "നിങ്ങളുടെ സ്ഥാനം",
    useLocation: "നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക",
    hospitals: "അടുത്തുള്ള ആശുപത്രികൾ",
    specialists: "ശുപാർശ ചെയ്യുന്ന വിദഗ്ധർ",
    nearby: "അടുത്ത്",
    emergency: "അടിയന്തര സേവനം",
    kmAway: "അകലെ",
    available: "ലഭ്യമാണ്",
    book: "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക",
    viewDoctors: "ഡോക്ടർമാരെ കാണുക",
    search: "തിരയുക",
    searchPlaceholder:
      "ആശുപത്രി അല്ലെങ്കിൽ വിദഗ്ധനെ തിരയുക...",
    rating: "റേറ്റിംഗ്",
    experience: "പരിചയം",
    nextSlot: "അടുത്ത സമയം",
    consultation: "കൺസൾട്ടേഷൻ",
    selected: "തിരഞ്ഞെടുത്തു",
    continue: "ബുക്കിംഗിലേക്ക് പോകുക",
    back: "തിരികെ",
    secure:
      "ലഭ്യമായ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിലാണ് കെയർ നാവിഗേഷൻ",
    map: "മാപ്പിൽ കാണുക",
    close: "അടയ്ക്കുക",
    doctorSelected: "ഡോക്ടറെ തിരഞ്ഞെടുത്തു",
    noResults: "ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല.",
  },

  punjabi: {
    title: "ਕੇਅਰ ਨੇਵੀਗੇਸ਼ਨ",
    subtitle:
      "ਆਪਣੀ ਲੋੜ ਅਨੁਸਾਰ ਸਹੀ ਹਸਪਤਾਲ ਅਤੇ ਮਾਹਿਰ ਲੱਭੋ।",
    recommended: "ਤੁਹਾਡੇ ਲਈ ਸਿਫਾਰਸ਼",
    basedOn:
      "ਤੁਹਾਡੇ ਵੱਲੋਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ 'ਤੇ।",
    location: "ਤੁਹਾਡੀ ਜਗ੍ਹਾ",
    useLocation: "ਮੌਜੂਦਾ ਸਥਾਨ ਵਰਤੋ",
    hospitals: "ਨੇੜਲੇ ਹਸਪਤਾਲ",
    specialists: "ਸਿਫਾਰਸ਼ ਕੀਤੇ ਮਾਹਿਰ",
    nearby: "ਨੇੜੇ",
    emergency: "ਐਮਰਜੈਂਸੀ ਸੇਵਾ",
    kmAway: "ਦੂਰ",
    available: "ਉਪਲਬਧ",
    book: "ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    viewDoctors: "ਡਾਕਟਰ ਵੇਖੋ",
    search: "ਖੋਜੋ",
    searchPlaceholder:
      "ਹਸਪਤਾਲ ਜਾਂ ਮਾਹਿਰ ਖੋਜੋ...",
    rating: "ਰੇਟਿੰਗ",
    experience: "ਤਜਰਬਾ",
    nextSlot: "ਅਗਲਾ ਸਮਾਂ",
    consultation: "ਕਨਸਲਟੇਸ਼ਨ",
    selected: "ਚੁਣਿਆ ਗਿਆ",
    continue: "ਬੁਕਿੰਗ ਵੱਲ ਜਾਓ",
    back: "ਵਾਪਸ",
    secure:
      "ਕੇਅਰ ਨੇਵੀਗੇਸ਼ਨ ਉਪਲਬਧ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ 'ਤੇ ਹੈ",
    map: "ਨਕਸ਼ੇ 'ਤੇ ਵੇਖੋ",
    close: "ਬੰਦ ਕਰੋ",
    doctorSelected: "ਡਾਕਟਰ ਚੁਣਿਆ ਗਿਆ",
    noResults: "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ।",
  },
};

export default function PatientCareNavigationPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedDoctor, setSelectedDoctor] =
    useState<Specialist | null>(null);

  const [specialists, setSpecialists] =
    useState<Specialist[]>([]);

  const [doctorsLoading, setDoctorsLoading] =
    useState(true);

  const [locationEnabled, setLocationEnabled] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState<"hospitals" | "specialists">(
      "hospitals"
    );

  const [showMap, setShowMap] =
    useState(false);

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "medikiosk-language"
      ) as LanguageKey | null;

    if (
      savedLanguage &&
      translations[savedLanguage]
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const loadDoctors = () => {
      try {
        const stored = localStorage.getItem("medikiosk-doctors");

        if (!stored) {
          setSpecialists([]);
          return;
        }

        const doctors = JSON.parse(stored);

        if (!Array.isArray(doctors)) {
          setSpecialists([]);
          return;
        }

        const mappedDoctors: Specialist[] = doctors.map((doctor) => ({
          id: String(doctor.id ?? `DOC-${Date.now()}`),
          name: String(doctor.name ?? "Doctor"),
          specialty: String(
            doctor.specialization ||
              doctor.department ||
              "Medical Specialist"
          ),
          hospital: String(
            doctor.hospital || "City Care Hospital"
          ),
          experience: String(
            doctor.experience || "Experience not available"
          ),
          rating: String(doctor.rating || "New"),
          nextSlot: String(
            doctor.nextSlot || "Availability to be confirmed"
          ),
          fee: String(doctor.fee || "Consultation fee"),
          status: doctor.status,
          licenseNumber: doctor.licenseNumber,
        }));

        setSpecialists(mappedDoctors);

        // Clear stale selection if Admin removed that doctor.
        setSelectedDoctor((current) => {
          if (!current) return null;
          return mappedDoctors.find((d) => d.id === current.id) || null;
        });
      } catch {
        setSpecialists([]);
        setSelectedDoctor(null);
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();

    // Sync when Admin updates doctors from another browser tab.
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "medikiosk-doctors") {
        loadDoctors();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const t = translations[language];

  const filteredHospitals =
    hospitals.filter((hospital) =>
      `${hospital.name} ${hospital.area} ${hospital.type}`
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  const filteredSpecialists =
    specialists.filter((doctor) =>
      `${doctor.name} ${doctor.specialty} ${doctor.hospital}`
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  function useLocation() {
    setLocationEnabled(true);

    if (
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
        },
        () => {
          setLocationEnabled(true);
        }
      );
    }
  }

  function chooseDoctor(
    doctor: Specialist
  ) {
    setSelectedDoctor(doctor);

    localStorage.setItem(
      "medikiosk-selected-doctor",
      JSON.stringify(doctor)
    );

    setActiveTab("specialists");

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  function continueToBooking() {
    if (!selectedDoctor) {
      setActiveTab("specialists");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    router.push(
      "/patient/booking"
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-md bg-[#10201D] flex items-center justify-center">

            <Activity
              className="w-4 h-4 text-white"
              strokeWidth={2.5}
            />

          </div>

          <span className="font-semibold tracking-tight text-[#10201D]">
            MEDIKIOSK
          </span>

        </div>

        <Link
          href="/patient/summary"
          className="flex items-center gap-2 text-sm font-medium text-[#5C6B67] hover:text-[#10201D] cursor-pointer"
        >

          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">
            {t.back}
          </span>

        </Link>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="px-4 sm:px-6 pb-10">

        <div className="max-w-6xl mx-auto">

          {/* TITLE */}

          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <Navigation
                className="w-7 h-7 text-[#1B7A6B]"
              />

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10201D]">
              {t.title}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#66736F] max-w-2xl mx-auto">
              {t.subtitle}
            </p>

          </div>


          {/* =====================================================
              RECOMMENDATION BANNER
          ===================================================== */}

          <div className="rounded-2xl bg-[#10201D] text-white p-5 sm:p-6 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">

                <Sparkles className="w-6 h-6" />

              </div>

              <div className="flex-1">

                <p className="text-sm font-semibold">
                  {t.recommended}
                </p>

                <p className="text-xs sm:text-sm text-white/70 mt-1">
                  {t.basedOn}
                </p>

              </div>

              <div className="text-left sm:text-right">

                <p className="text-xs text-white/60">
                  Suggested specialty
                </p>

                <p className="font-semibold">
                  General Physician
                </p>

              </div>

            </div>

          </div>


          {/* =====================================================
              LOCATION
          ===================================================== */}

          <div className="bg-white rounded-2xl border border-[#E1E5E3] p-4 sm:p-5 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <div className="flex items-center gap-3 flex-1">

                <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] flex items-center justify-center">

                  <MapPin className="w-5 h-5 text-[#1B7A6B]" />

                </div>

                <div>

                  <p className="text-xs text-[#7B8783]">
                    {t.location}
                  </p>

                  <p className="font-medium text-[#10201D]">
                    {locationEnabled
                      ? "Location detected"
                      : "City Center"}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={useLocation}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer ${
                  locationEnabled
                    ? "bg-[#EAF6F3] text-[#1B7A6B]"
                    : "border border-[#DCE5E1] text-[#53615D] hover:border-[#1B7A6B]"
                }`}
              >

                <Navigation className="w-4 h-4" />

                {locationEnabled
                  ? "Location enabled"
                  : t.useLocation}

              </button>

            </div>

          </div>


          {/* =====================================================
              SEARCH
          ===================================================== */}

          <div className="relative mb-5">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#89938F]" />

            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder={
                t.searchPlaceholder
              }
              className="w-full h-12 rounded-xl border border-[#DDE5E2] bg-white pl-12 pr-4 text-sm sm:text-base text-[#10201D] placeholder:text-[#A0AAA7] focus:outline-none focus:ring-2 focus:ring-[#1B7A6B]"
            />

          </div>


          {/* =====================================================
              TABS
          ===================================================== */}

          <div className="bg-white rounded-xl border border-[#E1E5E3] p-1.5 flex gap-1 mb-5">

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "hospitals"
                )
              }
              className={`flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                activeTab ===
                "hospitals"
                  ? "bg-[#1B7A6B] text-white"
                  : "text-[#53615D] hover:bg-[#F1F5F3]"
              }`}
            >
              {t.hospitals}
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "specialists"
                )
              }
              className={`flex-1 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                activeTab ===
                "specialists"
                  ? "bg-[#1B7A6B] text-white"
                  : "text-[#53615D] hover:bg-[#F1F5F3]"
              }`}
            >
              {t.specialists}
            </button>

          </div>


          {/* =====================================================
              HOSPITALS
          ===================================================== */}

          {activeTab ===
            "hospitals" && (
            <div>

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-xl font-semibold text-[#10201D]">
                    {t.nearby}
                  </h2>

                  <p className="text-sm text-[#75817D]">
                    {t.hospitals}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowMap(true)
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1B7A6B] cursor-pointer"
                >

                  <MapPin className="w-4 h-4" />

                  {t.map}

                </button>

              </div>


              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {filteredHospitals.length ===
                0 ? (
                  <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E1E5E3] p-10 text-center text-[#75817D]">
                    {t.noResults}
                  </div>
                ) : (
                  filteredHospitals.map(
                    (hospital) => (
                      <div
                        key={hospital.id}
                        className="bg-white rounded-2xl border border-[#E1E5E3] p-5 hover:border-[#B6D1CA] transition-colors"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="w-11 h-11 rounded-xl bg-[#EAF6F3] flex items-center justify-center shrink-0">

                            <Building2 className="w-5 h-5 text-[#1B7A6B]" />

                          </div>

                          <div className="flex items-center gap-1 text-sm font-medium text-[#7A6A28]">

                            <Star className="w-4 h-4 fill-current" />

                            {hospital.rating}

                          </div>

                        </div>


                        <h3 className="font-semibold text-[#10201D] mt-4 leading-snug">
                          {hospital.name}
                        </h3>

                        <p className="text-sm text-[#75817D] mt-1">
                          {hospital.type}
                        </p>


                        <div className="flex items-center gap-2 mt-4 text-sm text-[#53615D]">

                          <MapPin className="w-4 h-4 text-[#1B7A6B]" />

                          {hospital.area}

                          <span className="text-[#B1BBB7]">
                            •
                          </span>

                          {hospital.distance}{" "}
                          {t.kmAway}

                        </div>


                        {hospital.emergency && (
                          <div className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-[#F1F6F4] text-[#1B7A6B] px-3 py-1 text-xs font-medium">

                            <CheckCircle2 className="w-3.5 h-3.5" />

                            {t.emergency}

                          </div>
                        )}


                        <button
                          type="button"
                          onClick={() =>
                            setActiveTab(
                              "specialists"
                            )
                          }
                          className="w-full mt-5 rounded-xl border border-[#DDE5E2] py-3 text-sm font-semibold text-[#1B7A6B] hover:bg-[#F3F8F6] flex items-center justify-center gap-2 cursor-pointer"
                        >

                          {t.viewDoctors}

                          <ChevronRight className="w-4 h-4" />

                        </button>

                      </div>
                    )
                  )
                )}

              </div>

            </div>
          )}


          {/* =====================================================
              SPECIALISTS
          ===================================================== */}

          {activeTab ===
            "specialists" && (
            <div>

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-xl font-semibold text-[#10201D]">
                    {t.specialists}
                  </h2>

                  <p className="text-sm text-[#75817D]">
                    Doctors registered by hospital administration
                  </p>

                </div>

              </div>


              <div className="space-y-4">

                {doctorsLoading ? (
                  <div className="bg-white rounded-2xl border border-[#E1E5E3] p-10 text-center text-[#75817D]">
                    Loading available doctors...
                  </div>
                ) : filteredSpecialists.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E1E5E3] p-10 text-center">
                    <Stethoscope className="w-8 h-8 text-[#8A9491] mx-auto mb-3" />
                    <p className="font-semibold text-[#10201D]">
                      No doctors available
                    </p>
                    <p className="text-sm text-[#75817D] mt-1">
                      Doctors added by hospital administration will appear here.
                    </p>
                  </div>
                ) : (
                  filteredSpecialists.map(
                    (doctor) => {
                      const isSelected =
                        selectedDoctor?.id ===
                        doctor.id;

                      return (
                        <div
                          key={doctor.id}
                          className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                            isSelected
                              ? "border-[#1B7A6B] ring-1 ring-[#1B7A6B]"
                              : "border-[#E1E5E3]"
                          }`}
                        >

                          <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                            {/* DOCTOR */}

                            <div className="flex items-center gap-4 flex-1">

                              <div className="w-14 h-14 rounded-full bg-[#EAF6F3] flex items-center justify-center shrink-0">

                                <Stethoscope className="w-7 h-7 text-[#1B7A6B]" />

                              </div>

                              <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <h3 className="font-semibold text-lg text-[#10201D]">
                                    {doctor.name}
                                  </h3>

                                  {isSelected && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF6F3] text-[#1B7A6B] px-2.5 py-1 text-xs font-semibold">

                                      <CheckCircle2 className="w-3 h-3" />

                                      {t.selected}

                                    </span>
                                  )}

                                  {doctor.status && (
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        doctor.status === "Active"
                                          ? "bg-[#EAF6F3] text-[#1B7A6B]"
                                          : "bg-[#FFF5E6] text-[#A66A00]"
                                      }`}
                                    >
                                      {doctor.status}
                                    </span>
                                  )}

                                </div>

                                <p className="text-sm text-[#1B7A6B] font-medium mt-1">
                                  {doctor.specialty}
                                </p>

                                <p className="text-sm text-[#75817D] mt-1">
                                  {doctor.hospital}
                                </p>

                              </div>

                            </div>


                            {/* INFO */}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-[520px]">

                              <div>

                                <p className="text-xs text-[#8A9491]">
                                  {t.rating}
                                </p>

                                <p className="flex items-center gap-1 font-semibold text-sm text-[#10201D] mt-1">

                                  <Star className="w-3.5 h-3.5 text-[#8B7728] fill-current" />

                                  {doctor.rating}

                                </p>

                              </div>

                              <div>

                                <p className="text-xs text-[#8A9491]">
                                  {t.experience}
                                </p>

                                <p className="font-semibold text-sm text-[#10201D] mt-1">
                                  {doctor.experience.replace(
                                    " experience",
                                    ""
                                  )}
                                </p>

                              </div>

                              <div>

                                <p className="text-xs text-[#8A9491]">
                                  {t.nextSlot}
                                </p>

                                <p className="font-semibold text-sm text-[#10201D] mt-1">
                                  {doctor.nextSlot}
                                </p>

                              </div>

                              <div>

                                <p className="text-xs text-[#8A9491]">
                                  {t.consultation}
                                </p>

                                <p className="font-semibold text-sm text-[#10201D] mt-1">
                                  {doctor.fee}
                                </p>

                              </div>

                            </div>


                            {/* BOOK */}

                            <button
                              type="button"
                              onClick={() =>
                                chooseDoctor(
                                  doctor
                                )
                              }
                              className={`lg:w-48 rounded-xl py-3.5 px-4 font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                                isSelected
                                  ? "bg-[#EAF6F3] text-[#1B7A6B]"
                                  : "bg-[#1B7A6B] text-white hover:bg-[#166358]"
                              }`}
                            >

                              {isSelected
                                ? t.selected
                                : t.book}

                              <ChevronRight className="w-4 h-4" />

                            </button>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

            </div>
          )}


          {/* =====================================================
              CONTINUE
          ===================================================== */}

          <div className="mt-7">

            <button
              type="button"
              onClick={
                continueToBooking
              }
              className="w-full rounded-xl bg-[#1B7A6B] text-white py-4 px-6 font-semibold flex items-center justify-center gap-2 hover:bg-[#166358] cursor-pointer"
            >

              {selectedDoctor
                ? `${t.continue} • ${selectedDoctor.name}`
                : t.continue}

              <ArrowRight className="w-5 h-5" />

            </button>

          </div>


          {/* FOOTER */}

          <div className="flex items-center justify-center gap-2 mt-5 text-xs sm:text-sm text-[#7B8783] text-center">

            <ShieldCheck className="w-4 h-4 text-[#1B7A6B] shrink-0" />

            <span>
              {t.secure}
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAP MODAL
      ===================================================== */}

      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">

            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E5EAE8]">

              <div className="flex items-center gap-2">

                <MapPin className="w-5 h-5 text-[#1B7A6B]" />

                <h2 className="font-semibold text-[#10201D]">
                  {t.map}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMap(false)
                }
                className="w-9 h-9 rounded-lg hover:bg-[#F1F5F3] flex items-center justify-center cursor-pointer"
              >

                <X className="w-5 h-5 text-[#687570]" />

              </button>

            </div>


            {/* DEMO MAP */}

            <div className="h-[360px] bg-[#EAF0ED] relative overflow-hidden">

              <div className="absolute inset-0 opacity-40">

                <div className="absolute top-16 left-0 right-0 h-3 bg-white rotate-3" />

                <div className="absolute top-40 left-0 right-0 h-4 bg-white -rotate-6" />

                <div className="absolute top-64 left-0 right-0 h-3 bg-white rotate-2" />

                <div className="absolute left-24 top-0 bottom-0 w-3 bg-white rotate-12" />

                <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-white -rotate-6" />

                <div className="absolute right-28 top-0 bottom-0 w-3 bg-white rotate-8" />

              </div>


              <div className="absolute left-[24%] top-[35%]">

                <div className="w-12 h-12 rounded-full bg-[#1B7A6B] border-4 border-white shadow-lg flex items-center justify-center">

                  <MapPin className="w-6 h-6 text-white" />

                </div>

              </div>


              <div className="absolute left-[57%] top-[52%]">

                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#1B7A6B] shadow-lg flex items-center justify-center">

                  <Building2 className="w-5 h-5 text-[#1B7A6B]" />

                </div>

              </div>


              <div className="absolute left-[72%] top-[25%]">

                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#1B7A6B] shadow-lg flex items-center justify-center">

                  <Building2 className="w-5 h-5 text-[#1B7A6B]" />

                </div>

              </div>


              <div className="absolute bottom-5 left-5 right-5 bg-white rounded-xl p-4 shadow-lg">

                <div className="flex items-center gap-3">

                  <MapPin className="w-5 h-5 text-[#1B7A6B]" />

                  <div>

                    <p className="font-semibold text-sm text-[#10201D]">
                      3 hospitals found nearby
                    </p>

                    <p className="text-xs text-[#75817D]">
                      Distances shown are demo data
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}