"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  Keyboard,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type LanguageKey =
  | "english"
  | "hindi"
  | "marathi"
  | "bengali"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "punjabi";

type InputMode = "voice" | "touch";

type Question = {
  id: string;
  category: string;
  questions: Record<LanguageKey, string>;
  options?: Partial<Record<LanguageKey, string[]>>;
};

/* =========================================================
   SPEECH RECOGNITION
========================================================= */

interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: (() => void) | null;
  onresult:
    | ((event: SpeechRecognitionResultEvent) => void)
    | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

/* =========================================================
   SPEECH LANGUAGES
========================================================= */

const speechLanguages: Record<LanguageKey, string> = {
  english: "en-IN",
  hindi: "hi-IN",
  marathi: "mr-IN",
  bengali: "bn-IN",
  gujarati: "gu-IN",
  tamil: "ta-IN",
  telugu: "te-IN",
  kannada: "kn-IN",
  malayalam: "ml-IN",
  punjabi: "pa-IN",
};

/* =========================================================
   UI TRANSLATIONS
========================================================= */

const ui: Record<
  LanguageKey,
  {
    assistant: string;
    subtitle: string;
    question: string;
    play: string;
    stop: string;
    tapSpeak: string;
    listening: string;
    answer: string;
    placeholder: string;
    quick: string;
    previous: string;
    next: string;
    finish: string;
    voiceError: string;
    micDenied: string;
    noSpeech: string;
    noAnswer: string;
    voiceMode: string;
    touchMode: string;
    disclaimer: string;
  }
> = {
  english: {
    assistant: "AI Health Assistant",
    subtitle:
      "Answer a few questions before meeting your doctor.",
    question: "Question",
    play: "Play question",
    stop: "Stop",
    tapSpeak: "Tap to Speak",
    listening: "Listening...",
    answer: "Your Answer",
    placeholder: "Type your answer here...",
    quick: "Quick answers",
    previous: "Previous",
    next: "Next",
    finish: "Finish Assessment",
    voiceError:
      "Voice recognition failed. You can type your answer instead.",
    micDenied:
      "Microphone permission was denied. Please allow microphone access.",
    noSpeech:
      "No speech detected. Please speak clearly and try again.",
    noAnswer: "Please provide an answer to continue.",
    voiceMode: "Voice Mode",
    touchMode: "Touch & Type",
    disclaimer:
      "Your responses help prepare a structured history for the doctor. The final medical assessment is made by a qualified healthcare professional.",
  },

  hindi: {
    assistant: "AI स्वास्थ्य सहायक",
    subtitle:
      "डॉक्टर से मिलने से पहले कुछ सवालों के जवाब दें।",
    question: "सवाल",
    play: "सवाल सुनें",
    stop: "बंद करें",
    tapSpeak: "बोलने के लिए दबाएं",
    listening: "सुन रहा है...",
    answer: "आपका जवाब",
    placeholder: "अपना जवाब यहाँ लिखें...",
    quick: "त्वरित उत्तर",
    previous: "पिछला",
    next: "आगे",
    finish: "मूल्यांकन पूरा करें",
    voiceError:
      "वॉइस पहचानने में समस्या हुई। आप अपना जवाब टाइप कर सकते हैं।",
    micDenied:
      "माइक्रोफ़ोन की अनुमति नहीं है। कृपया माइक्रोफ़ोन की अनुमति दें।",
    noSpeech:
      "आवाज़ नहीं मिली। कृपया स्पष्ट रूप से बोलकर फिर प्रयास करें।",
    noAnswer:
      "आगे बढ़ने के लिए कृपया अपना जवाब दें।",
    voiceMode: "वॉइस मोड",
    touchMode: "टच और टाइप",
    disclaimer:
      "आपके जवाब डॉक्टर के लिए एक व्यवस्थित मेडिकल हिस्ट्री तैयार करने में मदद करते हैं। अंतिम मेडिकल मूल्यांकन योग्य डॉक्टर द्वारा किया जाता है।",
  },

  marathi: {
    assistant: "AI आरोग्य सहाय्यक",
    subtitle:
      "डॉक्टरांना भेटण्यापूर्वी काही प्रश्नांची उत्तरे द्या.",
    question: "प्रश्न",
    play: "प्रश्न ऐका",
    stop: "थांबवा",
    tapSpeak: "बोलण्यासाठी दाबा",
    listening: "ऐकत आहे...",
    answer: "तुमचे उत्तर",
    placeholder: "तुमचे उत्तर येथे लिहा...",
    quick: "जलद उत्तरे",
    previous: "मागील",
    next: "पुढे",
    finish: "मूल्यांकन पूर्ण करा",
    voiceError:
      "व्हॉइस ओळखण्यात समस्या आली. तुम्ही उत्तर टाइप करू शकता.",
    micDenied:
      "मायक्रोफोनची परवानगी नाकारली आहे.",
    noSpeech:
      "आवाज आढळला नाही. कृपया स्पष्टपणे बोलून पुन्हा प्रयत्न करा.",
    noAnswer: "पुढे जाण्यासाठी कृपया उत्तर द्या.",
    voiceMode: "व्हॉइस मोड",
    touchMode: "टच आणि टाइप",
    disclaimer:
      "तुमची उत्तरे डॉक्टरांसाठी संरचित मेडिकल हिस्ट्री तयार करण्यात मदत करतात. अंतिम वैद्यकीय मूल्यांकन डॉक्टर करतात.",
  },

  bengali: {
    assistant: "AI স্বাস্থ্য সহায়ক",
    subtitle:
      "ডাক্তারের সঙ্গে দেখা করার আগে কয়েকটি প্রশ্নের উত্তর দিন।",
    question: "প্রশ্ন",
    play: "প্রশ্ন শুনুন",
    stop: "বন্ধ করুন",
    tapSpeak: "কথা বলতে চাপুন",
    listening: "শুনছি...",
    answer: "আপনার উত্তর",
    placeholder: "আপনার উত্তর এখানে লিখুন...",
    quick: "দ্রুত উত্তর",
    previous: "পূর্ববর্তী",
    next: "পরবর্তী",
    finish: "মূল্যায়ন শেষ করুন",
    voiceError:
      "ভয়েস শনাক্ত করতে সমস্যা হয়েছে। আপনি উত্তর টাইপ করতে পারেন।",
    micDenied:
      "মাইক্রোফোনের অনুমতি দেওয়া হয়নি।",
    noSpeech:
      "কোনো কথা শনাক্ত হয়নি। স্পষ্টভাবে কথা বলুন।",
    noAnswer: "এগিয়ে যেতে আপনার উত্তর দিন।",
    voiceMode: "ভয়েস মোড",
    touchMode: "টাচ ও টাইপ",
    disclaimer:
      "আপনার উত্তরগুলি ডাক্তারের জন্য একটি কাঠামোবদ্ধ স্বাস্থ্য ইতিহাস তৈরি করতে সাহায্য করে।",
  },

  gujarati: {
    assistant: "AI આરોગ્ય સહાયક",
    subtitle:
      "ડૉક્ટરને મળતા પહેલાં થોડા પ્રશ્નોના જવાબ આપો.",
    question: "પ્રશ્ન",
    play: "પ્રશ્ન સાંભળો",
    stop: "બંધ કરો",
    tapSpeak: "બોલવા માટે દબાવો",
    listening: "સાંભળી રહ્યું છે...",
    answer: "તમારો જવાબ",
    placeholder: "તમારો જવાબ અહીં લખો...",
    quick: "ઝડપી જવાબો",
    previous: "પાછળ",
    next: "આગળ",
    finish: "મૂલ્યાંકન પૂર્ણ કરો",
    voiceError:
      "વૉઇસ ઓળખવામાં સમસ્યા આવી. તમે જવાબ ટાઇપ કરી શકો છો.",
    micDenied:
      "માઇક્રોફોનની પરવાનગી આપવામાં આવી નથી.",
    noSpeech:
      "કોઈ અવાજ મળ્યો નથી. કૃપા કરીને સ્પષ્ટ રીતે બોલો.",
    noAnswer: "આગળ વધવા માટે જવાબ આપો.",
    voiceMode: "વૉઇસ મોડ",
    touchMode: "ટચ અને ટાઇપ",
    disclaimer:
      "તમારા જવાબો ડૉક્ટર માટે સંરચિત આરોગ્ય ઇતિહાસ તૈયાર કરવામાં મદદ કરે છે.",
  },

  tamil: {
    assistant: "AI சுகாதார உதவியாளர்",
    subtitle:
      "மருத்துவரை சந்திப்பதற்கு முன் சில கேள்விகளுக்கு பதிலளிக்கவும்.",
    question: "கேள்வி",
    play: "கேள்வியைக் கேளுங்கள்",
    stop: "நிறுத்து",
    tapSpeak: "பேச அழுத்தவும்",
    listening: "கேட்கிறது...",
    answer: "உங்கள் பதில்",
    placeholder: "உங்கள் பதிலை இங்கே உள்ளிடவும்...",
    quick: "விரைவு பதில்கள்",
    previous: "முந்தையது",
    next: "அடுத்து",
    finish: "மதிப்பீட்டை முடிக்கவும்",
    voiceError:
      "குரலை அடையாளம் காண முடியவில்லை. உங்கள் பதிலை தட்டச்சு செய்யலாம்.",
    micDenied:
      "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது.",
    noSpeech:
      "குரல் கண்டறியப்படவில்லை. தெளிவாக பேசவும்.",
    noAnswer:
      "தொடர உங்கள் பதிலை வழங்கவும்.",
    voiceMode: "குரல் பயன்முறை",
    touchMode: "தொடுதல் மற்றும் தட்டச்சு",
    disclaimer:
      "உங்கள் பதில்கள் மருத்துவருக்கான கட்டமைக்கப்பட்ட சுகாதார வரலாற்றைத் தயாரிக்க உதவுகின்றன.",
  },

  telugu: {
    assistant: "AI ఆరోగ్య సహాయకుడు",
    subtitle:
      "డాక్టర్‌ను కలిసే ముందు కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.",
    question: "ప్రశ్న",
    play: "ప్రశ్న వినండి",
    stop: "ఆపండి",
    tapSpeak: "మాట్లాడటానికి నొక్కండి",
    listening: "వింటోంది...",
    answer: "మీ సమాధానం",
    placeholder: "మీ సమాధానాన్ని ఇక్కడ టైప్ చేయండి...",
    quick: "త్వరిత సమాధానాలు",
    previous: "వెనుకకు",
    next: "తదుపరి",
    finish: "మూల్యాంకనం పూర్తి చేయండి",
    voiceError:
      "వాయిస్ గుర్తించడంలో సమస్య వచ్చింది. మీరు సమాధానాన్ని టైప్ చేయవచ్చు.",
    micDenied:
      "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది.",
    noSpeech:
      "వాయిస్ గుర్తించబడలేదు. స్పష్టంగా మాట్లాడండి.",
    noAnswer:
      "కొనసాగడానికి మీ సమాధానం ఇవ్వండి.",
    voiceMode: "వాయిస్ మోడ్",
    touchMode: "టచ్ & టైప్",
    disclaimer:
      "మీ సమాధానాలు డాక్టర్ కోసం నిర్మిత ఆరోగ్య చరిత్రను సిద్ధం చేయడంలో సహాయపడతాయి.",
  },

  kannada: {
    assistant: "AI ಆರೋಗ್ಯ ಸಹಾಯಕ",
    subtitle:
      "ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ಕೆಲವು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.",
    question: "ಪ್ರಶ್ನೆ",
    play: "ಪ್ರಶ್ನೆ ಕೇಳಿ",
    stop: "ನಿಲ್ಲಿಸಿ",
    tapSpeak: "ಮಾತನಾಡಲು ಒತ್ತಿರಿ",
    listening: "ಕೇಳುತ್ತಿದೆ...",
    answer: "ನಿಮ್ಮ ಉತ್ತರ",
    placeholder: "ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
    quick: "ತ್ವರಿತ ಉತ್ತರಗಳು",
    previous: "ಹಿಂದೆ",
    next: "ಮುಂದೆ",
    finish: "ಮೌಲ್ಯಮಾಪನ ಮುಗಿಸಿ",
    voiceError:
      "ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    micDenied:
      "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.",
    noSpeech:
      "ಯಾವುದೇ ಧ್ವನಿ ಪತ್ತೆಯಾಗಿಲ್ಲ.",
    noAnswer:
      "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಉತ್ತರ ನೀಡಿ.",
    voiceMode: "ಧ್ವನಿ ಮೋಡ್",
    touchMode: "ಟಚ್ & ಟೈಪ್",
    disclaimer:
      "ನಿಮ್ಮ ಉತ್ತರಗಳು ವೈದ್ಯರಿಗಾಗಿ ರಚನಾತ್ಮಕ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ.",
  },

  malayalam: {
    assistant: "AI ആരോഗ്യ സഹായി",
    subtitle:
      "ഡോക്ടറെ കാണുന്നതിന് മുമ്പ് കുറച്ച് ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക.",
    question: "ചോദ്യം",
    play: "ചോദ്യം കേൾക്കുക",
    stop: "നിർത്തുക",
    tapSpeak: "സംസാരിക്കാൻ അമർത്തുക",
    listening: "കേൾക്കുന്നു...",
    answer: "നിങ്ങളുടെ ഉത്തരം",
    placeholder: "നിങ്ങളുടെ ഉത്തരം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    quick: "വേഗത്തിലുള്ള ഉത്തരങ്ങൾ",
    previous: "പിന്നിലേക്ക്",
    next: "അടുത്തത്",
    finish: "വിലയിരുത്തൽ പൂർത്തിയാക്കുക",
    voiceError:
      "വോയ്സ് തിരിച്ചറിയുന്നതിൽ പ്രശ്നമുണ്ടായി.",
    micDenied:
      "മൈക്രോഫോൺ അനുമതി നിരസിച്ചു.",
    noSpeech:
      "ശബ്ദം കണ്ടെത്തിയില്ല. വ്യക്തമായി സംസാരിക്കുക.",
    noAnswer:
      "തുടരാൻ നിങ്ങളുടെ ഉത്തരം നൽകുക.",
    voiceMode: "വോയ്സ് മോഡ്",
    touchMode: "ടച്ച് & ടൈപ്പ്",
    disclaimer:
      "നിങ്ങളുടെ ഉത്തരങ്ങൾ ഡോക്ടർക്കായി ഘടനാപരമായ ആരോഗ്യ ചരിത്രം തയ്യാറാക്കാൻ സഹായിക്കുന്നു.",
  },

  punjabi: {
    assistant: "AI ਸਿਹਤ ਸਹਾਇਕ",
    subtitle:
      "ਡਾਕਟਰ ਨੂੰ ਮਿਲਣ ਤੋਂ ਪਹਿਲਾਂ ਕੁਝ ਸਵਾਲਾਂ ਦੇ ਜਵਾਬ ਦਿਓ।",
    question: "ਸਵਾਲ",
    play: "ਸਵਾਲ ਸੁਣੋ",
    stop: "ਰੋਕੋ",
    tapSpeak: "ਬੋਲਣ ਲਈ ਦਬਾਓ",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    answer: "ਤੁਹਾਡਾ ਜਵਾਬ",
    placeholder: "ਆਪਣਾ ਜਵਾਬ ਇੱਥੇ ਲਿਖੋ...",
    quick: "ਤੁਰੰਤ ਜਵਾਬ",
    previous: "ਪਿੱਛੇ",
    next: "ਅੱਗੇ",
    finish: "ਮੁਲਾਂਕਣ ਪੂਰਾ ਕਰੋ",
    voiceError:
      "ਵੌਇਸ ਪਛਾਣਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆਈ।",
    micDenied:
      "ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਦਿੱਤੀ ਗਈ।",
    noSpeech:
      "ਕੋਈ ਆਵਾਜ਼ ਨਹੀਂ ਮਿਲੀ।",
    noAnswer:
      "ਅੱਗੇ ਵਧਣ ਲਈ ਆਪਣਾ ਜਵਾਬ ਦਿਓ।",
    voiceMode: "ਵੌਇਸ ਮੋਡ",
    touchMode: "ਟੱਚ ਅਤੇ ਟਾਈਪ",
    disclaimer:
      "ਤੁਹਾਡੇ ਜਵਾਬ ਡਾਕਟਰ ਲਈ ਇੱਕ ਢਾਂਚਾਬੱਧ ਸਿਹਤ ਇਤਿਹਾਸ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਨ।",
  },
};

/* =========================================================
   QUESTIONS
========================================================= */

const questions: Question[] = [
  {
    id: "chief_complaint",
    category: "Main Concern",

    questions: {
      english:
        "What is the main health problem or concern you are experiencing today?",
      hindi:
        "आज आपको मुख्य रूप से किस स्वास्थ्य समस्या या परेशानी का सामना करना पड़ रहा है?",
      marathi:
        "आज तुम्हाला मुख्यतः कोणती आरोग्य समस्या किंवा त्रास जाणवत आहे?",
      bengali:
        "আজ আপনার প্রধান স্বাস্থ্য সমস্যা বা অসুবিধা কী?",
      gujarati:
        "આજે તમને મુખ્યત્વે કઈ આરોગ્ય સમસ્યા અથવા તકલીફ થઈ રહી છે?",
      tamil:
        "இன்று உங்களுக்கு முக்கியமாக என்ன உடல்நலப் பிரச்சனை அல்லது சிரமம் உள்ளது?",
      telugu:
        "ఈ రోజు మీకు ప్రధానంగా ఏ ఆరోగ్య సమస్య లేదా ఇబ్బంది ఉంది?",
      kannada:
        "ಇಂದು ನಿಮಗೆ ಮುಖ್ಯವಾಗಿ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ತೊಂದರೆ ಇದೆ?",
      malayalam:
        "ഇന്ന് നിങ്ങൾക്ക് പ്രധാനമായ ആരോഗ്യ പ്രശ്നമോ ബുദ്ധിമുട്ടോ എന്താണ്?",
      punjabi:
        "ਅੱਜ ਤੁਹਾਨੂੰ ਮੁੱਖ ਤੌਰ 'ਤੇ ਕਿਹੜੀ ਸਿਹਤ ਸਮੱਸਿਆ ਜਾਂ ਤਕਲੀਫ਼ ਹੈ?",
    },

    options: {
      english: [
        "Fever",
        "Cough",
        "Pain",
        "Breathing problem",
        "Stomach problem",
        "Other",
      ],
      hindi: [
        "बुखार",
        "खांसी",
        "दर्द",
        "सांस लेने में परेशानी",
        "पेट की समस्या",
        "अन्य",
      ],
      marathi: [
        "ताप",
        "खोकला",
        "वेदना",
        "श्वास घेण्यास त्रास",
        "पोटाची समस्या",
        "इतर",
      ],
      bengali: [
        "জ্বর",
        "কাশি",
        "ব্যথা",
        "শ্বাসকষ্ট",
        "পেটের সমস্যা",
        "অন্যান্য",
      ],
      gujarati: [
        "તાવ",
        "ઉધરસ",
        "દુખાવો",
        "શ્વાસ લેવામાં તકલીફ",
        "પેટની સમસ્યા",
        "અન્ય",
      ],
      tamil: [
        "காய்ச்சல்",
        "இருமல்",
        "வலி",
        "சுவாசிப்பதில் சிரமம்",
        "வயிற்றுப் பிரச்சனை",
        "மற்றவை",
      ],
      telugu: [
        "జ్వరం",
        "దగ్గు",
        "నొప్పి",
        "శ్వాస తీసుకోవడంలో ఇబ్బంది",
        "కడుపు సమస్య",
        "ఇతర",
      ],
      kannada: [
        "ಜ್ವರ",
        "ಕೆಮ್ಮು",
        "ನೋವು",
        "ಉಸಿರಾಟದ ತೊಂದರೆ",
        "ಹೊಟ್ಟೆಯ ಸಮಸ್ಯೆ",
        "ಇತರೆ",
      ],
      malayalam: [
        "പനി",
        "ചുമ",
        "വേദന",
        "ശ്വാസംമുട്ടൽ",
        "വയറിന്റെ പ്രശ്നം",
        "മറ്റുള്ളവ",
      ],
      punjabi: [
        "ਬੁਖਾਰ",
        "ਖੰਘ",
        "ਦਰਦ",
        "ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼",
        "ਪੇਟ ਦੀ ਸਮੱਸਿਆ",
        "ਹੋਰ",
      ],
    },
  },

  {
    id: "duration",
    category: "Duration",

    questions: {
      english:
        "How long have you been experiencing this problem?",
      hindi:
        "आपको यह समस्या कितने समय से हो रही है?",
      marathi:
        "तुम्हाला हा त्रास किती दिवसांपासून होत आहे?",
      bengali:
        "আপনার এই সমস্যা কতদিন ধরে হচ্ছে?",
      gujarati:
        "તમને આ સમસ્યા કેટલા સમયથી થઈ રહી છે?",
      tamil:
        "இந்த பிரச்சனை உங்களுக்கு எவ்வளவு காலமாக உள்ளது?",
      telugu:
        "ఈ సమస్య మీకు ఎంతకాలంగా ఉంది?",
      kannada:
        "ಈ ಸಮಸ್ಯೆ ನಿಮಗೆ ಎಷ್ಟು ಸಮಯದಿಂದ ಇದೆ?",
      malayalam:
        "ഈ പ്രശ്നം നിങ്ങൾക്ക് എത്ര നാളായി അനുഭവപ്പെടുന്നു?",
      punjabi:
        "ਤੁਹਾਨੂੰ ਇਹ ਸਮੱਸਿਆ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਹੈ?",
    },

    options: {
      english: [
        "Today",
        "2–3 days",
        "Less than a week",
        "1–4 weeks",
        "More than a month",
      ],
      hindi: [
        "आज से",
        "2–3 दिन",
        "एक सप्ताह से कम",
        "1–4 सप्ताह",
        "एक महीने से अधिक",
      ],
      marathi: [
        "आजपासून",
        "2–3 दिवस",
        "एका आठवड्यापेक्षा कमी",
        "1–4 आठवडे",
        "एका महिन्यापेक्षा जास्त",
      ],
      bengali: [
        "আজ থেকে",
        "২–৩ দিন",
        "এক সপ্তাহের কম",
        "১–৪ সপ্তাহ",
        "এক মাসের বেশি",
      ],
      gujarati: [
        "આજથી",
        "2–3 દિવસ",
        "એક અઠવાડિયા કરતાં ઓછું",
        "1–4 અઠવાડિયા",
        "એક મહિનાથી વધુ",
      ],
      tamil: [
        "இன்று முதல்",
        "2–3 நாட்கள்",
        "ஒரு வாரத்திற்கும் குறைவு",
        "1–4 வாரங்கள்",
        "ஒரு மாதத்திற்கும் மேல்",
      ],
      telugu: [
        "ఈ రోజు నుండి",
        "2–3 రోజులు",
        "ఒక వారం కంటే తక్కువ",
        "1–4 వారాలు",
        "ఒక నెలకు పైగా",
      ],
      kannada: [
        "ಇಂದಿನಿಂದ",
        "2–3 ದಿನಗಳು",
        "ಒಂದು ವಾರಕ್ಕಿಂತ ಕಡಿಮೆ",
        "1–4 ವಾರಗಳು",
        "ಒಂದು ತಿಂಗಳಿಗಿಂತ ಹೆಚ್ಚು",
      ],
      malayalam: [
        "ഇന്ന് മുതൽ",
        "2–3 ദിവസം",
        "ഒരു ആഴ്ചയിൽ താഴെ",
        "1–4 ആഴ്ച",
        "ഒരു മാസത്തിലധികം",
      ],
      punjabi: [
        "ਅੱਜ ਤੋਂ",
        "2–3 ਦਿਨ",
        "ਇੱਕ ਹਫ਼ਤੇ ਤੋਂ ਘੱਟ",
        "1–4 ਹਫ਼ਤੇ",
        "ਇੱਕ ਮਹੀਨੇ ਤੋਂ ਵੱਧ",
      ],
    },
  },

  {
    id: "severity",
    category: "Severity",

    questions: {
      english:
        "How severe is the problem right now?",
      hindi:
        "अभी आपकी समस्या कितनी गंभीर है?",
      marathi:
        "सध्या तुमचा त्रास किती तीव्र आहे?",
      bengali:
        "এই মুহূর্তে সমস্যাটি কতটা গুরুতর?",
      gujarati:
        "અત્યારે તમારી સમસ્યા કેટલી ગંભીર છે?",
      tamil:
        "தற்போது இந்த பிரச்சனை எவ்வளவு தீவிரமாக உள்ளது?",
      telugu:
        "ప్రస్తుతం ఈ సమస్య ఎంత తీవ్రంగా ఉంది?",
      kannada:
        "ಈಗ ನಿಮ್ಮ ಸಮಸ್ಯೆ ಎಷ್ಟು ತೀವ್ರವಾಗಿದೆ?",
      malayalam:
        "ഇപ്പോൾ ഈ പ്രശ്നം എത്രത്തോളം ഗുരുതരമാണ്?",
      punjabi:
        "ਇਸ ਸਮੇਂ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਕਿੰਨੀ ਗੰਭੀਰ ਹੈ?",
    },

    options: {
      english: [
        "Mild",
        "Moderate",
        "Severe",
        "Very severe",
      ],
      hindi: [
        "हल्की",
        "मध्यम",
        "गंभीर",
        "बहुत गंभीर",
      ],
      marathi: [
        "सौम्य",
        "मध्यम",
        "तीव्र",
        "अत्यंत तीव्र",
      ],
      bengali: [
        "হালকা",
        "মাঝারি",
        "গুরুতর",
        "অত্যন্ত গুরুতর",
      ],
      gujarati: [
        "હળવી",
        "મધ્યમ",
        "ગંભીર",
        "ખૂબ ગંભીર",
      ],
      tamil: [
        "லேசானது",
        "மிதமானது",
        "தீவிரமானது",
        "மிகவும் தீவிரமானது",
      ],
      telugu: [
        "తేలికపాటి",
        "మధ్యస్థ",
        "తీవ్రమైన",
        "చాలా తీవ్రమైన",
      ],
      kannada: [
        "ಸೌಮ್ಯ",
        "ಮಧ್ಯಮ",
        "ತೀವ್ರ",
        "ಬಹಳ ತೀವ್ರ",
      ],
      malayalam: [
        "ലഘുവായ",
        "മിതമായ",
        "ഗുരുതരമായ",
        "വളരെ ഗുരുതരമായ",
      ],
      punjabi: [
        "ਹਲਕੀ",
        "ਦਰਮਿਆਨੀ",
        "ਗੰਭੀਰ",
        "ਬਹੁਤ ਗੰਭੀਰ",
      ],
    },
  },

  {
    id: "symptoms",
    category: "Associated Symptoms",

    questions: {
      english:
        "Are you experiencing any other symptoms along with this problem?",
      hindi:
        "क्या इस समस्या के साथ आपको कोई और लक्षण भी हो रहे हैं?",
      marathi:
        "या त्रासासोबत तुम्हाला इतर कोणतीही लक्षणे जाणवत आहेत का?",
      bengali:
        "এই সমস্যার সঙ্গে আপনার কি অন্য কোনো উপসর্গও হচ্ছে?",
      gujarati:
        "આ સમસ્યા સાથે તમને અન્ય કોઈ લક્ષણો પણ થઈ રહ્યા છે?",
      tamil:
        "இந்த பிரச்சனையுடன் வேறு ஏதேனும் அறிகுறிகள் உள்ளதா?",
      telugu:
        "ఈ సమస్యతో పాటు మీకు ఇతర లక్షణాలు కూడా ఉన్నాయా?",
      kannada:
        "ಈ ಸಮಸ್ಯೆಯ ಜೊತೆಗೆ ನಿಮಗೆ ಬೇರೆ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿವೆಯೇ?",
      malayalam:
        "ഈ പ്രശ്നത്തോടൊപ്പം നിങ്ങൾക്ക് മറ്റ് ലക്ഷണങ്ങളും ഉണ്ടോ?",
      punjabi:
        "ਕੀ ਇਸ ਸਮੱਸਿਆ ਦੇ ਨਾਲ ਤੁਹਾਨੂੰ ਹੋਰ ਕੋਈ ਲੱਛਣ ਵੀ ਹਨ?",
    },
  },

  {
    id: "medical_history",
    category: "Medical History",

    questions: {
      english:
        "Do you have any existing medical conditions or previous illnesses?",
      hindi:
        "क्या आपको पहले से कोई बीमारी या स्वास्थ्य संबंधी समस्या है?",
      marathi:
        "तुम्हाला आधीपासून कोणताही आजार किंवा आरोग्याची समस्या आहे का?",
      bengali:
        "আপনার কি আগে থেকে কোনো রোগ বা স্বাস্থ্য সমস্যা আছে?",
      gujarati:
        "તમને પહેલેથી કોઈ બીમારી અથવા આરોગ્ય સમસ્યા છે?",
      tamil:
        "உங்களுக்கு ஏற்கனவே ஏதேனும் நோய் அல்லது உடல்நலப் பிரச்சனை உள்ளதா?",
      telugu:
        "మీకు ఇప్పటికే ఏవైనా అనారోగ్య సమస్యలు లేదా వ్యాధులు ఉన్నాయా?",
      kannada:
        "ನಿಮಗೆ ಈಗಾಗಲೇ ಯಾವುದೇ ಕಾಯಿಲೆ ಅಥವಾ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಇದೆಯೇ?",
      malayalam:
        "നിങ്ങൾക്ക് നേരത്തെ ഉണ്ടായിരുന്ന ഏതെങ്കിലും രോഗമോ ആരോഗ്യ പ്രശ്നമോ ഉണ്ടോ?",
      punjabi:
        "ਕੀ ਤੁਹਾਨੂੰ ਪਹਿਲਾਂ ਤੋਂ ਕੋਈ ਬਿਮਾਰੀ ਜਾਂ ਸਿਹਤ ਸਮੱਸਿਆ ਹੈ?",
    },
  },

  {
    id: "medications",
    category: "Medications",

    questions: {
      english:
        "Are you currently taking any medicines or regular treatments?",
      hindi:
        "क्या आप अभी कोई दवा या नियमित उपचार ले रहे हैं?",
      marathi:
        "तुम्ही सध्या कोणतीही औषधे किंवा नियमित उपचार घेत आहात का?",
      bengali:
        "আপনি কি বর্তমানে কোনো ওষুধ বা নিয়মিত চিকিৎসা নিচ্ছেন?",
      gujarati:
        "શું તમે હાલમાં કોઈ દવા અથવા નિયમિત સારવાર લઈ રહ્યા છો?",
      tamil:
        "நீங்கள் தற்போது ஏதேனும் மருந்துகள் அல்லது வழக்கமான சிகிச்சை எடுத்துக்கொள்கிறீர்களா?",
      telugu:
        "మీరు ప్రస్తుతం ఏవైనా మందులు లేదా క్రమమైన చికిత్స తీసుకుంటున్నారా?",
      kannada:
        "ನೀವು ಈಗ ಯಾವುದೇ ಔಷಧಿ ಅಥವಾ ನಿಯಮಿತ ಚಿಕಿತ್ಸೆಯನ್ನು ಪಡೆಯುತ್ತಿದ್ದೀರಾ?",
      malayalam:
        "നിങ്ങൾ ഇപ്പോൾ ഏതെങ്കിലും മരുന്നുകളോ സ്ഥിരമായ ചികിത്സയോ സ്വീകരിക്കുന്നുണ്ടോ?",
      punjabi:
        "ਕੀ ਤੁਸੀਂ ਇਸ ਸਮੇਂ ਕੋਈ ਦਵਾਈ ਜਾਂ ਨਿਯਮਿਤ ਇਲਾਜ ਲੈ ਰਹੇ ਹੋ?",
    },
  },

  {
    id: "allergies",
    category: "Allergies",

    questions: {
      english:
        "Do you have any known allergies to medicines, food, or anything else?",
      hindi:
        "क्या आपको किसी दवा, भोजन या किसी अन्य चीज़ से एलर्जी है?",
      marathi:
        "तुम्हाला कोणत्याही औषधाची, अन्नाची किंवा इतर कशाची ऍलर्जी आहे का?",
      bengali:
        "কোনো ওষুধ, খাবার বা অন্য কিছুর প্রতি আপনার কি অ্যালার্জি আছে?",
      gujarati:
        "શું તમને કોઈ દવા, ખોરાક અથવા અન્ય કોઈ વસ્તુથી એલર્જી છે?",
      tamil:
        "உங்களுக்கு ஏதேனும் மருந்து, உணவு அல்லது வேறு பொருளுக்கு ஒவ்வாமை உள்ளதா?",
      telugu:
        "మీకు ఏదైనా మందు, ఆహారం లేదా ఇతర వస్తువులకు అలర్జీ ఉందా?",
      kannada:
        "ನಿಮಗೆ ಯಾವುದೇ ಔಷಧಿ, ಆಹಾರ ಅಥವಾ ಬೇರೆ ಯಾವುದಕ್ಕೂ ಅಲರ್ಜಿ ಇದೆಯೇ?",
      malayalam:
        "ഏതെങ്കിലും മരുന്നിനോടോ ഭക്ഷണത്തോടോ മറ്റേതെങ്കിലും വസ്തുവിനോടോ നിങ്ങൾക്ക് അലർജി ഉണ്ടോ?",
      punjabi:
        "ਕੀ ਤੁਹਾਨੂੰ ਕਿਸੇ ਦਵਾਈ, ਖਾਣੇ ਜਾਂ ਕਿਸੇ ਹੋਰ ਚੀਜ਼ ਤੋਂ ਐਲਰਜੀ ਹੈ?",
    },
  },

  {
    id: "previous_treatment",
    category: "Previous Treatment",

    questions: {
      english:
        "Have you already consulted a doctor or taken any treatment for this problem?",
      hindi:
        "क्या आपने इस समस्या के लिए पहले किसी डॉक्टर से सलाह ली है या कोई उपचार लिया है?",
      marathi:
        "या समस्येसाठी तुम्ही आधी डॉक्टरांचा सल्ला घेतला आहे का किंवा उपचार घेतला आहे का?",
      bengali:
        "এই সমস্যার জন্য আপনি কি আগে কোনো ডাক্তারের পরামর্শ বা চিকিৎসা নিয়েছেন?",
      gujarati:
        "શું તમે આ સમસ્યા માટે અગાઉ કોઈ ડૉક્ટરની સલાહ અથવા સારવાર લીધી છે?",
      tamil:
        "இந்த பிரச்சனைக்காக நீங்கள் ஏற்கனவே மருத்துவரை சந்தித்துள்ளீர்களா அல்லது சிகிச்சை எடுத்துள்ளீர்களா?",
      telugu:
        "ఈ సమస్య కోసం మీరు ఇప్పటికే డాక్టర్‌ను సంప్రదించారా లేదా చికిత్స తీసుకున్నారా?",
      kannada:
        "ಈ ಸಮಸ್ಯೆಗಾಗಿ ನೀವು ಈಗಾಗಲೇ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿದ್ದೀರಾ ಅಥವಾ ಚಿಕಿತ್ಸೆ ಪಡೆದಿದ್ದೀರಾ?",
      malayalam:
        "ഈ പ്രശ്നത്തിനായി നിങ്ങൾ ഇതിനകം ഡോക്ടറെ കണ്ടിട്ടുണ്ടോ അല്ലെങ്കിൽ ചികിത്സ എടുത്തിട്ടുണ്ടോ?",
      punjabi:
        "ਕੀ ਤੁਸੀਂ ਇਸ ਸਮੱਸਿਆ ਲਈ ਪਹਿਲਾਂ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕੀਤੀ ਹੈ ਜਾਂ ਇਲਾਜ ਲਿਆ ਹੈ?",
    },
  },

  {
    id: "additional",
    category: "Additional Information",

    questions: {
      english:
        "Is there anything else about your health that you would like the doctor to know?",
      hindi:
        "क्या आपके स्वास्थ्य के बारे में कोई और जानकारी है जो आप डॉक्टर को बताना चाहते हैं?",
      marathi:
        "तुमच्या आरोग्याबद्दल डॉक्टरांना सांगू इच्छित असलेली आणखी काही माहिती आहे का?",
      bengali:
        "আপনার স্বাস্থ্য সম্পর্কে আর কোনো তথ্য আছে যা আপনি ডাক্তারকে জানাতে চান?",
      gujarati:
        "તમારા આરોગ્ય વિશે એવી કોઈ અન્ય માહિતી છે જે તમે ડૉક્ટરને જણાવવા માંગો છો?",
      tamil:
        "உங்கள் உடல்நலம் குறித்து மருத்துவர் தெரிந்துகொள்ள வேண்டிய வேறு ஏதேனும் தகவல் உள்ளதா?",
      telugu:
        "మీ ఆరోగ్యం గురించి డాక్టర్ తెలుసుకోవాల్సిన మరేదైనా సమాచారం ఉందా?",
      kannada:
        "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ವೈದ್ಯರು ತಿಳಿದುಕೊಳ್ಳಬೇಕಾದ ಇನ್ನೇನಾದರೂ ಮಾಹಿತಿ ಇದೆಯೇ?",
      malayalam:
        "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് ഡോക്ടർ അറിയേണ്ട മറ്റേതെങ്കിലും വിവരമുണ്ടോ?",
      punjabi:
        "ਕੀ ਤੁਹਾਡੀ ਸਿਹਤ ਬਾਰੇ ਕੋਈ ਹੋਰ ਜਾਣਕਾਰੀ ਹੈ ਜੋ ਤੁਸੀਂ ਡਾਕਟਰ ਨੂੰ ਦੱਸਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    },
  },
];

/* =========================================================
   PATIENT-SPECIFIC STORAGE
========================================================= */

function getPatientKey(mobile: string) {
  return mobile.replace(/\D/g, "");
}

function getCurrentPatient() {
  try {
    const raw = localStorage.getItem("medikiosk-current-patient");
    if (!raw) return null;

    const patient = JSON.parse(raw);
    const mobile = patient?.mobile
      ? getPatientKey(String(patient.mobile))
      : "";

    if (!mobile) return null;

    return {
      ...patient,
      mobile,
    };
  } catch {
    return null;
  }
}

function getInterviewKey(mobile: string) {
  return `medikiosk-interview-${getPatientKey(mobile)}`;
}

function getInterviewCompleteKey(mobile: string) {
  return `medikiosk-interview-complete-${getPatientKey(mobile)}`;
}

function getRedFlagKey(mobile: string) {
  return `medikiosk-red-flag-${getPatientKey(mobile)}`;
}

/* =========================================================
   RED FLAG DETECTION
   ========================================================= */

type RedFlagResult = {
  detected: boolean;
  reasons: string[];
};

function normalizeForRedFlag(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[.,!?;:()[\]{}'"`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectRedFlags(allAnswers: Record<string, string>): RedFlagResult {
  const values = Object.values(allAnswers)
    .filter(Boolean)
    .map((value) => normalizeForRedFlag(value));

  const combined = values.join(" | ");
  const reasons: string[] = [];

  const breathingRedFlag =
    /(severe|very severe|can't breathe|cannot breathe|difficulty breathing|breathing difficulty|shortness of breath|breathlessness|choking|not able to breathe|सांस लेने में (बहुत )?परेशानी|सांस नहीं आ रही|सांस लेने में दिक्कत|श्वास घेण्यास (खूप )?त्रास|श्वास घेता येत नाही|श्वास घेण्यास अडचण|શ્વાસ લેવામાં (ખૂબ )?તકલીફ|શ્વાસ લેવામાં મુશ્કેલી|மூச்சுத்திணறல்|சுவாசிக்க முடியவில்லை|శ్వాస తీసుకోవడంలో ఇబ్బంది|ಉಸಿರಾಟದ ತೊಂದರೆ|ശ്വാസംമുട്ടൽ)/i.test(combined);

  if (breathingRedFlag) {
    reasons.push("Severe breathing difficulty");
  }

  const chestPain =
    /(chest pain|chest pressure|chest tightness|pain in chest|heart pain|सीने में दर्द|सीने में बहुत दर्द|सीने में दबाव|सीने में जकड़न|छातीत दुखणे|छातीत तीव्र वेदना|छातीत दडपण|છાતીમાં દુખાવો|છાતીમાં દબાણ|மார்பு வலி|மார்பில் அழுத்தம்|ఛాతి నొప్పి|ఎదె నొప్పి|ಎದೆ ನೋವು|നെഞ്ചുവേദന)/i.test(combined);

  const severe =
    /(severe|very severe|extreme|unbearable|बहुत गंभीर|गंभीर|बहुत तेज|असहनीय|तीव्र|अत्यंत तीव्र|ખૂબ ગંભીર|તીવ્ર|மிகவும் தீவிரமானது|தீவிரமான|చాలా తీవ్రమైన|తీవ్రమైన|ಬಹಳ ತೀವ್ರ|ತೀವ್ರ|വളരെ ഗുരുതരമായ|ഗുരുതരമായ)/i.test(combined);

  if (chestPain && severe) {
    reasons.push("Severe chest pain or pressure");
  }

  const strokeRedFlag =
    /(face droop|facial droop|one side weakness|one sided weakness|one side numb|sudden weakness|sudden numbness|slurred speech|speech difficulty|cannot speak|unable to speak|paralysis|stroke|चेहरा टेढ़ा|एक तरफ कमजोरी|एक तरफ सुन्न|अचानक कमजोरी|बोलने में दिक्कत|बोल नहीं पा रहा|लकवा|स्ट्रोक|चेहरा वाकडा|एका बाजूला कमजोरी|बोलता येत नाही|चेहरा वाकणे|એક બાજુ નબળાઈ|બોલવામાં તકલીફ|முகம் சாய்வு|ஒரு பக்க பலவீனம்|பேச முடியவில்லை|பக்கவாதம்|ముఖం వంగడం|ఒక వైపు బలహీనత|మాట్లాడలేకపోవడం|స్ట్రోక్|ಮುಖದ ಒಂದು ಬದಿ ಬಾಗುವುದು|ಒಂದು ಬದಿಯ ದುರ್ಬಲತೆ|ಮಾತನಾಡಲು ಆಗುತ್ತಿಲ್ಲ|ಪಾರ್ಶ್ವವಾಯು|മുഖം കോടുക|ഒരു വശത്തെ ബലഹീനത|സംസാരിക്കാൻ കഴിയുന്നില്ല)/i.test(combined);

  if (strokeRedFlag) {
    reasons.push("Possible stroke warning signs");
  }

  const otherEmergency =
    /(unconscious|passed out|fainted|fainting|seizure|convulsion|heavy bleeding|bleeding heavily|vomiting blood|blood in vomit|severe allergic reaction|swelling of tongue|swelling of throat|not responding|बेहोश|बेहोशी|दौरा|खून बहुत बह रहा|खून की उल्टी|गंभीर एलर्जी|गला सूज|जीभ सूज|बेशुद्ध|झटके|रक्तस्राव|रक्ताची उलटी|तीव्र ऍलर्जी|બેભાન|દૌરો|વધુ રક્તસ્ત્રાવ|લોહીની ઉલટી|ગંભીર એલર્જી|மயக்கம்|வலிப்பு|அதிக இரத்தப்போக்கு|இரத்த வாந்தி|கடுமையான ஒவ்வாமை|స్పృహ తప్పడం|మూర్ఛ|మూర్ఛలు|తీవ్రమైన రక్తస్రావం|రక్తం వాంతి|తీవ్రమైన అలర్జీ|ಪ್ರಜ್ಞಾಹೀನ|ಮೂರ್ಛೆ|ರಕ್ತಸ್ರಾವ|ರಕ್ತ ವಾಂತಿ|ತೀವ್ರ ಅಲರ್ಜಿ|ബോധക്ഷയം|അബോധാവസ്ഥ|വലിവ്|വളരെ രക്തസ്രാവം|രക്തം ഛർദ്ദിക്കുക|ഗുരുതര അലർജി)/i.test(combined);

  if (otherEmergency) {
    reasons.push("Potential emergency symptom");
  }

  return {
    detected: reasons.length > 0,
    reasons,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function PatientIntakePage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [inputMode, setInputMode] =
    useState<InputMode>("touch");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answer, setAnswer] = useState("");

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [error, setError] = useState("");

  const [redFlag, setRedFlag] = useState<RedFlagResult>({
    detected: false,
    reasons: [],
  });

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const current = questions[currentQuestion];

  const text = ui[language];

  const questionText =
    current.questions[language];

  const options =
    current.options?.[language] || [];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  /* =======================================================
     LOAD SAVED SETTINGS
  ======================================================= */

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "medikiosk-language"
      ) as LanguageKey | null;

    const savedMode =
      localStorage.getItem(
        "medikiosk-input-mode"
      ) as InputMode | null;

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (
      savedMode === "voice" ||
      savedMode === "touch"
    ) {
      setInputMode(savedMode);
    }

    /*
      IMPORTANT:
      Interview answers are now isolated per patient.
      The old shared "medikiosk-interview" key is intentionally
      NOT loaded, so another patient's answers cannot appear here.
    */
    const patient = getCurrentPatient();

    if (!patient) {
      router.replace("/patient/login");
      return;
    }

    const patientInterview =
      localStorage.getItem(
        getInterviewKey(patient.mobile)
      );

    if (patientInterview) {
      try {
        const savedAnswers = JSON.parse(patientInterview);
        setAnswers(savedAnswers);

        const savedRedFlag = detectRedFlags(savedAnswers);
        if (savedRedFlag.detected) {
          setRedFlag(savedRedFlag);
          localStorage.setItem(
            getRedFlagKey(patient.mobile),
            JSON.stringify({
              ...savedRedFlag,
              patientId:
                patient.id || `P-${getPatientKey(patient.mobile)}`,
              patientMobile: getPatientKey(patient.mobile),
              detectedAt: new Date().toISOString(),
            })
          );
        }
      } catch {
        setAnswers({});
        setRedFlag({ detected: false, reasons: [] });
      }
    } else {
      // Brand-new patient / fresh interview.
      setAnswers({});
      setRedFlag({ detected: false, reasons: [] });
      setCurrentQuestion(0);
      setAnswer("");
    }
  }, [router]);

  /* =======================================================
     LOAD CURRENT ANSWER
  ======================================================= */

  useEffect(() => {
    setAnswer(
      answers[current.id] || ""
    );

    setError("");
  }, [currentQuestion, current.id, answers]);

  /* =======================================================
     TEXT TO SPEECH
  ======================================================= */

  function speakQuestion() {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      setError(
        "Text-to-speech is not available in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        questionText
      );

    utterance.lang =
      speechLanguages[language];

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(
      utterance
    );
  }

  function stopSpeaking() {
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  }

  /* =======================================================
     SPEECH TO TEXT
  ======================================================= */

  function startListening() {
    setError("");

    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported here. Please use Microsoft Edge or Google Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      /*
        IMPORTANT:
        Language automatically changes according
        to patient's selected language.
      */

      recognition.lang =
        speechLanguages[language];

      recognition.continuous = false;

      recognition.interimResults = true;

      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log(
          "🎤 Speech recognition started"
        );

        setIsListening(true);
        setError("");
      };

      recognition.onresult = (
        event
      ) => {
        console.log(
          "🎤 Speech result received",
          event
        );

        let finalTranscript = "";
        let interimTranscript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const transcript =
            event.results[i][0]
              .transcript;

          if (
            event.results[i].isFinal
          ) {
            finalTranscript +=
              transcript;
          } else {
            interimTranscript +=
              transcript;
          }
        }

        const combined =
          (
            finalTranscript ||
            interimTranscript
          ).trim();

        console.log(
          "📝 Recognized:",
          combined
        );

        if (combined) {
          setAnswer(combined);
          setError("");
        }
      };

      recognition.onerror = (
        event
      ) => {
        console.error(
          "🎤 Speech error:",
          event.error
        );

        setIsListening(false);

        if (
          event.error ===
          "not-allowed"
        ) {
          setError(text.micDenied);
        } else if (
          event.error ===
          "no-speech"
        ) {
          setError(text.noSpeech);
        } else if (
          event.error ===
          "audio-capture"
        ) {
          setError(
            "Microphone could not be detected. Please check your microphone."
          );
        } else {
          setError(text.voiceError);
        }
      };

      recognition.onend = () => {
        console.log(
          "🎤 Speech recognition ended"
        );

        setIsListening(false);
      };

      recognitionRef.current =
        recognition;

      /*
        This triggers the browser microphone
        permission dialog if needed.
      */

      recognition.start();

    } catch (err) {
      console.error(
        "Could not start recognition:",
        err
      );

      setIsListening(false);

      setError(text.voiceError);
    }
  }

  /* =======================================================
     SAVE ANSWER
  ======================================================= */

  function saveAnswer() {
    const trimmed =
      answer.trim();

    if (!trimmed) {
      setError(text.noAnswer);
      return false;
    }

    const updatedAnswers = {
      ...answers,
      [current.id]: trimmed,
    };

    setAnswers(updatedAnswers);

    const patient = getCurrentPatient();

    if (!patient) {
      router.replace("/patient/login");
      return false;
    }

    localStorage.setItem(
      getInterviewKey(patient.mobile),
      JSON.stringify(updatedAnswers)
    );

    // Run red-flag detection on the complete history collected so far.
    const detectedRedFlag = detectRedFlags(updatedAnswers);

    if (detectedRedFlag.detected) {
      const redFlagRecord = {
        ...detectedRedFlag,
        patientId:
          patient.id || `P-${getPatientKey(patient.mobile)}`,
        patientMobile: getPatientKey(patient.mobile),
        detectedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        getRedFlagKey(patient.mobile),
        JSON.stringify(redFlagRecord)
      );

      setRedFlag(detectedRedFlag);
    } else {
      localStorage.removeItem(getRedFlagKey(patient.mobile));
      setRedFlag({ detected: false, reasons: [] });
    }

    // Remove legacy shared data so it can never be reused.
    localStorage.removeItem("medikiosk-interview");

    return true;
  }

  /* =======================================================
     NEXT
  ======================================================= */

  function handleNext() {
    if (!saveAnswer()) {
      return;
    }

    stopSpeaking();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    /*
      RED FLAG -> IMMEDIATE SOS PATHWAY

      saveAnswer() has already evaluated the complete history collected
      so far and stored the patient-specific red-flag record.
      Read that record here and immediately move the patient to the
      emergency SOS screen instead of continuing the normal assessment.
    */
    const patient = getCurrentPatient();

    if (!patient) {
      router.replace("/patient/login");
      return;
    }

    try {
      const redFlagRaw = localStorage.getItem(
        getRedFlagKey(patient.mobile)
      );

      if (redFlagRaw) {
        const redFlagRecord = JSON.parse(redFlagRaw);

        if (
          redFlagRecord?.detected === true &&
          Array.isArray(redFlagRecord?.reasons) &&
          redFlagRecord.reasons.length > 0
        ) {
          localStorage.setItem(
            getInterviewCompleteKey(patient.mobile),
            "emergency"
          );

          /*
            Stop normal intake immediately.
            Emergency page handles:
            - SOS declaration
            - 108 ambulance call
            - 112 emergency call
            - GPS permission
            - ambulance request
            - nearby emergency hospitals
          */
          router.push("/patient/emergency");
          return;
        }
      }
    } catch {
      // Continue normal flow if the local emergency record is invalid.
    }

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      localStorage.setItem(
        getInterviewCompleteKey(patient.mobile),
        "true"
      );

      router.push(
        "/patient/documents"
      );

      return;
    }

    setCurrentQuestion(
      (prev) => prev + 1
    );
  }

  /* =======================================================
     PREVIOUS
  ======================================================= */

  function handlePrevious() {
    stopSpeaking();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    if (currentQuestion > 0) {
      setCurrentQuestion(
        (prev) => prev - 1
      );
    }
  }

  /* =======================================================
     OPTION
  ======================================================= */

  function selectOption(
    option: string
  ) {
    setAnswer(option);
    setError("");
  }

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (
        typeof window !== "undefined" &&
        window.speechSynthesis
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">

      {/* =================================================
          HEADER
      ================================================= */}

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
          href="/patient/consent"
          className="flex items-center gap-2 text-sm font-medium text-[#5C6B67] hover:text-[#10201D] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">
            Back
          </span>
        </Link>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <section className="flex-1 flex justify-center px-4 sm:px-6 py-5 sm:py-8">

        <div className="w-full max-w-4xl">

          {/* =================================================
              AI HEADER
          ================================================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#E6F2EF] flex items-center justify-center">

                <Sparkles
                  className="w-5 h-5 text-[#1B7A6B]"
                />

              </div>

              <div>

                <h1 className="font-semibold text-[#10201D] text-lg">
                  {text.assistant}
                </h1>

                <p className="text-xs sm:text-sm text-[#6B7874]">
                  {text.subtitle}
                </p>

              </div>

            </div>


            {/* MODE */}

            <div className="flex items-center gap-2">

              {inputMode ===
              "voice" ? (
                <>
                  <Mic className="w-4 h-4 text-[#1B7A6B]" />

                  <span className="text-sm font-medium text-[#1B7A6B]">
                    {text.voiceMode}
                  </span>
                </>
              ) : (
                <>
                  <Keyboard className="w-4 h-4 text-[#1B7A6B]" />

                  <span className="text-sm font-medium text-[#1B7A6B]">
                    {text.touchMode}
                  </span>
                </>
              )}

            </div>

          </div>


          {/* =================================================
              PROGRESS
          ================================================= */}

          <div className="mb-5">

            <div className="flex justify-between mb-2">

              <span className="text-sm font-medium text-[#5C6B67]">
                {text.question}{" "}
                {currentQuestion + 1} /{" "}
                {questions.length}
              </span>

              <span className="text-sm text-[#7B8783]">
                {Math.round(progress)}%
              </span>

            </div>

            <div className="h-2 bg-[#DDE5E2] rounded-full overflow-hidden">

              <div
                className="h-full bg-[#1B7A6B] rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>


          {/* =================================================
              QUESTION CARD
          ================================================= */}

          <div className="bg-white border border-[#E1E5E3] rounded-2xl overflow-hidden">

            {/* CATEGORY */}

            <div className="px-5 sm:px-7 pt-5 sm:pt-7">

              <span className="inline-flex px-3 py-1.5 rounded-full bg-[#EAF6F3] text-[#1B7A6B] text-xs sm:text-sm font-medium">
                {current.category}
              </span>

            </div>


            {/* QUESTION */}

            <div className="px-5 sm:px-7 pt-5">

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#10201D] leading-snug">
                {questionText}
              </h2>

            </div>


            {/* =================================================
                VOICE CONTROLS
            ================================================= */}

            {inputMode ===
              "voice" && (
              <div className="px-5 sm:px-7 pt-6">

                <div className="rounded-xl bg-[#F4F9F7] border border-[#DCEBE6] p-4">

                  <div className="flex flex-col sm:flex-row gap-3">

                    {/* SPEAKER */}

                    <button
                      type="button"
                      onClick={
                        isSpeaking
                          ? stopSpeaking
                          : speakQuestion
                      }
                      className="sm:w-44 flex items-center justify-center gap-2 rounded-lg bg-white border border-[#DDE7E3] px-4 py-3 text-sm font-medium text-[#1B7A6B] hover:border-[#1B7A6B] cursor-pointer"
                    >

                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-5 h-5" />
                          {text.stop}
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5" />
                          {text.play}
                        </>
                      )}

                    </button>


                    {/* MICROPHONE */}

                    <button
                      type="button"
                      onClick={
                        startListening
                      }
                      className={`flex-1 flex items-center justify-center gap-3 rounded-lg py-3.5 font-semibold transition-all cursor-pointer ${
                        isListening
                          ? "bg-[#10201D] text-white"
                          : "bg-[#1B7A6B] text-white hover:bg-[#166358]"
                      }`}
                    >

                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5" />

                          {text.listening}
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />

                          {text.tapSpeak}
                        </>
                      )}

                    </button>

                  </div>


                  {/* LISTENING INDICATOR */}

                  {isListening && (
                    <div className="flex justify-center items-center gap-2 mt-4 text-sm text-[#1B7A6B]">

                      <span className="w-2 h-2 rounded-full bg-[#1B7A6B] animate-pulse" />

                      {text.listening}

                    </div>
                  )}

                </div>

              </div>
            )}


            {/* =================================================
                QUICK OPTIONS
            ================================================= */}

            {options.length >
              0 && (
              <div className="px-5 sm:px-7 pt-6">

                <div className="flex items-center gap-2 mb-3">

                  <MessageCircle className="w-4 h-4 text-[#7B8783]" />

                  <span className="text-sm font-medium text-[#5C6B67]">
                    {text.quick}
                  </span>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">

                  {options.map(
                    (option) => {
                      const selected =
                        answer === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            selectOption(
                              option
                            )
                          }
                          className={`rounded-lg border px-3 py-3 text-sm font-medium text-left transition-all cursor-pointer ${
                            selected
                              ? "border-[#1B7A6B] bg-[#EAF6F3] text-[#1B7A6B]"
                              : "border-[#E1E5E3] bg-white text-[#34423E] hover:border-[#9FCAC1]"
                          }`}
                        >

                          <div className="flex items-center justify-between gap-2">

                            <span>
                              {option}
                            </span>

                            {selected && (
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1B7A6B]" />
                            )}

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )}


            {/* =================================================
                ANSWER BOX
            ================================================= */}

            <div className="px-5 sm:px-7 pt-6">

              <label className="block text-sm font-medium text-[#10201D] mb-2">
                {text.answer}
              </label>

              <textarea
                value={answer}
                onChange={(e) => {
                  setAnswer(
                    e.target.value
                  );
                  setError("");
                }}
                rows={4}
                placeholder={
                  text.placeholder
                }
                className="w-full resize-none rounded-xl border border-[#E1E5E3] px-4 py-3.5 text-base text-[#10201D] placeholder:text-[#9AA39F] focus:outline-none focus:ring-2 focus:ring-[#1B7A6B] focus:border-transparent"
              />

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="px-5 sm:px-7 pt-3">

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>

              </div>
            )}


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="px-5 sm:px-7 py-6">

              <div className="flex flex-col-reverse sm:flex-row gap-3">

                {/* PREVIOUS */}

                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  disabled={
                    currentQuestion ===
                    0
                  }
                  className={`sm:w-auto px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                    currentQuestion ===
                    0
                      ? "bg-[#EEF1F0] text-[#A0AAA7] cursor-not-allowed"
                      : "bg-white border border-[#DDE4E1] text-[#53615D] hover:border-[#A7B8B2] cursor-pointer"
                  }`}
                >

                  <ChevronLeft className="w-4 h-4" />

                  {text.previous}

                </button>


                {/* NEXT */}

                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  className="flex-1 bg-[#1B7A6B] text-white rounded-lg py-3.5 text-sm sm:text-base font-semibold hover:bg-[#166358] flex items-center justify-center gap-2 cursor-pointer"
                >

                  {currentQuestion ===
                  questions.length - 1
                    ? text.finish
                    : text.next}

                  <ChevronRight className="w-5 h-5" />

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              DISCLAIMER
          ================================================= */}

          <div className="mt-5 flex items-start justify-center gap-2 px-4">

            <CheckCircle2 className="w-4 h-4 text-[#1B7A6B] shrink-0 mt-0.5" />

            <p className="text-xs sm:text-sm text-[#7B8783] text-center leading-relaxed">
              {text.disclaimer}
            </p>

          </div>

        </div>

      </section>

      {/* Red flags are routed directly to /patient/emergency. */}

    </main>
  );
}