"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  FileCheck2,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Loader2,
  ClipboardList,
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

type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  source: "upload" | "scan";
};

type Translation = {
  title: string;
  subtitle: string;
  uploadTitle: string;
  uploadText: string;
  uploadButton: string;
  scanButton: string;
  supported: string;
  recordsTitle: string;
  recordsSubtitle: string;
  prescription: string;
  lab: string;
  reports: string;
  other: string;
  uploaded: string;
  remove: string;
  processing: string;
  processed: string;
  skip: string;
  continue: string;
  back: string;
  secure: string;
  historyTitle: string;
  historyPlaceholder: string;
  historyHelp: string;
};

const translations: Record<
  LanguageKey,
  Translation
> = {
  english: {
    title: "Documents & Medical History",
    subtitle:
      "Upload previous medical records so MediKiosk can prepare a more complete summary for your doctor.",
    uploadTitle: "Add Medical Documents",
    uploadText:
      "Upload prescriptions, lab reports, scans or previous medical records.",
    uploadButton: "Upload Document",
    scanButton: "Scan Document",
    supported:
      "PDF, JPG, JPEG, PNG • Maximum 10 MB",
    recordsTitle: "Document Categories",
    recordsSubtitle:
      "Choose the type of document you want to add.",
    prescription: "Prescription",
    lab: "Lab Report",
    reports: "Medical Report",
    other: "Other Record",
    uploaded: "Uploaded Documents",
    remove: "Remove",
    processing: "Processing document...",
    processed: "Ready for AI summary",
    skip: "Skip for now",
    continue: "Continue to AI Summary",
    back: "Back",
    secure: "Your documents are handled securely",
    historyTitle: "Previous Medical History",
    historyPlaceholder:
      "Type anything important about your previous medical history...",
    historyHelp:
      "You can mention previous surgeries, long-term conditions, hospital visits or other relevant information.",
  },

  hindi: {
    title: "दस्तावेज़ और मेडिकल हिस्ट्री",
    subtitle:
      "पिछले मेडिकल रिकॉर्ड अपलोड करें ताकि MediKiosk डॉक्टर के लिए अधिक पूरा सारांश तैयार कर सके।",
    uploadTitle: "मेडिकल दस्तावेज़ जोड़ें",
    uploadText:
      "प्रिस्क्रिप्शन, लैब रिपोर्ट, स्कैन या पुराने मेडिकल रिकॉर्ड अपलोड करें।",
    uploadButton: "दस्तावेज़ अपलोड करें",
    scanButton: "दस्तावेज़ स्कैन करें",
    supported:
      "PDF, JPG, JPEG, PNG • अधिकतम 10 MB",
    recordsTitle: "दस्तावेज़ की श्रेणी",
    recordsSubtitle:
      "जिस प्रकार का दस्तावेज़ जोड़ना है उसे चुनें।",
    prescription: "प्रिस्क्रिप्शन",
    lab: "लैब रिपोर्ट",
    reports: "मेडिकल रिपोर्ट",
    other: "अन्य रिकॉर्ड",
    uploaded: "अपलोड किए गए दस्तावेज़",
    remove: "हटाएं",
    processing: "दस्तावेज़ प्रोसेस हो रहा है...",
    processed: "AI सारांश के लिए तैयार",
    skip: "अभी छोड़ें",
    continue: "AI सारांश पर जाएं",
    back: "वापस",
    secure: "आपके दस्तावेज़ सुरक्षित रखे जाते हैं",
    historyTitle: "पिछली मेडिकल हिस्ट्री",
    historyPlaceholder:
      "अपनी पिछली मेडिकल हिस्ट्री के बारे में महत्वपूर्ण जानकारी लिखें...",
    historyHelp:
      "आप पिछली सर्जरी, पुरानी बीमारी, अस्पताल जाने या अन्य महत्वपूर्ण जानकारी बता सकते हैं।",
  },

  marathi: {
    title: "कागदपत्रे आणि वैद्यकीय इतिहास",
    subtitle:
      "मागील वैद्यकीय नोंदी अपलोड करा जेणेकरून MediKiosk डॉक्टरांसाठी अधिक पूर्ण सारांश तयार करू शकेल.",
    uploadTitle: "वैद्यकीय कागदपत्रे जोडा",
    uploadText:
      "प्रिस्क्रिप्शन, लॅब रिपोर्ट किंवा मागील वैद्यकीय नोंदी अपलोड करा.",
    uploadButton: "कागदपत्र अपलोड करा",
    scanButton: "कागदपत्र स्कॅन करा",
    supported:
      "PDF, JPG, JPEG, PNG • कमाल 10 MB",
    recordsTitle: "कागदपत्रांच्या श्रेणी",
    recordsSubtitle:
      "तुम्हाला जोडायच्या कागदपत्राचा प्रकार निवडा.",
    prescription: "प्रिस्क्रिप्शन",
    lab: "लॅब रिपोर्ट",
    reports: "वैद्यकीय रिपोर्ट",
    other: "इतर नोंद",
    uploaded: "अपलोड केलेली कागदपत्रे",
    remove: "काढा",
    processing: "कागदपत्र प्रक्रिया होत आहे...",
    processed: "AI सारांशासाठी तयार",
    skip: "आत्ता वगळा",
    continue: "AI सारांशाकडे जा",
    back: "मागे",
    secure: "तुमची कागदपत्रे सुरक्षितपणे हाताळली जातात",
    historyTitle: "मागील वैद्यकीय इतिहास",
    historyPlaceholder:
      "तुमच्या मागील वैद्यकीय इतिहासाबद्दल महत्त्वाची माहिती लिहा...",
    historyHelp:
      "मागील शस्त्रक्रिया, दीर्घकालीन आजार किंवा हॉस्पिटल भेटी नमूद करू शकता.",
  },

  bengali: {
    title: "নথি ও চিকিৎসা ইতিহাস",
    subtitle:
      "আগের চিকিৎসার নথি আপলোড করুন যাতে MediKiosk ডাক্তারের জন্য আরও সম্পূর্ণ সারাংশ তৈরি করতে পারে।",
    uploadTitle: "চিকিৎসার নথি যোগ করুন",
    uploadText:
      "প্রেসক্রিপশন, ল্যাব রিপোর্ট বা আগের চিকিৎসার নথি আপলোড করুন।",
    uploadButton: "নথি আপলোড করুন",
    scanButton: "নথি স্ক্যান করুন",
    supported:
      "PDF, JPG, JPEG, PNG • সর্বোচ্চ 10 MB",
    recordsTitle: "নথির বিভাগ",
    recordsSubtitle:
      "যে ধরনের নথি যোগ করতে চান তা নির্বাচন করুন।",
    prescription: "প্রেসক্রিপশন",
    lab: "ল্যাব রিপোর্ট",
    reports: "মেডিকেল রিপোর্ট",
    other: "অন্যান্য রেকর্ড",
    uploaded: "আপলোড করা নথি",
    remove: "সরান",
    processing: "নথি প্রসেস করা হচ্ছে...",
    processed: "AI সারাংশের জন্য প্রস্তুত",
    skip: "এখন বাদ দিন",
    continue: "AI সারাংশে যান",
    back: "পিছনে",
    secure: "আপনার নথি নিরাপদে পরিচালনা করা হয়",
    historyTitle: "আগের চিকিৎসা ইতিহাস",
    historyPlaceholder:
      "আপনার আগের চিকিৎসা ইতিহাস সম্পর্কে গুরুত্বপূর্ণ তথ্য লিখুন...",
    historyHelp:
      "আগের অস্ত্রোপচার, দীর্ঘমেয়াদি রোগ বা হাসপাতালে যাওয়ার তথ্য লিখতে পারেন।",
  },

  gujarati: {
    title: "દસ્તાવેજો અને મેડિકલ હિસ્ટ્રી",
    subtitle:
      "જૂના મેડિકલ રેકોર્ડ અપલોડ કરો જેથી MediKiosk ડૉક્ટર માટે વધુ સંપૂર્ણ સારાંશ તૈયાર કરી શકે.",
    uploadTitle: "મેડિકલ દસ્તાવેજો ઉમેરો",
    uploadText:
      "પ્રિસ્ક્રિપ્શન, લેબ રિપોર્ટ અથવા જૂના મેડિકલ રેકોર્ડ અપલોડ કરો.",
    uploadButton: "દસ્તાવેજ અપલોડ કરો",
    scanButton: "દસ્તાવેજ સ્કેન કરો",
    supported:
      "PDF, JPG, JPEG, PNG • મહત્તમ 10 MB",
    recordsTitle: "દસ્તાવેજ કેટેગરી",
    recordsSubtitle:
      "તમે ઉમેરવા માંગતા દસ્તાવેજનો પ્રકાર પસંદ કરો.",
    prescription: "પ્રિસ્ક્રિપ્શન",
    lab: "લેબ રિપોર્ટ",
    reports: "મેડિકલ રિપોર્ટ",
    other: "અન્ય રેકોર્ડ",
    uploaded: "અપલોડ કરેલા દસ્તાવેજો",
    remove: "દૂર કરો",
    processing: "દસ્તાવેજ પ્રોસેસ થઈ રહ્યો છે...",
    processed: "AI સારાંશ માટે તૈયાર",
    skip: "હમણાં છોડો",
    continue: "AI સારાંશ પર જાઓ",
    back: "પાછા",
    secure: "તમારા દસ્તાવેજો સુરક્ષિત રીતે સંભાળવામાં આવે છે",
    historyTitle: "અગાઉની મેડિકલ હિસ્ટ્રી",
    historyPlaceholder:
      "તમારી અગાઉની મેડિકલ હિસ્ટ્રી વિશે મહત્વપૂર્ણ માહિતી લખો...",
    historyHelp:
      "અગાઉની સર્જરી, લાંબી બીમારી અથવા હોસ્પિટલ મુલાકાતો વિશે લખી શકો છો.",
  },

  tamil: {
    title: "ஆவணங்கள் மற்றும் மருத்துவ வரலாறு",
    subtitle:
      "முந்தைய மருத்துவ பதிவுகளை பதிவேற்றுங்கள். MediKiosk மருத்துவருக்கான முழுமையான சுருக்கத்தைத் தயாரிக்கும்.",
    uploadTitle: "மருத்துவ ஆவணங்களைச் சேர்க்கவும்",
    uploadText:
      "மருந்துச் சீட்டு, ஆய்வக அறிக்கை அல்லது முந்தைய மருத்துவ பதிவுகளை பதிவேற்றவும்.",
    uploadButton: "ஆவணத்தைப் பதிவேற்றவும்",
    scanButton: "ஆவணத்தை ஸ்கேன் செய்யவும்",
    supported:
      "PDF, JPG, JPEG, PNG • அதிகபட்சம் 10 MB",
    recordsTitle: "ஆவண வகைகள்",
    recordsSubtitle:
      "சேர்க்க வேண்டிய ஆவணத்தின் வகையைத் தேர்ந்தெடுக்கவும்.",
    prescription: "மருந்துச் சீட்டு",
    lab: "ஆய்வக அறிக்கை",
    reports: "மருத்துவ அறிக்கை",
    other: "மற்ற பதிவு",
    uploaded: "பதிவேற்றப்பட்ட ஆவணங்கள்",
    remove: "அகற்று",
    processing: "ஆவணம் செயலாக்கப்படுகிறது...",
    processed: "AI சுருக்கத்திற்கு தயாராக உள்ளது",
    skip: "இப்போது தவிர்க்கவும்",
    continue: "AI சுருக்கத்திற்கு செல்லவும்",
    back: "பின்செல்",
    secure: "உங்கள் ஆவணங்கள் பாதுகாப்பாக கையாளப்படுகின்றன",
    historyTitle: "முந்தைய மருத்துவ வரலாறு",
    historyPlaceholder:
      "உங்கள் முந்தைய மருத்துவ வரலாறு பற்றி முக்கியமான தகவல்களை எழுதுங்கள்...",
    historyHelp:
      "முந்தைய அறுவை சிகிச்சைகள், நீண்டகால நோய்கள் அல்லது மருத்துவமனை வருகைகளை குறிப்பிடலாம்.",
  },

  telugu: {
    title: "పత్రాలు & వైద్య చరిత్ర",
    subtitle:
      "మునుపటి వైద్య రికార్డులను అప్‌లోడ్ చేయండి. MediKiosk డాక్టర్ కోసం పూర్తి సారాంశాన్ని సిద్ధం చేస్తుంది.",
    uploadTitle: "వైద్య పత్రాలను జోడించండి",
    uploadText:
      "ప్రిస్క్రిప్షన్‌లు, ల్యాబ్ రిపోర్టులు లేదా మునుపటి వైద్య రికార్డులను అప్‌లోడ్ చేయండి.",
    uploadButton: "పత్రాన్ని అప్‌లోడ్ చేయండి",
    scanButton: "పత్రాన్ని స్కాన్ చేయండి",
    supported:
      "PDF, JPG, JPEG, PNG • గరిష్టంగా 10 MB",
    recordsTitle: "పత్రాల వర్గాలు",
    recordsSubtitle:
      "మీరు జోడించాలనుకుంటున్న పత్రం రకాన్ని ఎంచుకోండి.",
    prescription: "ప్రిస్క్రిప్షన్",
    lab: "ల్యాబ్ రిపోర్ట్",
    reports: "వైద్య రిపోర్ట్",
    other: "ఇతర రికార్డు",
    uploaded: "అప్‌లోడ్ చేసిన పత్రాలు",
    remove: "తొలగించండి",
    processing: "పత్రం ప్రాసెస్ అవుతోంది...",
    processed: "AI సారాంశానికి సిద్ధంగా ఉంది",
    skip: "ప్రస్తుతానికి దాటవేయండి",
    continue: "AI సారాంశానికి వెళ్లండి",
    back: "వెనుకకు",
    secure: "మీ పత్రాలు సురక్షితంగా నిర్వహించబడతాయి",
    historyTitle: "మునుపటి వైద్య చరిత్ర",
    historyPlaceholder:
      "మీ మునుపటి వైద్య చరిత్ర గురించి ముఖ్యమైన సమాచారాన్ని టైప్ చేయండి...",
    historyHelp:
      "మునుపటి శస్త్రచికిత్సలు, దీర్ఘకాలిక వ్యాధులు లేదా ఆసుపత్రి సందర్శనలను పేర్కొనవచ్చు.",
  },

  kannada: {
    title: "ದಾಖಲೆಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    subtitle:
      "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. MediKiosk ವೈದ್ಯರಿಗಾಗಿ ಸಂಪೂರ್ಣ ಸಾರಾಂಶವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    uploadTitle: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಸೇರಿಸಿ",
    uploadText:
      "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್, ಲ್ಯಾಬ್ ವರದಿ ಅಥವಾ ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    uploadButton: "ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    scanButton: "ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    supported:
      "PDF, JPG, JPEG, PNG • ಗರಿಷ್ಠ 10 MB",
    recordsTitle: "ದಾಖಲೆ ವರ್ಗಗಳು",
    recordsSubtitle:
      "ನೀವು ಸೇರಿಸಲು ಬಯಸುವ ದಾಖಲೆಯ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    prescription: "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್",
    lab: "ಲ್ಯಾಬ್ ವರದಿ",
    reports: "ವೈದ್ಯಕೀಯ ವರದಿ",
    other: "ಇತರೆ ದಾಖಲೆ",
    uploaded: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು",
    remove: "ತೆಗೆದುಹಾಕಿ",
    processing: "ದಾಖಲೆ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತಿದೆ...",
    processed: "AI ಸಾರಾಂಶಕ್ಕೆ ಸಿದ್ಧವಾಗಿದೆ",
    skip: "ಈಗ ಬಿಟ್ಟುಬಿಡಿ",
    continue: "AI ಸಾರಾಂಶಕ್ಕೆ ಹೋಗಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    secure: "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ",
    historyTitle: "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    historyPlaceholder:
      "ನಿಮ್ಮ ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸದ ಬಗ್ಗೆ ಮುಖ್ಯ ಮಾಹಿತಿಯನ್ನು ಬರೆಯಿರಿ...",
    historyHelp:
      "ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು, ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆಗಳು ಅಥವಾ ಆಸ್ಪತ್ರೆ ಭೇಟಿಗಳನ್ನು ನಮೂದಿಸಬಹುದು.",
  },

  malayalam: {
    title: "രേഖകളും മെഡിക്കൽ ചരിത്രവും",
    subtitle:
      "മുൻ മെഡിക്കൽ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക. MediKiosk ഡോക്ടർക്കായി കൂടുതൽ പൂർണ്ണമായ സംഗ്രഹം തയ്യാറാക്കും.",
    uploadTitle: "മെഡിക്കൽ രേഖകൾ ചേർക്കുക",
    uploadText:
      "പ്രിസ്ക്രിപ്ഷൻ, ലാബ് റിപ്പോർട്ട് അല്ലെങ്കിൽ മുൻ മെഡിക്കൽ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക.",
    uploadButton: "രേഖ അപ്‌ലോഡ് ചെയ്യുക",
    scanButton: "രേഖ സ്കാൻ ചെയ്യുക",
    supported:
      "PDF, JPG, JPEG, PNG • പരമാവധി 10 MB",
    recordsTitle: "രേഖാ വിഭാഗങ്ങൾ",
    recordsSubtitle:
      "ചേർക്കേണ്ട രേഖയുടെ തരം തിരഞ്ഞെടുക്കുക.",
    prescription: "പ്രിസ്ക്രിപ്ഷൻ",
    lab: "ലാബ് റിപ്പോർട്ട്",
    reports: "മെഡിക്കൽ റിപ്പോർട്ട്",
    other: "മറ്റ് രേഖ",
    uploaded: "അപ്‌ലോഡ് ചെയ്ത രേഖകൾ",
    remove: "നീക്കം ചെയ്യുക",
    processing: "രേഖ പ്രോസസ്സ് ചെയ്യുന്നു...",
    processed: "AI സംഗ്രഹത്തിനായി തയ്യാറാണ്",
    skip: "ഇപ്പോൾ ഒഴിവാക്കുക",
    continue: "AI സംഗ്രഹത്തിലേക്ക് പോകുക",
    back: "തിരികെ",
    secure: "നിങ്ങളുടെ രേഖകൾ സുരക്ഷിതമായി കൈകാര്യം ചെയ്യുന്നു",
    historyTitle: "മുൻ മെഡിക്കൽ ചരിത്രം",
    historyPlaceholder:
      "നിങ്ങളുടെ മുൻ മെഡിക്കൽ ചരിത്രത്തെക്കുറിച്ചുള്ള പ്രധാന വിവരങ്ങൾ എഴുതുക...",
    historyHelp:
      "മുൻ ശസ്ത്രക്രിയകൾ, ദീർഘകാല രോഗങ്ങൾ അല്ലെങ്കിൽ ആശുപത്രി സന്ദർശനങ്ങൾ രേഖപ്പെടുത്താം.",
  },

  punjabi: {
    title: "ਦਸਤਾਵੇਜ਼ ਅਤੇ ਮੈਡੀਕਲ ਹਿਸਟਰੀ",
    subtitle:
      "ਪੁਰਾਣੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਅਪਲੋਡ ਕਰੋ ਤਾਂ ਜੋ MediKiosk ਡਾਕਟਰ ਲਈ ਵਧੇਰੇ ਪੂਰਾ ਸਾਰ ਤਿਆਰ ਕਰ ਸਕੇ।",
    uploadTitle: "ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼ ਸ਼ਾਮਲ ਕਰੋ",
    uploadText:
      "ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ, ਲੈਬ ਰਿਪੋਰਟ ਜਾਂ ਪੁਰਾਣੇ ਮੈਡੀਕਲ ਰਿਕਾਰਡ ਅਪਲੋਡ ਕਰੋ।",
    uploadButton: "ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ",
    scanButton: "ਦਸਤਾਵੇਜ਼ ਸਕੈਨ ਕਰੋ",
    supported:
      "PDF, JPG, JPEG, PNG • ਵੱਧ ਤੋਂ ਵੱਧ 10 MB",
    recordsTitle: "ਦਸਤਾਵੇਜ਼ ਸ਼੍ਰੇਣੀਆਂ",
    recordsSubtitle:
      "ਜਿਸ ਕਿਸਮ ਦਾ ਦਸਤਾਵੇਜ਼ ਸ਼ਾਮਲ ਕਰਨਾ ਹੈ ਉਹ ਚੁਣੋ।",
    prescription: "ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ",
    lab: "ਲੈਬ ਰਿਪੋਰਟ",
    reports: "ਮੈਡੀਕਲ ਰਿਪੋਰਟ",
    other: "ਹੋਰ ਰਿਕਾਰਡ",
    uploaded: "ਅਪਲੋਡ ਕੀਤੇ ਦਸਤਾਵੇਜ਼",
    remove: "ਹਟਾਓ",
    processing: "ਦਸਤਾਵੇਜ਼ ਪ੍ਰੋਸੈਸ ਹੋ ਰਿਹਾ ਹੈ...",
    processed: "AI ਸਾਰ ਲਈ ਤਿਆਰ",
    skip: "ਹੁਣੇ ਛੱਡੋ",
    continue: "AI ਸਾਰ ਵੱਲ ਜਾਓ",
    back: "ਵਾਪਸ",
    secure: "ਤੁਹਾਡੇ ਦਸਤਾਵੇਜ਼ ਸੁਰੱਖਿਅਤ ਤਰੀਕੇ ਨਾਲ ਸੰਭਾਲੇ ਜਾਂਦੇ ਹਨ",
    historyTitle: "ਪਿਛਲੀ ਮੈਡੀਕਲ ਹਿਸਟਰੀ",
    historyPlaceholder:
      "ਆਪਣੀ ਪਿਛਲੀ ਮੈਡੀਕਲ ਹਿਸਟਰੀ ਬਾਰੇ ਮਹੱਤਵਪੂਰਨ ਜਾਣਕਾਰੀ ਲਿਖੋ...",
    historyHelp:
      "ਪਿਛਲੀਆਂ ਸਰਜਰੀਆਂ, ਲੰਬੇ ਸਮੇਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਜਾਂ ਹਸਪਤਾਲ ਦੌਰੇ ਦੱਸ ਸਕਦੇ ਹੋ।",
  },
};

export default function PatientDocumentsPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [history, setHistory] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Prescription");

  const [processing, setProcessing] =
    useState<string | null>(null);

  const [showScan, setShowScan] =
    useState(false);

  const [scanProcessing, setScanProcessing] =
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

    const savedDocuments =
      localStorage.getItem(
        "medikiosk-documents"
      );

    if (savedDocuments) {
      try {
        setDocuments(
          JSON.parse(savedDocuments)
        );
      } catch {
        setDocuments([]);
      }
    }

    const savedHistory =
      localStorage.getItem(
        "medikiosk-medical-history"
      );

    if (savedHistory) {
      setHistory(savedHistory);
    }
  }, []);

  const t = translations[language];

  /* =====================================================
     SAVE DOCUMENTS
  ===================================================== */

  function saveDocuments(
    updated: DocumentItem[]
  ) {
    setDocuments(updated);

    localStorage.setItem(
      "medikiosk-documents",
      JSON.stringify(updated)
    );
  }

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  function handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const sizeInMB =
      file.size /
      (1024 * 1024);

    if (sizeInMB > 10) {
      alert(
        "File size must be less than 10 MB."
      );

      event.target.value = "";
      return;
    }

    const newDocument: DocumentItem = {
      id:
        Date.now().toString(),
      name: file.name,
      type: selectedCategory,
      size:
        sizeInMB < 1
          ? `${Math.round(
              file.size / 1024
            )} KB`
          : `${sizeInMB.toFixed(
              1
            )} MB`,
      source: "upload",
    };

    const updated = [
      ...documents,
      newDocument,
    ];

    saveDocuments(updated);

    setProcessing(
      newDocument.id
    );

    setTimeout(() => {
      setProcessing(null);
    }, 1400);

    event.target.value = "";
  }

  /* =====================================================
     DEMO SCAN
  ===================================================== */

  function handleScan() {
    setShowScan(true);
    setScanProcessing(true);

    setTimeout(() => {
      const scanned: DocumentItem = {
        id:
          Date.now().toString(),
        name:
          "Scanned_Medical_Record.pdf",
        type: selectedCategory,
        size: "1.2 MB",
        source: "scan",
      };

      saveDocuments([
        ...documents,
        scanned,
      ]);

      setScanProcessing(false);
    }, 1800);
  }

  /* =====================================================
     REMOVE DOCUMENT
  ===================================================== */

  function removeDocument(
    id: string
  ) {
    saveDocuments(
      documents.filter(
        (doc) => doc.id !== id
      )
    );
  }

  /* =====================================================
     CONTINUE
  ===================================================== */

  function handleContinue() {
    localStorage.setItem(
      "medikiosk-medical-history",
      history
    );

    localStorage.setItem(
      "medikiosk-documents-complete",
      "true"
    );

    router.push(
      "/patient/summary"
    );
  }

  /* =====================================================
     UI
  ===================================================== */

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
          href="/patient/intake"
          className="flex items-center gap-2 text-sm font-medium text-[#5C6B67] hover:text-[#10201D] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">
            {t.back}
          </span>
        </Link>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <section className="flex-1 px-4 sm:px-6 pb-10">

        <div className="w-full max-w-5xl mx-auto">

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <FileText
                className="w-7 h-7 text-[#1B7A6B]"
                strokeWidth={2}
              />

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10201D]">
              {t.title}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#66736F] max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>

          </div>


          {/* =================================================
              UPLOAD CARD
          ================================================= */}

          <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] flex items-center justify-center">

                <Upload
                  className="w-5 h-5 text-[#1B7A6B]"
                />

              </div>

              <div>

                <h2 className="font-semibold text-lg text-[#10201D]">
                  {t.uploadTitle}
                </h2>

                <p className="text-sm text-[#75817D]">
                  {t.uploadText}
                </p>

              </div>

            </div>


            {/* CATEGORY BUTTONS */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">

              {[
                {
                  value: "Prescription",
                  label: t.prescription,
                  icon: ClipboardList,
                },
                {
                  value: "Lab Report",
                  label: t.lab,
                  icon: Activity,
                },
                {
                  value: "Medical Report",
                  label: t.reports,
                  icon: FileCheck2,
                },
                {
                  value: "Other",
                  label: t.other,
                  icon: FileText,
                },
              ].map(
                ({
                  value,
                  label,
                  icon: Icon,
                }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(
                        value
                      )
                    }
                    className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium cursor-pointer transition-all ${
                      selectedCategory ===
                      value
                        ? "border-[#1B7A6B] bg-[#EAF6F3] text-[#1B7A6B]"
                        : "border-[#E1E5E3] bg-white text-[#53615D] hover:border-[#A9C9C1]"
                    }`}
                  >

                    <Icon className="w-4 h-4 shrink-0" />

                    <span className="truncate">
                      {label}
                    </span>

                  </button>
                )
              )}

            </div>


            {/* UPLOAD / SCAN */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* UPLOAD */}

              <label className="flex items-center justify-center gap-3 rounded-xl bg-[#1B7A6B] text-white py-4 px-4 font-semibold hover:bg-[#166358] cursor-pointer transition-colors">

                <Upload className="w-5 h-5" />

                <span>
                  {t.uploadButton}
                </span>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleFileUpload
                  }
                  className="hidden"
                />

              </label>


              {/* SCAN */}

              <button
                type="button"
                onClick={handleScan}
                className="flex items-center justify-center gap-3 rounded-xl border border-[#C9D8D3] bg-white text-[#1B7A6B] py-4 px-4 font-semibold hover:bg-[#F4F9F7] cursor-pointer transition-colors"
              >

                <Camera className="w-5 h-5" />

                <span>
                  {t.scanButton}
                </span>

              </button>

            </div>


            <p className="text-center text-xs text-[#8A9491] mt-3">
              {t.supported}
            </p>

          </div>


          {/* =================================================
              UPLOADED DOCUMENTS
          ================================================= */}

          {documents.length >
            0 && (
            <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7 mt-5">

              <div className="flex items-center justify-between gap-3 mb-5">

                <div>

                  <h2 className="font-semibold text-lg text-[#10201D]">
                    {t.uploaded}
                  </h2>

                  <p className="text-sm text-[#75817D]">
                    {documents.length}{" "}
                    {documents.length ===
                    1
                      ? "document"
                      : "documents"}
                  </p>

                </div>

                <div className="w-10 h-10 rounded-full bg-[#EAF6F3] flex items-center justify-center">

                  <FileCheck2
                    className="w-5 h-5 text-[#1B7A6B]"
                  />

                </div>

              </div>


              <div className="space-y-3">

                {documents.map(
                  (doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 border border-[#E4E9E7] rounded-xl p-3 sm:p-4"
                    >

                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#F0F5F3] flex items-center justify-center shrink-0">

                        {doc.source ===
                        "scan" ? (
                          <Camera className="w-5 h-5 text-[#1B7A6B]" />
                        ) : (
                          <FileText className="w-5 h-5 text-[#1B7A6B]" />
                        )}

                      </div>


                      <div className="flex-1 min-w-0">

                        <p className="font-medium text-sm sm:text-base text-[#10201D] truncate">
                          {doc.name}
                        </p>

                        <p className="text-xs text-[#7B8783] mt-1">
                          {doc.type} •{" "}
                          {doc.size}
                        </p>

                        {processing ===
                        doc.id ? (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#1B7A6B]">

                            <Loader2 className="w-3 h-3 animate-spin" />

                            {t.processing}

                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#1B7A6B]">

                            <CheckCircle2 className="w-3 h-3" />

                            {t.processed}

                          </div>
                        )}

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeDocument(
                            doc.id
                          )
                        }
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[#8A9491] hover:bg-red-50 hover:text-red-500 cursor-pointer shrink-0"
                        title={t.remove}
                      >

                        <X className="w-4 h-4" />

                      </button>

                    </div>
                  )
                )}

              </div>

            </div>
          )}


          {/* =================================================
              MEDICAL HISTORY
          ================================================= */}

          <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-7 mt-5">

            <div className="flex items-start gap-3 mb-4">

              <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] flex items-center justify-center shrink-0">

                <ClipboardList
                  className="w-5 h-5 text-[#1B7A6B]"
                />

              </div>

              <div>

                <h2 className="font-semibold text-lg text-[#10201D]">
                  {t.historyTitle}
                </h2>

                <p className="text-sm text-[#75817D] mt-1">
                  {t.historyHelp}
                </p>

              </div>

            </div>


            <textarea
              value={history}
              onChange={(e) =>
                setHistory(
                  e.target.value
                )
              }
              rows={5}
              placeholder={
                t.historyPlaceholder
              }
              className="w-full resize-none rounded-xl border border-[#E1E5E3] px-4 py-3.5 text-sm sm:text-base text-[#10201D] placeholder:text-[#A0AAA7] focus:outline-none focus:ring-2 focus:ring-[#1B7A6B] focus:border-transparent"
            />

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/patient/summary"
                )
              }
              className="sm:w-auto px-6 py-3.5 rounded-xl border border-[#DDE4E1] bg-white text-[#53615D] font-medium hover:border-[#AABCB6] cursor-pointer"
            >
              {t.skip}
            </button>


            <button
              type="button"
              onClick={
                handleContinue
              }
              className="flex-1 rounded-xl bg-[#1B7A6B] text-white py-3.5 px-6 font-semibold hover:bg-[#166358] flex items-center justify-center gap-2 cursor-pointer"
            >

              <Sparkles className="w-5 h-5" />

              {t.continue}

              <ArrowRight className="w-5 h-5" />

            </button>

          </div>


          {/* =================================================
              SECURITY FOOTER
          ================================================= */}

          <div className="flex items-center justify-center gap-2 mt-5 text-xs sm:text-sm text-[#7B8783]">

            <ShieldCheck className="w-4 h-4 text-[#1B7A6B]" />

            <span>
              {t.secure}
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          SCAN MODAL
      ================================================= */}

      {showScan && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-xl">

            <div className="flex items-center justify-between mb-5">

              <h2 className="font-semibold text-xl text-[#10201D]">
                {t.scanButton}
              </h2>

              {!scanProcessing && (
                <button
                  type="button"
                  onClick={() =>
                    setShowScan(
                      false
                    )
                  }
                  className="w-9 h-9 rounded-lg hover:bg-[#F2F5F4] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#687570]" />
                </button>
              )}

            </div>


            {scanProcessing ? (
              <div className="py-10 text-center">

                <div className="w-16 h-16 rounded-full bg-[#EAF6F3] flex items-center justify-center mx-auto mb-5">

                  <Loader2 className="w-8 h-8 text-[#1B7A6B] animate-spin" />

                </div>

                <h3 className="font-semibold text-[#10201D]">
                  {t.processing}
                </h3>

                <p className="text-sm text-[#75817D] mt-2">
                  AI is reading the document
                  for the demo.
                </p>

              </div>
            ) : (
              <div className="text-center py-5">

                <div className="w-16 h-16 rounded-full bg-[#EAF6F3] flex items-center justify-center mx-auto mb-5">

                  <CheckCircle2 className="w-8 h-8 text-[#1B7A6B]" />

                </div>

                <h3 className="font-semibold text-lg text-[#10201D]">
                  Document scanned
                </h3>

                <p className="text-sm text-[#75817D] mt-2 mb-6">
                  The scanned record has been
                  added to your documents.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowScan(
                      false
                    )
                  }
                  className="w-full rounded-xl bg-[#1B7A6B] text-white py-3 font-semibold cursor-pointer"
                >
                  Continue
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}