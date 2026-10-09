"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Pill,
  Clock3,
  Stethoscope,
  ShieldCheck,
  Edit3,
  X,
  Save,
} from "lucide-react";

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

type SummaryData = {
  complaint: string;
  duration: string;
  severity: string;
  symptoms: string;
  medicalHistory: string;
  medications: string;
  allergies: string;
  previousTreatment: string;
  additional: string;
};

const languageNames: Record<
  LanguageKey,
  string
> = {
  english: "English",
  hindi: "Hindi",
  marathi: "Marathi",
  bengali: "Bengali",
  gujarati: "Gujarati",
  tamil: "Tamil",
  telugu: "Telugu",
  kannada: "Kannada",
  malayalam: "Malayalam",
  punjabi: "Punjabi",
};

const translations: Record<
  LanguageKey,
  {
    title: string;
    subtitle: string;
    generated: string;
    overview: string;
    mainConcern: string;
    duration: string;
    severity: string;
    symptoms: string;
    medicalHistory: string;
    medications: string;
    allergies: string;
    previousTreatment: string;
    additional: string;
    documents: string;
    documentsText: string;
    redFlags: string;
    redFlagText: string;
    noRedFlags: string;
    confidence: string;
    confidenceText: string;
    edit: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    secure: string;
    disclaimer: string;
    noData: string;
  }
> = {
  english: {
    title: "AI Clinical Summary",
    subtitle:
      "Your responses have been organized into a structured summary for the doctor.",
    generated: "AI Generated Summary",
    overview: "Patient Overview",
    mainConcern: "Main Concern",
    duration: "Duration",
    severity: "Severity",
    symptoms: "Associated Symptoms",
    medicalHistory: "Medical History",
    medications: "Current Medications",
    allergies: "Allergies",
    previousTreatment: "Previous Treatment",
    additional: "Additional Information",
    documents: "Medical Documents",
    documentsText:
      "Documents uploaded during this session are available for review.",
    redFlags: "Red-Flag Screening",
    redFlagText:
      "No immediate red flags were identified from the information provided.",
    noRedFlags: "No immediate red flags detected",
    confidence: "Summary Confidence",
    confidenceText:
      "The summary is based on the information provided by the patient and should be verified by a healthcare professional.",
    edit: "Edit Summary",
    save: "Save Changes",
    cancel: "Cancel",
    continue: "Continue to Care Navigation",
    back: "Back",
    secure: "AI-assisted • Doctor verification required",
    disclaimer:
      "This summary is an AI-assisted representation of the information provided by the patient. It is not a diagnosis and does not replace professional medical judgment.",
    noData: "Not provided",
  },

  hindi: {
    title: "AI क्लिनिकल सारांश",
    subtitle:
      "आपके जवाबों को डॉक्टर के लिए एक व्यवस्थित सारांश में तैयार किया गया है।",
    generated: "AI द्वारा तैयार सारांश",
    overview: "मरीज़ का विवरण",
    mainConcern: "मुख्य समस्या",
    duration: "समस्या की अवधि",
    severity: "गंभीरता",
    symptoms: "अन्य लक्षण",
    medicalHistory: "मेडिकल हिस्ट्री",
    medications: "वर्तमान दवाएं",
    allergies: "एलर्जी",
    previousTreatment: "पिछला उपचार",
    additional: "अतिरिक्त जानकारी",
    documents: "मेडिकल दस्तावेज़",
    documentsText:
      "इस सत्र के दौरान अपलोड किए गए दस्तावेज़ डॉक्टर द्वारा देखे जा सकते हैं।",
    redFlags: "रेड-फ्लैग स्क्रीनिंग",
    redFlagText:
      "दी गई जानकारी के आधार पर कोई तत्काल रेड फ्लैग नहीं मिला।",
    noRedFlags: "कोई तत्काल रेड फ्लैग नहीं मिला",
    confidence: "सारांश का भरोसा स्तर",
    confidenceText:
      "यह सारांश मरीज़ द्वारा दी गई जानकारी पर आधारित है और डॉक्टर द्वारा सत्यापित किया जाना चाहिए।",
    edit: "सारांश संपादित करें",
    save: "बदलाव सेव करें",
    cancel: "रद्द करें",
    continue: "केयर नेविगेशन पर जाएं",
    back: "वापस",
    secure: "AI सहायता • डॉक्टर द्वारा सत्यापन आवश्यक",
    disclaimer:
      "यह सारांश मरीज़ द्वारा दी गई जानकारी का AI-सहायित रूप है। यह कोई निदान नहीं है और डॉक्टर की सलाह का विकल्प नहीं है।",
    noData: "जानकारी नहीं दी गई",
  },

  marathi: {
    title: "AI क्लिनिकल सारांश",
    subtitle:
      "तुमची उत्तरे डॉक्टरांसाठी संरचित सारांशात तयार केली आहेत.",
    generated: "AI द्वारे तयार केलेला सारांश",
    overview: "रुग्णाचा आढावा",
    mainConcern: "मुख्य समस्या",
    duration: "कालावधी",
    severity: "तीव्रता",
    symptoms: "इतर लक्षणे",
    medicalHistory: "वैद्यकीय इतिहास",
    medications: "सध्याची औषधे",
    allergies: "ऍलर्जी",
    previousTreatment: "मागील उपचार",
    additional: "अतिरिक्त माहिती",
    documents: "वैद्यकीय कागदपत्रे",
    documentsText:
      "या सत्रात अपलोड केलेली कागदपत्रे डॉक्टर पाहू शकतात.",
    redFlags: "रेड-फ्लॅग तपासणी",
    redFlagText:
      "दिलेल्या माहितीनुसार कोणताही तातडीचा रेड फ्लॅग आढळला नाही.",
    noRedFlags: "तातडीचा रेड फ्लॅग आढळला नाही",
    confidence: "सारांशाचा विश्वास स्तर",
    confidenceText:
      "हा सारांश रुग्णाने दिलेल्या माहितीवर आधारित आहे आणि डॉक्टरांनी तपासणे आवश्यक आहे.",
    edit: "सारांश संपादित करा",
    save: "बदल सेव्ह करा",
    cancel: "रद्द करा",
    continue: "केअर नेव्हिगेशनकडे जा",
    back: "मागे",
    secure: "AI सहाय्य • डॉक्टरांचे सत्यापन आवश्यक",
    disclaimer:
      "हा सारांश रुग्णाने दिलेल्या माहितीचे AI-सहाय्यित रूप आहे. हा निदान नाही.",
    noData: "माहिती दिली नाही",
  },

  bengali: {
    title: "AI ক্লিনিক্যাল সারাংশ",
    subtitle:
      "আপনার উত্তরগুলো ডাক্তারের জন্য একটি কাঠামোবদ্ধ সারাংশে সাজানো হয়েছে।",
    generated: "AI দ্বারা তৈরি সারাংশ",
    overview: "রোগীর সারাংশ",
    mainConcern: "প্রধান সমস্যা",
    duration: "সময়কাল",
    severity: "তীব্রতা",
    symptoms: "অন্যান্য উপসর্গ",
    medicalHistory: "চিকিৎসার ইতিহাস",
    medications: "বর্তমান ওষুধ",
    allergies: "অ্যালার্জি",
    previousTreatment: "আগের চিকিৎসা",
    additional: "অতিরিক্ত তথ্য",
    documents: "চিকিৎসার নথি",
    documentsText:
      "এই সেশনে আপলোড করা নথিগুলো ডাক্তার দেখতে পারবেন।",
    redFlags: "রেড-ফ্ল্যাগ স্ক্রিনিং",
    redFlagText:
      "প্রদত্ত তথ্যের ভিত্তিতে কোনো তাৎক্ষণিক রেড ফ্ল্যাগ পাওয়া যায়নি।",
    noRedFlags: "কোনো তাৎক্ষণিক রেড ফ্ল্যাগ নেই",
    confidence: "সারাংশের নির্ভরযোগ্যতা",
    confidenceText:
      "সারাংশটি রোগীর দেওয়া তথ্যের উপর ভিত্তি করে এবং একজন স্বাস্থ্যকর্মীর যাচাই করা উচিত।",
    edit: "সারাংশ সম্পাদনা করুন",
    save: "পরিবর্তন সংরক্ষণ করুন",
    cancel: "বাতিল",
    continue: "কেয়ার নেভিগেশনে যান",
    back: "পিছনে",
    secure: "AI সহায়তা • ডাক্তার যাচাই প্রয়োজন",
    disclaimer:
      "এই সারাংশ রোগীর দেওয়া তথ্যের AI-সহায়িত উপস্থাপনা। এটি কোনো রোগ নির্ণয় নয়।",
    noData: "তথ্য দেওয়া হয়নি",
  },

  gujarati: {
    title: "AI ક્લિનિકલ સારાંશ",
    subtitle:
      "તમારા જવાબોને ડૉક્ટર માટે સંરચિત સારાંશમાં ગોઠવવામાં આવ્યા છે.",
    generated: "AI દ્વારા તૈયાર કરાયેલ સારાંશ",
    overview: "દર્દીનો સારાંશ",
    mainConcern: "મુખ્ય સમસ્યા",
    duration: "સમયગાળો",
    severity: "તીવ્રતા",
    symptoms: "સંબંધિત લક્ષણો",
    medicalHistory: "મેડિકલ હિસ્ટ્રી",
    medications: "હાલની દવાઓ",
    allergies: "એલર્જી",
    previousTreatment: "અગાઉની સારવાર",
    additional: "વધારાની માહિતી",
    documents: "મેડિકલ દસ્તાવેજો",
    documentsText:
      "આ સત્ર દરમિયાન અપલોડ કરેલા દસ્તાવેજો ડૉક્ટર જોઈ શકે છે.",
    redFlags: "રેડ-ફ્લેગ સ્ક્રીનિંગ",
    redFlagText:
      "આપવામાં આવેલી માહિતીના આધારે કોઈ તાત્કાલિક રેડ ફ્લેગ મળ્યો નથી.",
    noRedFlags: "કોઈ તાત્કાલિક રેડ ફ્લેગ મળ્યો નથી",
    confidence: "સારાંશનો વિશ્વાસ સ્તર",
    confidenceText:
      "સારાંશ દર્દી દ્વારા આપવામાં આવેલી માહિતી પર આધારિત છે અને ડૉક્ટર દ્વારા ચકાસવો જોઈએ.",
    edit: "સારાંશ સંપાદિત કરો",
    save: "ફેરફારો સાચવો",
    cancel: "રદ કરો",
    continue: "કેર નેવિગેશન પર જાઓ",
    back: "પાછા",
    secure: "AI સહાય • ડૉક્ટરનું ચકાસણું જરૂરી",
    disclaimer:
      "આ સારાંશ દર્દી દ્વારા આપવામાં આવેલી માહિતીનું AI-સહાયિત પ્રતિનિધિત્વ છે. આ નિદાન નથી.",
    noData: "માહિતી આપવામાં આવી નથી",
  },

  tamil: {
    title: "AI மருத்துவ சுருக்கம்",
    subtitle:
      "உங்கள் பதில்கள் மருத்துவருக்கான கட்டமைக்கப்பட்ட சுருக்கமாகத் தயாரிக்கப்பட்டுள்ளன.",
    generated: "AI உருவாக்கிய சுருக்கம்",
    overview: "நோயாளி சுருக்கம்",
    mainConcern: "முக்கிய பிரச்சனை",
    duration: "கால அளவு",
    severity: "தீவிரம்",
    symptoms: "தொடர்புடைய அறிகுறிகள்",
    medicalHistory: "மருத்துவ வரலாறு",
    medications: "தற்போதைய மருந்துகள்",
    allergies: "ஒவ்வாமைகள்",
    previousTreatment: "முந்தைய சிகிச்சை",
    additional: "கூடுதல் தகவல்",
    documents: "மருத்துவ ஆவணங்கள்",
    documentsText:
      "இந்த அமர்வில் பதிவேற்றப்பட்ட ஆவணங்களை மருத்துவர் பார்க்கலாம்.",
    redFlags: "ரெட்-ஃபிளாக் பரிசோதனை",
    redFlagText:
      "வழங்கப்பட்ட தகவலின் அடிப்படையில் உடனடி ரெட் ஃபிளாக்கள் எதுவும் கண்டறியப்படவில்லை.",
    noRedFlags: "உடனடி ரெட் ஃபிளாக்கள் இல்லை",
    confidence: "சுருக்க நம்பகத்தன்மை",
    confidenceText:
      "இந்த சுருக்கம் நோயாளி வழங்கிய தகவலின் அடிப்படையில் உள்ளது மற்றும் மருத்துவரால் சரிபார்க்கப்பட வேண்டும்.",
    edit: "சுருக்கத்தைத் திருத்தவும்",
    save: "மாற்றங்களைச் சேமிக்கவும்",
    cancel: "ரத்து",
    continue: "கேர் நேவிகேஷனுக்கு செல்லவும்",
    back: "பின்செல்",
    secure: "AI உதவி • மருத்துவர் சரிபார்ப்பு தேவை",
    disclaimer:
      "இந்த சுருக்கம் நோயாளி வழங்கிய தகவலின் AI-உதவிய பிரதிநிதித்துவம். இது நோயறிதல் அல்ல.",
    noData: "தகவல் வழங்கப்படவில்லை",
  },

  telugu: {
    title: "AI క్లినికల్ సారాంశం",
    subtitle:
      "మీ సమాధానాలను డాక్టర్ కోసం నిర్మిత సారాంశంగా రూపొందించాము.",
    generated: "AI రూపొందించిన సారాంశం",
    overview: "రోగి సారాంశం",
    mainConcern: "ప్రధాన సమస్య",
    duration: "వ్యవధి",
    severity: "తీవ్రత",
    symptoms: "ఇతర లక్షణాలు",
    medicalHistory: "వైద్య చరిత్ర",
    medications: "ప్రస్తుత మందులు",
    allergies: "అలర్జీలు",
    previousTreatment: "మునుపటి చికిత్స",
    additional: "అదనపు సమాచారం",
    documents: "వైద్య పత్రాలు",
    documentsText:
      "ఈ సెషన్‌లో అప్‌లోడ్ చేసిన పత్రాలను డాక్టర్ సమీక్షించవచ్చు.",
    redFlags: "రెడ్-ఫ్లాగ్ స్క్రీనింగ్",
    redFlagText:
      "అందించిన సమాచారం ఆధారంగా తక్షణ రెడ్ ఫ్లాగ్‌లు గుర్తించబడలేదు.",
    noRedFlags: "తక్షణ రెడ్ ఫ్లాగ్‌లు గుర్తించబడలేదు",
    confidence: "సారాంశ విశ్వసనీయత",
    confidenceText:
      "ఈ సారాంశం రోగి అందించిన సమాచారంపై ఆధారపడి ఉంటుంది మరియు డాక్టర్ ధృవీకరించాలి.",
    edit: "సారాంశాన్ని సవరించండి",
    save: "మార్పులను సేవ్ చేయండి",
    cancel: "రద్దు",
    continue: "కేర్ నావిగేషన్‌కు వెళ్లండి",
    back: "వెనుకకు",
    secure: "AI సహాయం • డాక్టర్ ధృవీకరణ అవసరం",
    disclaimer:
      "ఈ సారాంశం రోగి అందించిన సమాచారానికి AI-సహాయక రూపం. ఇది రోగ నిర్ధారణ కాదు.",
    noData: "సమాచారం ఇవ్వలేదు",
  },

  kannada: {
    title: "AI ಕ್ಲಿನಿಕಲ್ ಸಾರಾಂಶ",
    subtitle:
      "ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ವೈದ್ಯರಿಗಾಗಿ ರಚನಾತ್ಮಕ ಸಾರಾಂಶವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",
    generated: "AI ರಚಿಸಿದ ಸಾರಾಂಶ",
    overview: "ರೋಗಿಯ ಸಾರಾಂಶ",
    mainConcern: "ಮುಖ್ಯ ಸಮಸ್ಯೆ",
    duration: "ಅವಧಿ",
    severity: "ತೀವ್ರತೆ",
    symptoms: "ಸಂಬಂಧಿತ ಲಕ್ಷಣಗಳು",
    medicalHistory: "ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    medications: "ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು",
    allergies: "ಅಲರ್ಜಿ",
    previousTreatment: "ಹಿಂದಿನ ಚಿಕಿತ್ಸೆ",
    additional: "ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿ",
    documents: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    documentsText:
      "ಈ ಸೆಷನ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳನ್ನು ವೈದ್ಯರು ಪರಿಶೀಲಿಸಬಹುದು.",
    redFlags: "ರೆಡ್-ಫ್ಲ್ಯಾಗ್ ಪರಿಶೀಲನೆ",
    redFlagText:
      "ನೀಡಲಾದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ತಕ್ಷಣದ ರೆಡ್ ಫ್ಲ್ಯಾಗ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    noRedFlags: "ತಕ್ಷಣದ ರೆಡ್ ಫ್ಲ್ಯಾಗ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    confidence: "ಸಾರಾಂಶದ ವಿಶ್ವಾಸಾರ್ಹತೆ",
    confidenceText:
      "ಈ ಸಾರಾಂಶವು ರೋಗಿಯು ನೀಡಿದ ಮಾಹಿತಿಯನ್ನು ಆಧರಿಸಿದೆ ಮತ್ತು ವೈದ್ಯರಿಂದ ಪರಿಶೀಲಿಸಬೇಕು.",
    edit: "ಸಾರಾಂಶ ಸಂಪಾದಿಸಿ",
    save: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    cancel: "ರದ್ದು",
    continue: "ಕೇರ್ ನ್ಯಾವಿಗೇಶನ್‌ಗೆ ಹೋಗಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    secure: "AI ಸಹಾಯ • ವೈದ್ಯರ ಪರಿಶೀಲನೆ ಅಗತ್ಯ",
    disclaimer:
      "ಈ ಸಾರಾಂಶವು ರೋಗಿಯು ನೀಡಿದ ಮಾಹಿತಿಯ AI-ಸಹಾಯಿತ ರೂಪವಾಗಿದೆ. ಇದು ರೋಗನಿರ್ಣಯವಲ್ಲ.",
    noData: "ಮಾಹಿತಿ ನೀಡಲಾಗಿಲ್ಲ",
  },

  malayalam: {
    title: "AI ക്ലിനിക്കൽ സംഗ്രഹം",
    subtitle:
      "നിങ്ങളുടെ ഉത്തരങ്ങൾ ഡോക്ടർക്കായി ഘടനാപരമായ സംഗ്രഹമായി തയ്യാറാക്കിയിട്ടുണ്ട്.",
    generated: "AI തയ്യാറാക്കിയ സംഗ്രഹം",
    overview: "രോഗിയുടെ സംഗ്രഹം",
    mainConcern: "പ്രധാന പ്രശ്നം",
    duration: "കാലയളവ്",
    severity: "തീവ്രത",
    symptoms: "അനുബന്ധ ലക്ഷണങ്ങൾ",
    medicalHistory: "മെഡിക്കൽ ചരിത്രം",
    medications: "നിലവിലെ മരുന്നുകൾ",
    allergies: "അലർജികൾ",
    previousTreatment: "മുൻ ചികിത്സ",
    additional: "കൂടുതൽ വിവരങ്ങൾ",
    documents: "മെഡിക്കൽ രേഖകൾ",
    documentsText:
      "ഈ സെഷനിൽ അപ്‌ലോഡ് ചെയ്ത രേഖകൾ ഡോക്ടർക്ക് പരിശോധിക്കാം.",
    redFlags: "റെഡ്-ഫ്ലാഗ് പരിശോധന",
    redFlagText:
      "നൽകിയ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ അടിയന്തര റെഡ് ഫ്ലാഗുകൾ കണ്ടെത്തിയില്ല.",
    noRedFlags: "അടിയന്തര റെഡ് ഫ്ലാഗുകൾ കണ്ടെത്തിയില്ല",
    confidence: "സംഗ്രഹ വിശ്വാസ്യത",
    confidenceText:
      "ഈ സംഗ്രഹം രോഗി നൽകിയ വിവരത്തെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്, ഡോക്ടർ പരിശോധിക്കണം.",
    edit: "സംഗ്രഹം തിരുത്തുക",
    save: "മാറ്റങ്ങൾ സംരക്ഷിക്കുക",
    cancel: "റദ്ദാക്കുക",
    continue: "കെയർ നാവിഗേഷനിലേക്ക് പോകുക",
    back: "തിരികെ",
    secure: "AI സഹായം • ഡോക്ടർ പരിശോധന ആവശ്യമാണ്",
    disclaimer:
      "ഈ സംഗ്രഹം രോഗി നൽകിയ വിവരത്തിന്റെ AI സഹായിത രൂപമാണ്. ഇത് രോഗനിർണയം അല്ല.",
    noData: "വിവരം നൽകിയിട്ടില്ല",
  },

  punjabi: {
    title: "AI ਕਲੀਨਿਕਲ ਸਾਰ",
    subtitle:
      "ਤੁਹਾਡੇ ਜਵਾਬਾਂ ਨੂੰ ਡਾਕਟਰ ਲਈ ਇੱਕ ਢਾਂਚਾਬੱਧ ਸਾਰ ਵਿੱਚ ਤਿਆਰ ਕੀਤਾ ਗਿਆ ਹੈ।",
    generated: "AI ਦੁਆਰਾ ਤਿਆਰ ਸਾਰ",
    overview: "ਮਰੀਜ਼ ਦਾ ਸਾਰ",
    mainConcern: "ਮੁੱਖ ਸਮੱਸਿਆ",
    duration: "ਮਿਆਦ",
    severity: "ਗੰਭੀਰਤਾ",
    symptoms: "ਹੋਰ ਲੱਛਣ",
    medicalHistory: "ਮੈਡੀਕਲ ਹਿਸਟਰੀ",
    medications: "ਮੌਜੂਦਾ ਦਵਾਈਆਂ",
    allergies: "ਐਲਰਜੀ",
    previousTreatment: "ਪਿਛਲਾ ਇਲਾਜ",
    additional: "ਵਾਧੂ ਜਾਣਕਾਰੀ",
    documents: "ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼",
    documentsText:
      "ਇਸ ਸੈਸ਼ਨ ਦੌਰਾਨ ਅਪਲੋਡ ਕੀਤੇ ਦਸਤਾਵੇਜ਼ ਡਾਕਟਰ ਦੇਖ ਸਕਦੇ ਹਨ।",
    redFlags: "ਰੈੱਡ-ਫਲੈਗ ਸਕ੍ਰੀਨਿੰਗ",
    redFlagText:
      "ਦਿੱਤੀ ਗਈ ਜਾਣਕਾਰੀ ਦੇ ਆਧਾਰ 'ਤੇ ਕੋਈ ਤੁਰੰਤ ਰੈੱਡ ਫਲੈਗ ਨਹੀਂ ਮਿਲਿਆ।",
    noRedFlags: "ਕੋਈ ਤੁਰੰਤ ਰੈੱਡ ਫਲੈਗ ਨਹੀਂ ਮਿਲਿਆ",
    confidence: "ਸਾਰ ਦਾ ਭਰੋਸਾ ਪੱਧਰ",
    confidenceText:
      "ਇਹ ਸਾਰ ਮਰੀਜ਼ ਵੱਲੋਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ 'ਤੇ ਆਧਾਰਿਤ ਹੈ ਅਤੇ ਡਾਕਟਰ ਵੱਲੋਂ ਜਾਂਚਿਆ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ।",
    edit: "ਸਾਰ ਸੋਧੋ",
    save: "ਬਦਲਾਅ ਸੇਵ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    continue: "ਕੇਅਰ ਨੇਵੀਗੇਸ਼ਨ ਵੱਲ ਜਾਓ",
    back: "ਵਾਪਸ",
    secure: "AI ਸਹਾਇਤਾ • ਡਾਕਟਰ ਦੀ ਜਾਂਚ ਲਾਜ਼ਮੀ",
    disclaimer:
      "ਇਹ ਸਾਰ ਮਰੀਜ਼ ਵੱਲੋਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਦੀ AI-ਸਹਾਇਤ ਪ੍ਰਸਤੁਤੀ ਹੈ। ਇਹ ਕੋਈ ਨਿਦਾਨ ਨਹੀਂ ਹੈ।",
    noData: "ਜਾਣਕਾਰੀ ਨਹੀਂ ਦਿੱਤੀ",
  },
};

export default function PatientSummaryPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [documentsCount, setDocumentsCount] =
    useState(0);

  const [isEditing, setIsEditing] =
    useState(false);

  const [draft, setDraft] =
    useState<SummaryData>({
      complaint: "",
      duration: "",
      severity: "",
      symptoms: "",
      medicalHistory: "",
      medications: "",
      allergies: "",
      previousTreatment: "",
      additional: "",
    });

  const [summary, setSummary] =
    useState<SummaryData>({
      complaint: "",
      duration: "",
      severity: "",
      symptoms: "",
      medicalHistory: "",
      medications: "",
      allergies: "",
      previousTreatment: "",
      additional: "",
    });

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

    const savedAnswers =
      localStorage.getItem(
        "medikiosk-interview"
      );

    const savedDocuments =
      localStorage.getItem(
        "medikiosk-documents"
      );

    if (savedDocuments) {
      try {
        const docs = JSON.parse(
          savedDocuments
        );

        if (Array.isArray(docs)) {
          setDocumentsCount(
            docs.length
          );
        }
      } catch {
        setDocumentsCount(0);
      }
    }

    if (savedAnswers) {
      try {
        const answers =
          JSON.parse(savedAnswers);

        const generatedSummary: SummaryData = {
          complaint:
            answers.chief_complaint ||
            "",
          duration:
            answers.duration ||
            "",
          severity:
            answers.severity ||
            "",
          symptoms:
            answers.symptoms ||
            "",
          medicalHistory:
            answers.medical_history ||
            "",
          medications:
            answers.medications ||
            "",
          allergies:
            answers.allergies ||
            "",
          previousTreatment:
            answers.previous_treatment ||
            "",
          additional:
            answers.additional ||
            "",
        };

        setSummary(
          generatedSummary
        );

        setDraft(
          generatedSummary
        );
      } catch {
        // Keep empty state
      }
    }
  }, []);

  const t = translations[language];

  function display(
    value: string
  ) {
    return value.trim()
      ? value
      : t.noData;
  }

  function startEditing() {
    setDraft({
      ...summary,
    });

    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft({
      ...summary,
    });

    setIsEditing(false);
  }

  function saveChanges() {
    setSummary({
      ...draft,
    });

    const updatedAnswers = {
      chief_complaint:
        draft.complaint,
      duration:
        draft.duration,
      severity:
        draft.severity,
      symptoms:
        draft.symptoms,
      medical_history:
        draft.medicalHistory,
      medications:
        draft.medications,
      allergies:
        draft.allergies,
      previous_treatment:
        draft.previousTreatment,
      additional:
        draft.additional,
    };

    localStorage.setItem(
      "medikiosk-interview",
      JSON.stringify(
        updatedAnswers
      )
    );

    setIsEditing(false);
  }

  function handleContinue() {
    localStorage.setItem(
      "medikiosk-summary",
      JSON.stringify(summary)
    );

    router.push(
      "/patient/care-navigation"
    );
  }

  function SummaryField({
    icon: Icon,
    label,
    value,
    field,
  }: {
    icon: any;
    label: string;
    value: string;
    field: keyof SummaryData;
  }) {
    return (
      <div className="rounded-xl border border-[#E2E8E5] p-4 sm:p-5">

        <div className="flex items-center gap-2 mb-3">

          <div className="w-8 h-8 rounded-lg bg-[#EAF6F3] flex items-center justify-center">

            <Icon className="w-4 h-4 text-[#1B7A6B]" />

          </div>

          <span className="text-sm font-semibold text-[#53615D]">
            {label}
          </span>

        </div>

        {isEditing ? (
          <textarea
            value={draft[field]}
            onChange={(e) =>
              setDraft({
                ...draft,
                [field]:
                  e.target.value,
              })
            }
            rows={3}
            className="w-full rounded-lg border border-[#DDE5E2] p-3 text-sm text-[#10201D] focus:outline-none focus:ring-2 focus:ring-[#1B7A6B]"
          />
        ) : (
          <p className="text-sm sm:text-base text-[#10201D] leading-relaxed">
            {display(value)}
          </p>
        )}

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">

      {/* HEADER */}

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
          href="/patient/documents"
          className="flex items-center gap-2 text-sm font-medium text-[#5C6B67] hover:text-[#10201D] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">
            {t.back}
          </span>
        </Link>

      </header>


      {/* MAIN */}

      <section className="flex-1 px-4 sm:px-6 pb-10">

        <div className="w-full max-w-5xl mx-auto">

          {/* TITLE */}

          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <Sparkles
                className="w-7 h-7 text-[#1B7A6B]"
              />

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10201D]">
              {t.title}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#66736F] max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>

          </div>


          {/* AI BADGE */}

          <div className="flex justify-center mb-5">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF6F3] text-[#1B7A6B] text-sm font-medium">

              <Sparkles className="w-4 h-4" />

              {t.generated}

            </div>

          </div>


          {/* OVERVIEW CARD */}

          <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

              <div>

                <h2 className="text-xl font-semibold text-[#10201D]">
                  {t.overview}
                </h2>

                <p className="text-sm text-[#75817D] mt-1">
                  Language:{" "}
                  {languageNames[language]}
                </p>

              </div>


              {!isEditing ? (
                <button
                  type="button"
                  onClick={
                    startEditing
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#DDE5E2] text-[#53615D] hover:border-[#1B7A6B] hover:text-[#1B7A6B] cursor-pointer"
                >

                  <Edit3 className="w-4 h-4" />

                  {t.edit}

                </button>
              ) : (
                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      cancelEditing
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DDE5E2] text-[#53615D] cursor-pointer"
                  >

                    <X className="w-4 h-4" />

                    {t.cancel}

                  </button>

                  <button
                    type="button"
                    onClick={
                      saveChanges
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B7A6B] text-white cursor-pointer"
                  >

                    <Save className="w-4 h-4" />

                    {t.save}

                  </button>

                </div>
              )}

            </div>


            {/* SUMMARY GRID */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <SummaryField
                icon={Stethoscope}
                label={
                  t.mainConcern
                }
                value={
                  summary.complaint
                }
                field="complaint"
              />

              <SummaryField
                icon={Clock3}
                label={
                  t.duration
                }
                value={
                  summary.duration
                }
                field="duration"
              />

              <SummaryField
                icon={Activity}
                label={
                  t.severity
                }
                value={
                  summary.severity
                }
                field="severity"
              />

              <SummaryField
                icon={Activity}
                label={
                  t.symptoms
                }
                value={
                  summary.symptoms
                }
                field="symptoms"
              />

              <SummaryField
                icon={FileText}
                label={
                  t.medicalHistory
                }
                value={
                  summary.medicalHistory
                }
                field="medicalHistory"
              />

              <SummaryField
                icon={Pill}
                label={
                  t.medications
                }
                value={
                  summary.medications
                }
                field="medications"
              />

              <SummaryField
                icon={ShieldCheck}
                label={
                  t.allergies
                }
                value={
                  summary.allergies
                }
                field="allergies"
              />

              <SummaryField
                icon={FileText}
                label={
                  t.previousTreatment
                }
                value={
                  summary.previousTreatment
                }
                field="previousTreatment"
              />

              <div className="md:col-span-2">

                <SummaryField
                  icon={FileText}
                  label={
                    t.additional
                  }
                  value={
                    summary.additional
                  }
                  field="additional"
                />

              </div>

            </div>

          </div>


          {/* RED FLAGS */}

          <div className="mt-5 bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-[#EAF6F3] flex items-center justify-center shrink-0">

                <CheckCircle2
                  className="w-6 h-6 text-[#1B7A6B]"
                />

              </div>

              <div className="flex-1">

                <h2 className="font-semibold text-lg text-[#10201D]">
                  {t.redFlags}
                </h2>

                <p className="mt-1 text-sm text-[#75817D]">
                  {t.redFlagText}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#EAF6F3] px-3 py-2 text-sm font-medium text-[#1B7A6B]">

                  <CheckCircle2 className="w-4 h-4" />

                  {t.noRedFlags}

                </div>

              </div>

            </div>

          </div>


          {/* DOCUMENTS */}

          <div className="mt-5 bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-xl bg-[#EAF6F3] flex items-center justify-center">

                <FileText
                  className="w-6 h-6 text-[#1B7A6B]"
                />

              </div>

              <div className="flex-1">

                <h2 className="font-semibold text-lg text-[#10201D]">
                  {t.documents}
                </h2>

                <p className="text-sm text-[#75817D] mt-1">
                  {documentsCount}{" "}
                  {documentsCount === 1
                    ? "document"
                    : "documents"}{" "}
                  • {t.documentsText}
                </p>

              </div>

            </div>

          </div>


          {/* CONFIDENCE */}

          <div className="mt-5 bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7">

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-2">

                <Sparkles className="w-5 h-5 text-[#1B7A6B]" />

                <h2 className="font-semibold text-[#10201D]">
                  {t.confidence}
                </h2>

              </div>

              <span className="font-bold text-[#1B7A6B]">
                92%
              </span>

            </div>

            <div className="h-2 bg-[#E2E9E6] rounded-full overflow-hidden">

              <div
                className="h-full bg-[#1B7A6B] rounded-full"
                style={{
                  width: "92%",
                }}
              />

            </div>

            <p className="mt-3 text-xs sm:text-sm text-[#75817D] leading-relaxed">
              {t.confidenceText}
            </p>

          </div>


          {/* DISCLAIMER */}

          <div className="mt-5 rounded-xl border border-[#DDE7E3] bg-[#F3F8F6] p-4 sm:p-5">

            <div className="flex items-start gap-3">

              <AlertTriangle className="w-5 h-5 text-[#7C8A85] shrink-0 mt-0.5" />

              <p className="text-xs sm:text-sm text-[#66736F] leading-relaxed">
                {t.disclaimer}
              </p>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/patient/documents"
                )
              }
              className="sm:w-auto px-6 py-3.5 rounded-xl border border-[#DDE4E1] bg-white text-[#53615D] font-medium hover:border-[#AABCB6] flex items-center justify-center gap-2 cursor-pointer"
            >

              <ArrowLeft className="w-4 h-4" />

              {t.back}

            </button>


            <button
              type="button"
              onClick={
                handleContinue
              }
              className="flex-1 rounded-xl bg-[#1B7A6B] text-white py-3.5 px-6 font-semibold hover:bg-[#166358] flex items-center justify-center gap-2 cursor-pointer"
            >

              {t.continue}

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

    </main>
  );
}