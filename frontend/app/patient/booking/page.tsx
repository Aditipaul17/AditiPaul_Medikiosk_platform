"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Stethoscope,
  ShieldCheck,
  Video,
  Building2,
  ChevronDown,
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

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experience: string;
  rating: string;
  fee: string;
  specialization?: string;
  department?: string;
  status?: "Active" | "Pending";
};

const defaultDoctor: Doctor = {
  id: "s1",
  name: "Dr. Ananya Sharma",
  specialty: "General Physician",
  hospital: "CityCare Multispeciality Hospital",
  experience: "12 years experience",
  rating: "4.8",
  fee: "₹500",
};

const translations: Record<
  LanguageKey,
  {
    title: string;
    subtitle: string;
    selectedDoctor: string;
    changeDoctor: string;
    hospital: string;
    specialty: string;
    date: string;
    chooseDate: string;
    time: string;
    chooseTime: string;
    mode: string;
    inPerson: string;
    videoConsultation: string;
    fee: string;
    consultationFee: string;
    appointmentSummary: string;
    doctor: string;
    location: string;
    selectedDate: string;
    selectedTime: string;
    appointmentType: string;
    confirm: string;
    back: string;
    secure: string;
    availableSlots: string;
    morning: string;
    afternoon: string;
    evening: string;
    confirmed: string;
    successTitle: string;
    successText: string;
    appointmentId: string;
    done: string;
    selectDateFirst: string;
  }
> = {
  english: {
    title: "Book Appointment",
    subtitle:
      "Choose a convenient date and time for your consultation.",
    selectedDoctor: "Selected Doctor",
    changeDoctor: "Change Doctor",
    hospital: "Hospital",
    specialty: "Specialty",
    date: "Appointment Date",
    chooseDate: "Choose a date",
    time: "Available Time",
    chooseTime: "Choose a time slot",
    mode: "Consultation Mode",
    inPerson: "In-Person",
    videoConsultation: "Video Consultation",
    fee: "Fee",
    consultationFee: "Consultation Fee",
    appointmentSummary: "Appointment Summary",
    doctor: "Doctor",
    location: "Location",
    selectedDate: "Date",
    selectedTime: "Time",
    appointmentType: "Type",
    confirm: "Confirm Appointment",
    back: "Back",
    secure: "Your appointment information is securely handled",
    availableSlots: "Available Slots",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    confirmed: "Appointment Confirmed",
    successTitle: "Your appointment is booked!",
    successText:
      "Your appointment has been successfully scheduled.",
    appointmentId: "Appointment ID",
    done: "Go to Patient Home",
    selectDateFirst: "Please select a date first.",
  },

  hindi: {
    title: "अपॉइंटमेंट बुक करें",
    subtitle:
      "कंसल्टेशन के लिए अपनी सुविधाजनक तारीख और समय चुनें।",
    selectedDoctor: "चयनित डॉक्टर",
    changeDoctor: "डॉक्टर बदलें",
    hospital: "अस्पताल",
    specialty: "विशेषज्ञता",
    date: "अपॉइंटमेंट की तारीख",
    chooseDate: "तारीख चुनें",
    time: "उपलब्ध समय",
    chooseTime: "समय चुनें",
    mode: "कंसल्टेशन का तरीका",
    inPerson: "अस्पताल में",
    videoConsultation: "वीडियो कंसल्टेशन",
    fee: "फीस",
    consultationFee: "कंसल्टेशन फीस",
    appointmentSummary: "अपॉइंटमेंट सारांश",
    doctor: "डॉक्टर",
    location: "स्थान",
    selectedDate: "तारीख",
    selectedTime: "समय",
    appointmentType: "तरीका",
    confirm: "अपॉइंटमेंट कन्फर्म करें",
    back: "वापस",
    secure: "आपकी अपॉइंटमेंट जानकारी सुरक्षित रखी जाती है",
    availableSlots: "उपलब्ध स्लॉट",
    morning: "सुबह",
    afternoon: "दोपहर",
    evening: "शाम",
    confirmed: "अपॉइंटमेंट कन्फर्म",
    successTitle: "आपका अपॉइंटमेंट बुक हो गया!",
    successText:
      "आपका अपॉइंटमेंट सफलतापूर्वक बुक कर दिया गया है।",
    appointmentId: "अपॉइंटमेंट आईडी",
    done: "पेशेंट होम पर जाएं",
    selectDateFirst: "कृपया पहले तारीख चुनें।",
  },

  marathi: {
    title: "अपॉइंटमेंट बुक करा",
    subtitle:
      "कन्सल्टेशनसाठी सोयीची तारीख आणि वेळ निवडा.",
    selectedDoctor: "निवडलेले डॉक्टर",
    changeDoctor: "डॉक्टर बदला",
    hospital: "हॉस्पिटल",
    specialty: "तज्ज्ञता",
    date: "अपॉइंटमेंटची तारीख",
    chooseDate: "तारीख निवडा",
    time: "उपलब्ध वेळ",
    chooseTime: "वेळ निवडा",
    mode: "कन्सल्टेशनचा प्रकार",
    inPerson: "हॉस्पिटलमध्ये",
    videoConsultation: "व्हिडिओ कन्सल्टेशन",
    fee: "फी",
    consultationFee: "कन्सल्टेशन फी",
    appointmentSummary: "अपॉइंटमेंट सारांश",
    doctor: "डॉक्टर",
    location: "स्थान",
    selectedDate: "तारीख",
    selectedTime: "वेळ",
    appointmentType: "प्रकार",
    confirm: "अपॉइंटमेंट कन्फर्म करा",
    back: "मागे",
    secure: "तुमची अपॉइंटमेंट माहिती सुरक्षित ठेवली जाते",
    availableSlots: "उपलब्ध स्लॉट",
    morning: "सकाळ",
    afternoon: "दुपार",
    evening: "संध्याकाळ",
    confirmed: "अपॉइंटमेंट कन्फर्म",
    successTitle: "तुमची अपॉइंटमेंट बुक झाली!",
    successText:
      "तुमची अपॉइंटमेंट यशस्वीरित्या बुक झाली आहे.",
    appointmentId: "अपॉइंटमेंट आयडी",
    done: "पेशंट होमवर जा",
    selectDateFirst: "कृपया आधी तारीख निवडा.",
  },

  bengali: {
    title: "অ্যাপয়েন্টমেন্ট বুক করুন",
    subtitle:
      "পরামর্শের জন্য সুবিধাজনক তারিখ ও সময় বেছে নিন।",
    selectedDoctor: "নির্বাচিত ডাক্তার",
    changeDoctor: "ডাক্তার পরিবর্তন করুন",
    hospital: "হাসপাতাল",
    specialty: "বিশেষজ্ঞতা",
    date: "অ্যাপয়েন্টমেন্টের তারিখ",
    chooseDate: "তারিখ বেছে নিন",
    time: "উপলব্ধ সময়",
    chooseTime: "সময় বেছে নিন",
    mode: "পরামর্শের ধরন",
    inPerson: "সরাসরি",
    videoConsultation: "ভিডিও পরামর্শ",
    fee: "ফি",
    consultationFee: "পরামর্শ ফি",
    appointmentSummary: "অ্যাপয়েন্টমেন্ট সারাংশ",
    doctor: "ডাক্তার",
    location: "স্থান",
    selectedDate: "তারিখ",
    selectedTime: "সময়",
    appointmentType: "ধরন",
    confirm: "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন",
    back: "পিছনে",
    secure: "আপনার অ্যাপয়েন্টমেন্ট তথ্য নিরাপদে রাখা হয়",
    availableSlots: "উপলব্ধ স্লট",
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    confirmed: "অ্যাপয়েন্টমেন্ট নিশ্চিত",
    successTitle: "আপনার অ্যাপয়েন্টমেন্ট বুক হয়েছে!",
    successText:
      "আপনার অ্যাপয়েন্টমেন্ট সফলভাবে নির্ধারিত হয়েছে।",
    appointmentId: "অ্যাপয়েন্টমেন্ট আইডি",
    done: "পেশেন্ট হোমে যান",
    selectDateFirst: "অনুগ্রহ করে আগে তারিখ বেছে নিন।",
  },

  gujarati: {
    title: "અપોઇન્ટમેન્ટ બુક કરો",
    subtitle:
      "કન્સલ્ટેશન માટે અનુકૂળ તારીખ અને સમય પસંદ કરો.",
    selectedDoctor: "પસંદ કરેલા ડૉક્ટર",
    changeDoctor: "ડૉક્ટર બદલો",
    hospital: "હોસ્પિટલ",
    specialty: "નિષ્ણાતતા",
    date: "અપોઇન્ટમેન્ટની તારીખ",
    chooseDate: "તારીખ પસંદ કરો",
    time: "ઉપલબ્ધ સમય",
    chooseTime: "સમય પસંદ કરો",
    mode: "કન્સલ્ટેશનનો પ્રકાર",
    inPerson: "હોસ્પિટલમાં",
    videoConsultation: "વિડિયો કન્સલ્ટેશન",
    fee: "ફી",
    consultationFee: "કન્સલ્ટેશન ફી",
    appointmentSummary: "અપોઇન્ટમેન્ટ સારાંશ",
    doctor: "ડૉક્ટર",
    location: "સ્થળ",
    selectedDate: "તારીખ",
    selectedTime: "સમય",
    appointmentType: "પ્રકાર",
    confirm: "અપોઇન્ટમેન્ટ કન્ફર્મ કરો",
    back: "પાછા",
    secure: "તમારી અપોઇન્ટમેન્ટ માહિતી સુરક્ષિત રીતે રાખવામાં આવે છે",
    availableSlots: "ઉપલબ્ધ સ્લોટ",
    morning: "સવાર",
    afternoon: "બપોર",
    evening: "સાંજ",
    confirmed: "અપોઇન્ટમેન્ટ કન્ફર્મ",
    successTitle: "તમારી અપોઇન્ટમેન્ટ બુક થઈ ગઈ!",
    successText:
      "તમારી અપોઇન્ટમેન્ટ સફળતાપૂર્વક શેડ્યૂલ થઈ છે.",
    appointmentId: "અપોઇન્ટમેન્ટ આઈડી",
    done: "પેશન્ટ હોમ પર જાઓ",
    selectDateFirst: "કૃપા કરીને પહેલા તારીખ પસંદ કરો.",
  },

  tamil: {
    title: "அப்பாயின்ட்மெண்ட் பதிவு",
    subtitle:
      "ஆலோசனைக்கான வசதியான தேதி மற்றும் நேரத்தைத் தேர்வு செய்யுங்கள்.",
    selectedDoctor: "தேர்ந்தெடுக்கப்பட்ட மருத்துவர்",
    changeDoctor: "மருத்துவரை மாற்றவும்",
    hospital: "மருத்துவமனை",
    specialty: "நிபுணத்துவம்",
    date: "அப்பாயின்ட்மெண்ட் தேதி",
    chooseDate: "தேதியைத் தேர்வு செய்யவும்",
    time: "கிடைக்கும் நேரம்",
    chooseTime: "நேரத்தைத் தேர்வு செய்யவும்",
    mode: "ஆலோசனை வகை",
    inPerson: "நேரில்",
    videoConsultation: "வீடியோ ஆலோசனை",
    fee: "கட்டணம்",
    consultationFee: "ஆலோசனை கட்டணம்",
    appointmentSummary: "அப்பாயின்ட்மெண்ட் சுருக்கம்",
    doctor: "மருத்துவர்",
    location: "இடம்",
    selectedDate: "தேதி",
    selectedTime: "நேரம்",
    appointmentType: "வகை",
    confirm: "அப்பாயின்ட்மெண்ட்டை உறுதிசெய்க",
    back: "பின்செல்",
    secure: "உங்கள் அப்பாயின்ட்மெண்ட் தகவல் பாதுகாப்பாக கையாளப்படுகிறது",
    availableSlots: "கிடைக்கும் நேரங்கள்",
    morning: "காலை",
    afternoon: "மதியம்",
    evening: "மாலை",
    confirmed: "அப்பாயின்ட்மெண்ட் உறுதி",
    successTitle: "உங்கள் அப்பாயின்ட்மெண்ட் பதிவு செய்யப்பட்டது!",
    successText:
      "உங்கள் அப்பாயின்ட்மெண்ட் வெற்றிகரமாக பதிவு செய்யப்பட்டது.",
    appointmentId: "அப்பாயின்ட்மெண்ட் ஐடி",
    done: "பேஷன்ட் ஹோமுக்கு செல்லவும்",
    selectDateFirst: "முதலில் தேதியைத் தேர்வு செய்யவும்.",
  },

  telugu: {
    title: "అపాయింట్‌మెంట్ బుక్ చేయండి",
    subtitle:
      "కన్సల్టేషన్ కోసం అనుకూలమైన తేదీ మరియు సమయాన్ని ఎంచుకోండి.",
    selectedDoctor: "ఎంచుకున్న డాక్టర్",
    changeDoctor: "డాక్టర్‌ను మార్చండి",
    hospital: "ఆసుపత్రి",
    specialty: "నిపుణత",
    date: "అపాయింట్‌మెంట్ తేదీ",
    chooseDate: "తేదీని ఎంచుకోండి",
    time: "అందుబాటులో ఉన్న సమయం",
    chooseTime: "సమయాన్ని ఎంచుకోండి",
    mode: "కన్సల్టేషన్ విధానం",
    inPerson: "నేరుగా",
    videoConsultation: "వీడియో కన్సల్టేషన్",
    fee: "ఫీజు",
    consultationFee: "కన్సల్టేషన్ ఫీజు",
    appointmentSummary: "అపాయింట్‌మెంట్ సారాంశం",
    doctor: "డాక్టర్",
    location: "స్థలం",
    selectedDate: "తేదీ",
    selectedTime: "సమయం",
    appointmentType: "రకం",
    confirm: "అపాయింట్‌మెంట్ నిర్ధారించండి",
    back: "వెనుకకు",
    secure: "మీ అపాయింట్‌మెంట్ సమాచారం సురక్షితంగా నిర్వహించబడుతుంది",
    availableSlots: "అందుబాటులో ఉన్న స్లాట్లు",
    morning: "ఉదయం",
    afternoon: "మధ్యాహ్నం",
    evening: "సాయంత్రం",
    confirmed: "అపాయింట్‌మెంట్ నిర్ధారించబడింది",
    successTitle: "మీ అపాయింట్‌మెంట్ బుక్ అయింది!",
    successText:
      "మీ అపాయింట్‌మెంట్ విజయవంతంగా షెడ్యూల్ చేయబడింది.",
    appointmentId: "అపాయింట్‌మెంట్ ID",
    done: "పేషెంట్ హోమ్‌కు వెళ్లండి",
    selectDateFirst: "ముందుగా తేదీని ఎంచుకోండి.",
  },

  kannada: {
    title: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
    subtitle:
      "ಸಮಾಲೋಚನೆಗಾಗಿ ಅನುಕೂಲಕರ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    selectedDoctor: "ಆಯ್ಕೆ ಮಾಡಿದ ವೈದ್ಯರು",
    changeDoctor: "ವೈದ್ಯರನ್ನು ಬದಲಿಸಿ",
    hospital: "ಆಸ್ಪತ್ರೆ",
    specialty: "ತಜ್ಞತೆ",
    date: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದಿನಾಂಕ",
    chooseDate: "ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ",
    time: "ಲಭ್ಯವಿರುವ ಸಮಯ",
    chooseTime: "ಸಮಯ ಆಯ್ಕೆಮಾಡಿ",
    mode: "ಸಮಾಲೋಚನೆ ವಿಧಾನ",
    inPerson: "ನೇರವಾಗಿ",
    videoConsultation: "ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ",
    fee: "ಶುಲ್ಕ",
    consultationFee: "ಸಮಾಲೋಚನೆ ಶುಲ್ಕ",
    appointmentSummary: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಸಾರಾಂಶ",
    doctor: "ವೈದ್ಯರು",
    location: "ಸ್ಥಳ",
    selectedDate: "ದಿನಾಂಕ",
    selectedTime: "ಸಮಯ",
    appointmentType: "ವಿಧಾನ",
    confirm: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಖಚಿತಪಡಿಸಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    secure: "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ",
    availableSlots: "ಲಭ್ಯವಿರುವ ಸ್ಲಾಟ್‌ಗಳು",
    morning: "ಬೆಳಗ್ಗೆ",
    afternoon: "ಮಧ್ಯಾಹ್ನ",
    evening: "ಸಂಜೆ",
    confirmed: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಖಚಿತವಾಗಿದೆ",
    successTitle: "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಆಗಿದೆ!",
    successText:
      "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ನಿಗದಿಯಾಗಿದೆ.",
    appointmentId: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ID",
    done: "ಪೇಷಂಟ್ ಹೋಮ್‌ಗೆ ಹೋಗಿ",
    selectDateFirst: "ದಯವಿಟ್ಟು ಮೊದಲು ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ.",
  },

  malayalam: {
    title: "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക",
    subtitle:
      "കൺസൾട്ടേഷനായി സൗകര്യപ്രദമായ തീയതിയും സമയവും തിരഞ്ഞെടുക്കുക.",
    selectedDoctor: "തിരഞ്ഞെടുത്ത ഡോക്ടർ",
    changeDoctor: "ഡോക്ടറെ മാറ്റുക",
    hospital: "ആശുപത്രി",
    specialty: "വിദഗ്ധത",
    date: "അപ്പോയിന്റ്മെന്റ് തീയതി",
    chooseDate: "തീയതി തിരഞ്ഞെടുക്കുക",
    time: "ലഭ്യമായ സമയം",
    chooseTime: "സമയം തിരഞ്ഞെടുക്കുക",
    mode: "കൺസൾട്ടേഷൻ രീതി",
    inPerson: "നേരിട്ട്",
    videoConsultation: "വീഡിയോ കൺസൾട്ടേഷൻ",
    fee: "ഫീസ്",
    consultationFee: "കൺസൾട്ടേഷൻ ഫീസ്",
    appointmentSummary: "അപ്പോയിന്റ്മെന്റ് സംഗ്രഹം",
    doctor: "ഡോക്ടർ",
    location: "സ്ഥലം",
    selectedDate: "തീയതി",
    selectedTime: "സമയം",
    appointmentType: "രീതി",
    confirm: "അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിക്കുക",
    back: "തിരികെ",
    secure: "നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ സുരക്ഷിതമായി കൈകാര്യം ചെയ്യുന്നു",
    availableSlots: "ലഭ്യമായ സ്ലോട്ടുകൾ",
    morning: "രാവിലെ",
    afternoon: "ഉച്ചയ്ക്ക്",
    evening: "വൈകുന്നേരം",
    confirmed: "അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിച്ചു",
    successTitle: "നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്തു!",
    successText:
      "നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് വിജയകരമായി ഷെഡ്യൂൾ ചെയ്തു.",
    appointmentId: "അപ്പോയിന്റ്മെന്റ് ID",
    done: "പേഷ്യന്റ് ഹോമിലേക്ക് പോകുക",
    selectDateFirst: "ദയവായി ആദ്യം തീയതി തിരഞ്ഞെടുക്കുക.",
  },

  punjabi: {
    title: "ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ",
    subtitle:
      "ਕੰਸਲਟੇਸ਼ਨ ਲਈ ਸੁਵਿਧਾਜਨਕ ਤਾਰੀਖ ਅਤੇ ਸਮਾਂ ਚੁਣੋ।",
    selectedDoctor: "ਚੁਣਿਆ ਡਾਕਟਰ",
    changeDoctor: "ਡਾਕਟਰ ਬਦਲੋ",
    hospital: "ਹਸਪਤਾਲ",
    specialty: "ਮਾਹਿਰਤਾ",
    date: "ਅਪਾਇੰਟਮੈਂਟ ਦੀ ਤਾਰੀਖ",
    chooseDate: "ਤਾਰੀਖ ਚੁਣੋ",
    time: "ਉਪਲਬਧ ਸਮਾਂ",
    chooseTime: "ਸਮਾਂ ਚੁਣੋ",
    mode: "ਕੰਸਲਟੇਸ਼ਨ ਦਾ ਤਰੀਕਾ",
    inPerson: "ਹਸਪਤਾਲ ਵਿੱਚ",
    videoConsultation: "ਵੀਡੀਓ ਕੰਸਲਟੇਸ਼ਨ",
    fee: "ਫੀਸ",
    consultationFee: "ਕੰਸਲਟੇਸ਼ਨ ਫੀਸ",
    appointmentSummary: "ਅਪਾਇੰਟਮੈਂਟ ਸਾਰ",
    doctor: "ਡਾਕਟਰ",
    location: "ਸਥਾਨ",
    selectedDate: "ਤਾਰੀਖ",
    selectedTime: "ਸਮਾਂ",
    appointmentType: "ਤਰੀਕਾ",
    confirm: "ਅਪਾਇੰਟਮੈਂਟ ਕਨਫਰਮ ਕਰੋ",
    back: "ਵਾਪਸ",
    secure: "ਤੁਹਾਡੀ ਅਪਾਇੰਟਮੈਂਟ ਜਾਣਕਾਰੀ ਸੁਰੱਖਿਅਤ ਰੱਖੀ ਜਾਂਦੀ ਹੈ",
    availableSlots: "ਉਪਲਬਧ ਸਲਾਟ",
    morning: "ਸਵੇਰ",
    afternoon: "ਦੁਪਹਿਰ",
    evening: "ਸ਼ਾਮ",
    confirmed: "ਅਪਾਇੰਟਮੈਂਟ ਕਨਫਰਮ",
    successTitle: "ਤੁਹਾਡੀ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਹੋ ਗਈ!",
    successText:
      "ਤੁਹਾਡੀ ਅਪਾਇੰਟਮੈਂਟ ਸਫਲਤਾਪੂਰਵਕ ਬੁੱਕ ਹੋ ਗਈ ਹੈ।",
    appointmentId: "ਅਪਾਇੰਟਮੈਂਟ ID",
    done: "ਪੇਸ਼ੈਂਟ ਹੋਮ ਤੇ ਜਾਓ",
    selectDateFirst: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਤਾਰੀਖ ਚੁਣੋ।",
  },
};

const timeSlots = [
  {
    group: "morning",
    slots: ["09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM"],
  },
  {
    group: "afternoon",
    slots: ["12:30 PM", "01:00 PM", "02:30 PM", "03:00 PM"],
  },
  {
    group: "evening",
    slots: ["04:30 PM", "05:30 PM", "06:15 PM", "07:00 PM"],
  },
];

export default function PatientBookingPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [doctor, setDoctor] =
    useState<Doctor>(defaultDoctor);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  const [mode, setMode] = useState<
    "in-person" | "video"
  >("in-person");

  const [confirmed, setConfirmed] =
    useState(false);

  const [appointmentId, setAppointmentId] =
    useState("");

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

    /*
      SINGLE SOURCE OF TRUTH:
      Doctor records created by Hospital Admin live in
      "medikiosk-doctors". Booking must use the same records,
      so the doctor shown in an appointment always matches
      the doctor data used by the Doctor Portal.
    */
    let adminDoctors: Array<{
      id?: string;
      name?: string;
      specialization?: string;
      department?: string;
      hospital?: string;
      status?: "Active" | "Pending";
    }> = [];

    try {
      const storedDoctors =
        localStorage.getItem("medikiosk-doctors");

      if (storedDoctors) {
        const parsed = JSON.parse(storedDoctors);
        if (Array.isArray(parsed)) {
          adminDoctors = parsed;
        }
      }
    } catch {
      adminDoctors = [];
    }

    const activeDoctors = adminDoctors.filter(
      (item) => item.status === "Active"
    );

    const savedDoctor =
      localStorage.getItem(
        "medikiosk-selected-doctor"
      );

    let savedSelected: Partial<Doctor> | null = null;

    if (savedDoctor) {
      try {
        savedSelected = JSON.parse(savedDoctor);
      } catch {
        savedSelected = null;
      }
    }

    /*
      If Care Navigation selected a doctor, match that selection
      against the Admin doctor list. Otherwise use the first
      active Admin doctor. Never create an unrelated fallback
      doctor when Admin data exists.
    */
    const matchedAdminDoctor = activeDoctors.find(
      (item) =>
        (savedSelected?.id &&
          item.id &&
          String(item.id) === String(savedSelected.id)) ||
        (savedSelected?.name &&
          item.name &&
          item.name.trim().toLowerCase() ===
            String(savedSelected.name).trim().toLowerCase())
    );

    const sourceDoctor =
      matchedAdminDoctor || activeDoctors[0];

    if (sourceDoctor) {
      const normalizedDoctor: Doctor = {
        id: String(sourceDoctor.id || "doctor-1"),
        name: sourceDoctor.name || "Doctor",
        specialty:
          sourceDoctor.specialization ||
          sourceDoctor.department ||
          "Medical Consultation",
        hospital:
          sourceDoctor.hospital ||
          "Hospital / Clinic",
        experience:
          savedSelected?.experience || "Available for consultation",
        rating: savedSelected?.rating || "—",
        fee: savedSelected?.fee || "Consultation fee",
        specialization: sourceDoctor.specialization,
        department: sourceDoctor.department,
        status: sourceDoctor.status,
      };

      setDoctor(normalizedDoctor);

      // Keep selected-doctor storage aligned with Admin data.
      localStorage.setItem(
        "medikiosk-selected-doctor",
        JSON.stringify(normalizedDoctor)
      );
    } else if (savedSelected?.name) {
      // If Admin data has not been initialized yet, preserve
      // an explicitly selected doctor rather than inventing one.
      setDoctor(savedSelected as Doctor);
    } else {
      setDoctor(defaultDoctor);
    }
  }, []);

  const t = translations[language];

  const dateOptions = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();
      date.setDate(
        date.getDate() + index
      );

      return {
        value: date.toISOString().split("T")[0],
        day: date.toLocaleDateString(
          "en-IN",
          { weekday: "short" }
        ),
        date: date.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
          }
        ),
      };
    }
  );

  function confirmAppointment() {
    if (!selectedDate) {
      alert(t.selectDateFirst);
      return;
    }

    if (!selectedTime) {
      alert(t.chooseTime);
      return;
    }

    const id =
      "MK-" +
      Math.floor(
        100000 +
          Math.random() * 900000
      );

    setAppointmentId(id);
    setConfirmed(true);

    // Link the appointment to the currently logged-in patient.
    const currentPatientRaw = localStorage.getItem(
      "medikiosk-current-patient"
    );

    let currentPatient: { id?: string; mobile?: string } | null = null;

    if (currentPatientRaw) {
      try {
        currentPatient = JSON.parse(currentPatientRaw);
      } catch {
        currentPatient = null;
      }
    }

    const patientMobile = currentPatient?.mobile?.replace(/\\D/g, "");

    if (!patientMobile) {
      alert("Please login as a patient before booking an appointment.");
      setConfirmed(false);
      return;
    }

    const appointment = {
      id,
      doctor,
      doctorId: doctor.id,
      date: selectedDate,
      time: selectedTime,
      mode,
      patientId: currentPatient?.id || `P-${patientMobile}`,
      patientMobile,
      bookedAt: new Date().toISOString(),
    };

    // Patient-specific appointment key.
    localStorage.setItem(
      `medikiosk-appointment-${patientMobile}`,
      JSON.stringify(appointment)
    );

    // Keep the old key updated for backward compatibility.
    localStorage.setItem(
      "medikiosk-appointment",
      JSON.stringify(appointment)
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-[#F6F7F5] flex items-center justify-center px-4 py-8">

        <div className="w-full max-w-xl">

          <div className="bg-white rounded-3xl border border-[#E1E5E3] p-6 sm:p-10 text-center shadow-sm">

            <div className="w-20 h-20 rounded-full bg-[#E6F5F0] flex items-center justify-center mx-auto">

              <CheckCircle2 className="w-11 h-11 text-[#1B7A6B]" />

            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#10201D] mt-6">
              {t.successTitle}
            </h1>

            <p className="text-[#687570] mt-2 text-sm sm:text-base">
              {t.successText}
            </p>

            <div className="mt-7 rounded-2xl bg-[#F4F8F6] p-5 text-left">

              <div className="flex items-center justify-between border-b border-[#DDE6E2] pb-4">

                <span className="text-sm text-[#7A8581]">
                  {t.appointmentId}
                </span>

                <span className="font-bold text-[#1B7A6B]">
                  {appointmentId}
                </span>

              </div>

              <div className="mt-4">

                <p className="font-semibold text-[#10201D]">
                  {doctor.name}
                </p>

                <p className="text-sm text-[#1B7A6B] mt-1">
                  {doctor.specialty}
                </p>

                <p className="text-sm text-[#687570] mt-1">
                  {doctor.hospital}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">

                <div>
                  <p className="text-xs text-[#89938F]">
                    {t.selectedDate}
                  </p>

                  <p className="font-medium text-sm mt-1 text-[#10201D]">
                    {selectedDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#89938F]">
                    {t.selectedTime}
                  </p>

                  <p className="font-medium text-sm mt-1 text-[#10201D]">
                    {selectedTime}
                  </p>
                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/patient/home"
                )
              }
              className="w-full mt-6 rounded-xl bg-[#1B7A6B] text-white py-4 font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#166358]"
            >
              {t.done}

              <ArrowRight className="w-5 h-5" />

            </button>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5]">

      {/* HEADER */}

      <header className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-md bg-[#10201D] flex items-center justify-center">

            <Activity className="w-4 h-4 text-white" />

          </div>

          <span className="font-semibold text-[#10201D]">
            MEDIKIOSK
          </span>

        </div>

        <Link
          href="/patient/care-navigation"
          className="flex items-center gap-2 text-sm font-medium text-[#66736F] hover:text-[#10201D] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />

          <span className="hidden sm:inline">
            {t.back}
          </span>
        </Link>

      </header>


      {/* CONTENT */}

      <section className="px-4 sm:px-6 pb-10">

        <div className="max-w-6xl mx-auto">

          {/* TITLE */}

          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <CalendarDays className="w-7 h-7 text-[#1B7A6B]" />

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#10201D]">
              {t.title}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#66736F]">
              {t.subtitle}
            </p>

          </div>


          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">


            {/* =====================================================
                LEFT
            ===================================================== */}

            <div className="space-y-5">

              {/* DOCTOR CARD */}

              <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-6">

                <div className="flex items-center justify-between gap-3 mb-5">

                  <h2 className="font-semibold text-lg text-[#10201D]">
                    {t.selectedDoctor}
                  </h2>

                  <Link
                    href="/patient/care-navigation"
                    className="text-sm font-medium text-[#1B7A6B] cursor-pointer"
                  >
                    {t.changeDoctor}
                  </Link>

                </div>

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EAF6F3] flex items-center justify-center shrink-0">

                    <Stethoscope className="w-7 h-7 text-[#1B7A6B]" />

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-semibold text-lg text-[#10201D]">
                      {doctor.name}
                    </h3>

                    <p className="text-sm text-[#1B7A6B] font-medium mt-1">
                      {doctor.specialty}
                    </p>

                    <p className="text-sm text-[#74817D] mt-1">
                      {doctor.experience}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-2 mt-5 pt-5 border-t border-[#EDF0EF]">

                  <Building2 className="w-4 h-4 text-[#1B7A6B] mt-0.5 shrink-0" />

                  <div>

                    <p className="text-xs text-[#89938F]">
                      {t.hospital}
                    </p>

                    <p className="text-sm font-medium text-[#10201D] mt-1">
                      {doctor.hospital}
                    </p>

                  </div>

                </div>

              </div>


              {/* DATE */}

              <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] flex items-center justify-center">

                    <CalendarDays className="w-5 h-5 text-[#1B7A6B]" />

                  </div>

                  <div>

                    <h2 className="font-semibold text-lg text-[#10201D]">
                      {t.date}
                    </h2>

                    <p className="text-xs text-[#89938F]">
                      {t.chooseDate}
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">

                  {dateOptions.map(
                    (item, index) => {

                      const active =
                        selectedDate ===
                        item.value;

                      return (
                        <button
                          type="button"
                          key={item.value}
                          onClick={() =>
                            setSelectedDate(
                              item.value
                            )
                          }
                          className={`relative rounded-xl border p-3 min-h-[82px] cursor-pointer ${
                            active
                              ? "border-[#1B7A6B] bg-[#EAF6F3]"
                              : "border-[#E1E5E3] bg-white hover:border-[#AFCAC3]"
                          }`}
                        >

                          {active && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1B7A6B] flex items-center justify-center">

                              <Check className="w-3 h-3 text-white" />

                            </div>
                          )}

                          <p className="text-xs text-[#7D8985]">
                            {index === 0
                              ? "Today"
                              : item.day}
                          </p>

                          <p className="font-semibold text-sm text-[#10201D] mt-2">
                            {item.date}
                          </p>

                        </button>
                      );
                    }
                  )}

                </div>

              </div>


              {/* TIME */}

              <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-lg bg-[#EAF6F3] flex items-center justify-center">

                    <Clock3 className="w-5 h-5 text-[#1B7A6B]" />

                  </div>

                  <div>

                    <h2 className="font-semibold text-lg text-[#10201D]">
                      {t.time}
                    </h2>

                    <p className="text-xs text-[#89938F]">
                      {t.availableSlots}
                    </p>

                  </div>

                </div>


                <div className="space-y-5">

                  {timeSlots.map(
                    (group) => (

                      <div key={group.group}>

                        <p className="text-xs font-semibold uppercase tracking-wide text-[#89938F] mb-2">
                          {t[group.group as "morning" | "afternoon" | "evening"]}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                          {group.slots.map(
                            (slot) => {

                              const active =
                                selectedTime ===
                                slot;

                              return (
                                <button
                                  type="button"
                                  key={slot}
                                  onClick={() =>
                                    setSelectedTime(
                                      slot
                                    )
                                  }
                                  className={`rounded-lg border py-3 px-2 text-sm font-medium cursor-pointer ${
                                    active
                                      ? "border-[#1B7A6B] bg-[#1B7A6B] text-white"
                                      : "border-[#DDE5E2] text-[#43524E] hover:border-[#1B7A6B] hover:text-[#1B7A6B]"
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            }
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* CONSULTATION MODE */}

              <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-6">

                <h2 className="font-semibold text-lg text-[#10201D] mb-4">
                  {t.mode}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setMode("in-person")
                    }
                    className={`rounded-xl border p-4 flex items-center gap-3 text-left cursor-pointer ${
                      mode === "in-person"
                        ? "border-[#1B7A6B] bg-[#EAF6F3]"
                        : "border-[#E1E5E3] hover:border-[#B8CEC8]"
                    }`}
                  >

                    <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center">

                      <Building2 className="w-5 h-5 text-[#1B7A6B]" />

                    </div>

                    <div>

                      <p className="font-semibold text-sm text-[#10201D]">
                        {t.inPerson}
                      </p>

                      <p className="text-xs text-[#7B8783] mt-1">
                        {doctor.hospital}
                      </p>

                    </div>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setMode("video")
                    }
                    className={`rounded-xl border p-4 flex items-center gap-3 text-left cursor-pointer ${
                      mode === "video"
                        ? "border-[#1B7A6B] bg-[#EAF6F3]"
                        : "border-[#E1E5E3] hover:border-[#B8CEC8]"
                    }`}
                  >

                    <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center">

                      <Video className="w-5 h-5 text-[#1B7A6B]" />

                    </div>

                    <div>

                      <p className="font-semibold text-sm text-[#10201D]">
                        {t.videoConsultation}
                      </p>

                      <p className="text-xs text-[#7B8783] mt-1">
                        Join securely online
                      </p>

                    </div>

                  </button>

                </div>

              </div>

            </div>


            {/* =====================================================
                RIGHT SUMMARY
            ===================================================== */}

            <aside className="lg:sticky lg:top-5 h-fit">

              <div className="bg-white rounded-2xl border border-[#E1E5E3] p-5 sm:p-6">

                <h2 className="font-semibold text-lg text-[#10201D]">
                  {t.appointmentSummary}
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="flex items-start gap-3">

                    <Stethoscope className="w-5 h-5 text-[#1B7A6B] mt-0.5" />

                    <div>

                      <p className="text-xs text-[#89938F]">
                        {t.doctor}
                      </p>

                      <p className="font-medium text-sm text-[#10201D] mt-1">
                        {doctor.name}
                      </p>

                    </div>

                  </div>


                  <div className="flex items-start gap-3">

                    <MapPin className="w-5 h-5 text-[#1B7A6B] mt-0.5" />

                    <div>

                      <p className="text-xs text-[#89938F]">
                        {t.location}
                      </p>

                      <p className="font-medium text-sm text-[#10201D] mt-1">
                        {mode === "video"
                          ? "Online Consultation"
                          : doctor.hospital}
                      </p>

                    </div>

                  </div>


                  <div className="flex items-start gap-3">

                    <CalendarDays className="w-5 h-5 text-[#1B7A6B] mt-0.5" />

                    <div>

                      <p className="text-xs text-[#89938F]">
                        {t.selectedDate}
                      </p>

                      <p className="font-medium text-sm text-[#10201D] mt-1">
                        {selectedDate ||
                          t.chooseDate}
                      </p>

                    </div>

                  </div>


                  <div className="flex items-start gap-3">

                    <Clock3 className="w-5 h-5 text-[#1B7A6B] mt-0.5" />

                    <div>

                      <p className="text-xs text-[#89938F]">
                        {t.selectedTime}
                      </p>

                      <p className="font-medium text-sm text-[#10201D] mt-1">
                        {selectedTime ||
                          t.chooseTime}
                      </p>

                    </div>

                  </div>

                </div>


                <div className="border-t border-[#E8ECEA] mt-6 pt-5 flex items-center justify-between">

                  <div>

                    <p className="text-xs text-[#89938F]">
                      {t.consultationFee}
                    </p>

                    <p className="font-bold text-xl text-[#10201D] mt-1">
                      {doctor.fee}
                    </p>

                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#1B7A6B] font-medium">

                    <ShieldCheck className="w-4 h-4" />

                    Secure

                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    confirmAppointment
                  }
                  className="w-full mt-6 rounded-xl bg-[#1B7A6B] text-white py-4 font-semibold flex items-center justify-center gap-2 hover:bg-[#166358] cursor-pointer"
                >

                  {t.confirm}

                  <ArrowRight className="w-5 h-5" />

                </button>

                <p className="text-center text-xs text-[#89938F] mt-3">
                  {t.secure}
                </p>

              </div>

            </aside>

          </div>

        </div>

      </section>

    </main>
  );
}