"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ShieldCheck,
  Mic,
  FileText,
  Lock,
  CheckCircle2,
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

type Translation = {
  title: string;
  subtitle: string;
  consentTitle: string;
  consentText: string;
  voiceTitle: string;
  voiceText: string;
  dataTitle: string;
  dataText: string;
  privacyTitle: string;
  privacyText: string;
  checkbox: string;
  continue: string;
  back: string;
  secure: string;
  required: string;
};

const translations: Record<LanguageKey, Translation> = {
  english: {
    title: "Your Consent",
    subtitle:
      "Please review and provide your consent before starting your health assessment.",
    consentTitle: "Health Information Consent",
    consentText:
      "MediKiosk will collect the information you provide during your case-taking session to create a structured health summary for the doctor.",
    voiceTitle: "Voice & Language",
    voiceText:
      "If you use voice input, your speech may be processed to convert it into text in your selected language.",
    dataTitle: "Your Health Data",
    dataText:
      "Your information is used only for this healthcare interaction and can be reviewed before being shared with a doctor.",
    privacyTitle: "Privacy & Security",
    privacyText:
      "Your information is handled securely. You remain in control of what is shared with healthcare professionals.",
    checkbox:
      "I understand and consent to MediKiosk collecting and processing the information I provide for this healthcare interaction.",
    continue: "I Agree & Continue",
    back: "Back",
    secure: "Secure & Consent-Based",
    required: "Please provide your consent to continue.",
  },

  hindi: {
    title: "आपकी सहमति",
    subtitle:
      "अपना स्वास्थ्य मूल्यांकन शुरू करने से पहले कृपया जानकारी पढ़ें और अपनी सहमति दें।",
    consentTitle: "स्वास्थ्य जानकारी की सहमति",
    consentText:
      "MediKiosk आपकी केस-टेकिंग के दौरान दी गई जानकारी एकत्र करेगा और डॉक्टर के लिए एक व्यवस्थित स्वास्थ्य सारांश तैयार करेगा।",
    voiceTitle: "आवाज़ और भाषा",
    voiceText:
      "यदि आप वॉइस इनपुट का उपयोग करते हैं, तो आपकी आवाज़ को आपकी चुनी हुई भाषा में टेक्स्ट में बदला जा सकता है।",
    dataTitle: "आपका स्वास्थ्य डेटा",
    dataText:
      "आपकी जानकारी का उपयोग इस स्वास्थ्य सेवा प्रक्रिया के लिए किया जाएगा और डॉक्टर के साथ साझा करने से पहले इसकी समीक्षा की जा सकती है।",
    privacyTitle: "गोपनीयता और सुरक्षा",
    privacyText:
      "आपकी जानकारी सुरक्षित तरीके से संभाली जाती है। डॉक्टर के साथ क्या साझा करना है, इसका नियंत्रण आपके पास रहता है।",
    checkbox:
      "मैं समझता/समझती हूँ और इस स्वास्थ्य सेवा प्रक्रिया के लिए MediKiosk को मेरी दी गई जानकारी एकत्र और प्रोसेस करने की सहमति देता/देती हूँ।",
    continue: "सहमति दें और आगे बढ़ें",
    back: "वापस",
    secure: "सुरक्षित और सहमति-आधारित",
    required: "आगे बढ़ने के लिए कृपया अपनी सहमति दें।",
  },

  marathi: {
    title: "तुमची संमती",
    subtitle:
      "तुमचे आरोग्य मूल्यांकन सुरू करण्यापूर्वी कृपया माहिती वाचा आणि संमती द्या.",
    consentTitle: "आरोग्य माहितीची संमती",
    consentText:
      "MediKiosk केस-टेकिंग दरम्यान तुम्ही दिलेली माहिती गोळा करून डॉक्टरांसाठी संरचित आरोग्य सारांश तयार करेल.",
    voiceTitle: "आवाज आणि भाषा",
    voiceText:
      "तुम्ही व्हॉइस इनपुट वापरल्यास, तुमचा आवाज निवडलेल्या भाषेत मजकुरात रूपांतरित केला जाऊ शकतो.",
    dataTitle: "तुमचा आरोग्य डेटा",
    dataText:
      "तुमची माहिती या आरोग्य प्रक्रियेसाठी वापरली जाईल आणि डॉक्टरांसोबत शेअर करण्यापूर्वी तिचे पुनरावलोकन करता येईल.",
    privacyTitle: "गोपनीयता आणि सुरक्षा",
    privacyText:
      "तुमची माहिती सुरक्षितपणे हाताळली जाते. डॉक्टरांसोबत काय शेअर करायचे यावर तुमचे नियंत्रण राहते.",
    checkbox:
      "मला हे समजले आहे आणि या आरोग्य प्रक्रियेसाठी MediKiosk ला मी दिलेली माहिती गोळा व प्रक्रिया करण्यास मी संमती देतो/देते.",
    continue: "संमती द्या आणि पुढे जा",
    back: "मागे",
    secure: "सुरक्षित आणि संमती-आधारित",
    required: "पुढे जाण्यासाठी कृपया तुमची संमती द्या.",
  },

  bengali: {
    title: "আপনার সম্মতি",
    subtitle:
      "আপনার স্বাস্থ্য মূল্যায়ন শুরু করার আগে অনুগ্রহ করে তথ্য পড়ে সম্মতি দিন।",
    consentTitle: "স্বাস্থ্য তথ্যের সম্মতি",
    consentText:
      "MediKiosk কেস-টেকিংয়ের সময় আপনার দেওয়া তথ্য সংগ্রহ করে ডাক্তারের জন্য একটি কাঠামোবদ্ধ স্বাস্থ্য সারাংশ তৈরি করবে।",
    voiceTitle: "ভয়েস ও ভাষা",
    voiceText:
      "আপনি ভয়েস ইনপুট ব্যবহার করলে আপনার কথা নির্বাচিত ভাষায় টেক্সটে রূপান্তরিত হতে পারে।",
    dataTitle: "আপনার স্বাস্থ্য তথ্য",
    dataText:
      "আপনার তথ্য এই স্বাস্থ্যসেবা প্রক্রিয়ার জন্য ব্যবহার করা হবে এবং ডাক্তারের সাথে শেয়ার করার আগে পর্যালোচনা করা যাবে।",
    privacyTitle: "গোপনীয়তা ও নিরাপত্তা",
    privacyText:
      "আপনার তথ্য নিরাপদভাবে পরিচালনা করা হয়। স্বাস্থ্যকর্মীর সাথে কী শেয়ার করা হবে তার নিয়ন্ত্রণ আপনার কাছে থাকবে।",
    checkbox:
      "আমি বুঝেছি এবং এই স্বাস্থ্যসেবা প্রক্রিয়ার জন্য MediKiosk-কে আমার দেওয়া তথ্য সংগ্রহ ও প্রক্রিয়া করার সম্মতি দিচ্ছি।",
    continue: "সম্মতি দিয়ে এগিয়ে যান",
    back: "পিছনে",
    secure: "নিরাপদ ও সম্মতিভিত্তিক",
    required: "এগিয়ে যেতে অনুগ্রহ করে সম্মতি দিন।",
  },

  gujarati: {
    title: "તમારી સંમતિ",
    subtitle:
      "તમારું આરોગ્ય મૂલ્યાંકન શરૂ કરતા પહેલાં કૃપા કરીને માહિતી વાંચો અને સંમતિ આપો.",
    consentTitle: "આરોગ્ય માહિતી માટે સંમતિ",
    consentText:
      "MediKiosk કેસ-ટેકિંગ દરમિયાન તમે આપેલી માહિતી એકત્રિત કરીને ડૉક્ટર માટે સંરચિત આરોગ્ય સારાંશ તૈયાર કરશે.",
    voiceTitle: "વૉઇસ અને ભાષા",
    voiceText:
      "જો તમે વૉઇસ ઇનપુટનો ઉપયોગ કરો છો, તો તમારો અવાજ પસંદ કરેલી ભાષામાં ટેક્સ્ટમાં રૂપાંતરિત થઈ શકે છે.",
    dataTitle: "તમારો આરોગ્ય ડેટા",
    dataText:
      "તમારી માહિતી આ આરોગ્ય પ્રક્રિયા માટે ઉપયોગમાં લેવામાં આવશે અને ડૉક્ટર સાથે શેર કરતા પહેલાં તેની સમીક્ષા કરી શકાશે.",
    privacyTitle: "ગોપનીયતા અને સુરક્ષા",
    privacyText:
      "તમારી માહિતી સુરક્ષિત રીતે સંભાળવામાં આવે છે. ડૉક્ટર સાથે શું શેર કરવું તે તમારા નિયંત્રણમાં રહેશે.",
    checkbox:
      "હું સમજું છું અને આ આરોગ્ય પ્રક્રિયા માટે MediKiosk ને મારી આપેલી માહિતી એકત્રિત અને પ્રક્રિયા કરવાની સંમતિ આપું છું.",
    continue: "સંમતિ આપો અને આગળ વધો",
    back: "પાછા",
    secure: "સુરક્ષિત અને સંમતિ આધારિત",
    required: "આગળ વધવા માટે કૃપા કરીને તમારી સંમતિ આપો.",
  },

  tamil: {
    title: "உங்கள் சம்மதம்",
    subtitle:
      "உங்கள் சுகாதார மதிப்பீட்டைத் தொடங்குவதற்கு முன் தகவலைப் படித்து சம்மதம் அளிக்கவும்.",
    consentTitle: "சுகாதார தகவல் சம்மதம்",
    consentText:
      "MediKiosk உங்கள் கேஸ்-டேக்கிங் அமர்வின் போது நீங்கள் வழங்கும் தகவல்களை சேகரித்து மருத்துவருக்கான சுகாதார சுருக்கத்தை உருவாக்கும்.",
    voiceTitle: "குரல் மற்றும் மொழி",
    voiceText:
      "நீங்கள் குரல் உள்ளீட்டைப் பயன்படுத்தினால், உங்கள் பேச்சு நீங்கள் தேர்ந்தெடுத்த மொழியில் உரையாக மாற்றப்படலாம்.",
    dataTitle: "உங்கள் சுகாதார தரவு",
    dataText:
      "உங்கள் தகவல் இந்த சுகாதார செயல்முறைக்காக மட்டுமே பயன்படுத்தப்படும் மற்றும் மருத்துவருடன் பகிர்வதற்கு முன் மதிப்பாய்வு செய்யலாம்.",
    privacyTitle: "தனியுரிமை மற்றும் பாதுகாப்பு",
    privacyText:
      "உங்கள் தகவல் பாதுகாப்பாக கையாளப்படும். மருத்துவருடன் எதைப் பகிர வேண்டும் என்பதை நீங்கள் கட்டுப்படுத்தலாம்.",
    checkbox:
      "நான் புரிந்துகொண்டேன் மற்றும் இந்த சுகாதார செயல்முறைக்காக MediKiosk எனது தகவல்களை சேகரித்து செயலாக்க சம்மதிக்கிறேன்.",
    continue: "சம்மதித்து தொடரவும்",
    back: "பின்செல்",
    secure: "பாதுகாப்பான மற்றும் சம்மத அடிப்படையிலான",
    required: "தொடர உங்கள் சம்மதத்தை வழங்கவும்.",
  },

  telugu: {
    title: "మీ సమ్మతి",
    subtitle:
      "మీ ఆరోగ్య అంచనాను ప్రారంభించే ముందు సమాచారాన్ని చదివి సమ్మతి ఇవ్వండి.",
    consentTitle: "ఆరోగ్య సమాచార సమ్మతి",
    consentText:
      "MediKiosk కేస్-టేకింగ్ సమయంలో మీరు అందించే సమాచారాన్ని సేకరించి వైద్యుడి కోసం ఆరోగ్య సారాంశాన్ని రూపొందిస్తుంది.",
    voiceTitle: "వాయిస్ & భాష",
    voiceText:
      "మీరు వాయిస్ ఇన్‌పుట్ ఉపయోగిస్తే, మీ మాటలు మీరు ఎంచుకున్న భాషలో టెక్స్ట్‌గా మార్చబడవచ్చు.",
    dataTitle: "మీ ఆరోగ్య డేటా",
    dataText:
      "మీ సమాచారం ఈ ఆరోగ్య ప్రక్రియ కోసం ఉపయోగించబడుతుంది మరియు వైద్యుడితో పంచుకునే ముందు సమీక్షించవచ్చు.",
    privacyTitle: "గోప్యత & భద్రత",
    privacyText:
      "మీ సమాచారం సురక్షితంగా నిర్వహించబడుతుంది. వైద్యుడితో ఏమి పంచుకోవాలో మీరు నియంత్రించవచ్చు.",
    checkbox:
      "నేను అర్థం చేసుకున్నాను మరియు ఈ ఆరోగ్య ప్రక్రియ కోసం MediKiosk నా సమాచారాన్ని సేకరించి ప్రాసెస్ చేయడానికి సమ్మతిస్తున్నాను.",
    continue: "సమ్మతించి కొనసాగండి",
    back: "వెనుకకు",
    secure: "సురక్షితమైన మరియు సమ్మతి ఆధారిత",
    required: "కొనసాగడానికి దయచేసి మీ సమ్మతిని ఇవ్వండి.",
  },

  kannada: {
    title: "ನಿಮ್ಮ ಸಮ್ಮತಿ",
    subtitle:
      "ನಿಮ್ಮ ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನವನ್ನು ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಮಾಹಿತಿಯನ್ನು ಓದಿ ಸಮ್ಮತಿ ನೀಡಿ.",
    consentTitle: "ಆರೋಗ್ಯ ಮಾಹಿತಿ ಸಮ್ಮತಿ",
    consentText:
      "MediKiosk ಕೇಸ್-ಟೇಕಿಂಗ್ ಸಮಯದಲ್ಲಿ ನೀವು ನೀಡುವ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸಿ ವೈದ್ಯರಿಗಾಗಿ ಆರೋಗ್ಯ ಸಾರಾಂಶವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    voiceTitle: "ಧ್ವನಿ ಮತ್ತು ಭಾಷೆ",
    voiceText:
      "ನೀವು ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬಳಸಿದರೆ, ನಿಮ್ಮ ಮಾತನ್ನು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಬಹುದು.",
    dataTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಡೇಟಾ",
    dataText:
      "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಈ ಆರೋಗ್ಯ ಪ್ರಕ್ರಿಯೆಗಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ ಮತ್ತು ವೈದ್ಯರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲು ಪರಿಶೀಲಿಸಬಹುದು.",
    privacyTitle: "ಗೌಪ್ಯತೆ ಮತ್ತು ಭದ್ರತೆ",
    privacyText:
      "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ. ವೈದ್ಯರೊಂದಿಗೆ ಏನು ಹಂಚಿಕೊಳ್ಳಬೇಕು ಎಂಬುದನ್ನು ನೀವು ನಿಯಂತ್ರಿಸಬಹುದು.",
    checkbox:
      "ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಈ ಆರೋಗ್ಯ ಪ್ರಕ್ರಿಯೆಗಾಗಿ MediKiosk ಗೆ ನಾನು ನೀಡಿದ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಮ್ಮತಿಸುತ್ತೇನೆ.",
    continue: "ಸಮ್ಮತಿಸಿ ಮುಂದುವರಿಸಿ",
    back: "ಹಿಂದಕ್ಕೆ",
    secure: "ಸುರಕ್ಷಿತ ಮತ್ತು ಸಮ್ಮತಿ ಆಧಾರಿತ",
    required: "ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮ್ಮತಿ ನೀಡಿ.",
  },

  malayalam: {
    title: "നിങ്ങളുടെ സമ്മതം",
    subtitle:
      "ആരോഗ്യ വിലയിരുത്തൽ ആരംഭിക്കുന്നതിന് മുമ്പ് വിവരങ്ങൾ വായിച്ച് സമ്മതം നൽകുക.",
    consentTitle: "ആരോഗ്യ വിവര സമ്മതം",
    consentText:
      "MediKiosk കേസ്-ടേക്കിംഗ് സമയത്ത് നിങ്ങൾ നൽകുന്ന വിവരങ്ങൾ ശേഖരിച്ച് ഡോക്ടർക്കായി ആരോഗ്യ സംഗ്രഹം തയ്യാറാക്കും.",
    voiceTitle: "വോയ്സ് & ഭാഷ",
    voiceText:
      "നിങ്ങൾ വോയ്സ് ഇൻപുട്ട് ഉപയോഗിക്കുകയാണെങ്കിൽ, നിങ്ങളുടെ സംസാരത്തെ തിരഞ്ഞെടുത്ത ഭാഷയിൽ ടെക്സ്റ്റാക്കി മാറ്റാം.",
    dataTitle: "നിങ്ങളുടെ ആരോഗ്യ ഡാറ്റ",
    dataText:
      "നിങ്ങളുടെ വിവരങ്ങൾ ഈ ആരോഗ്യ സേവനത്തിനായി ഉപയോഗിക്കും. ഡോക്ടറുമായി പങ്കിടുന്നതിന് മുമ്പ് അത് പരിശോധിക്കാം.",
    privacyTitle: "സ്വകാര്യത & സുരക്ഷ",
    privacyText:
      "നിങ്ങളുടെ വിവരങ്ങൾ സുരക്ഷിതമായി കൈകാര്യം ചെയ്യും. ഡോക്ടറുമായി എന്ത് പങ്കിടണമെന്ന് നിങ്ങൾക്ക് നിയന്ത്രിക്കാം.",
    checkbox:
      "എനിക്ക് മനസ്സിലായി, ഈ ആരോഗ്യ സേവനത്തിനായി MediKiosk എന്റെ വിവരങ്ങൾ ശേഖരിക്കുകയും പ്രോസസ്സ് ചെയ്യുകയും ചെയ്യുന്നതിന് ഞാൻ സമ്മതിക്കുന്നു.",
    continue: "സമ്മതിച്ച് തുടരുക",
    back: "തിരികെ",
    secure: "സുരക്ഷിതവും സമ്മതാധിഷ്ഠിതവും",
    required: "തുടരുന്നതിന് ദയവായി നിങ്ങളുടെ സമ്മതം നൽകുക.",
  },

  punjabi: {
    title: "ਤੁਹਾਡੀ ਸਹਿਮਤੀ",
    subtitle:
      "ਆਪਣਾ ਸਿਹਤ ਮੁਲਾਂਕਣ ਸ਼ੁਰੂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਕਿਰਪਾ ਕਰਕੇ ਜਾਣਕਾਰੀ ਪੜ੍ਹੋ ਅਤੇ ਸਹਿਮਤੀ ਦਿਓ।",
    consentTitle: "ਸਿਹਤ ਜਾਣਕਾਰੀ ਲਈ ਸਹਿਮਤੀ",
    consentText:
      "MediKiosk ਕੇਸ-ਟੇਕਿੰਗ ਦੌਰਾਨ ਤੁਹਾਡੇ ਵੱਲੋਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰਕੇ ਡਾਕਟਰ ਲਈ ਸਿਹਤ ਸਾਰ ਤਿਆਰ ਕਰੇਗਾ।",
    voiceTitle: "ਆਵਾਜ਼ ਅਤੇ ਭਾਸ਼ਾ",
    voiceText:
      "ਜੇ ਤੁਸੀਂ ਵੌਇਸ ਇਨਪੁਟ ਵਰਤਦੇ ਹੋ, ਤਾਂ ਤੁਹਾਡੀ ਗੱਲ ਨੂੰ ਚੁਣੀ ਹੋਈ ਭਾਸ਼ਾ ਵਿੱਚ ਟੈਕਸਟ ਵਿੱਚ ਬਦਲਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
    dataTitle: "ਤੁਹਾਡਾ ਸਿਹਤ ਡਾਟਾ",
    dataText:
      "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਇਸ ਸਿਹਤ ਪ੍ਰਕਿਰਿਆ ਲਈ ਵਰਤੀ ਜਾਵੇਗੀ ਅਤੇ ਡਾਕਟਰ ਨਾਲ ਸਾਂਝੀ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇਸਦੀ ਸਮੀਖਿਆ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।",
    privacyTitle: "ਪਰਾਈਵੇਸੀ ਅਤੇ ਸੁਰੱਖਿਆ",
    privacyText:
      "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਨੂੰ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸੰਭਾਲਿਆ ਜਾਂਦਾ ਹੈ। ਡਾਕਟਰ ਨਾਲ ਕੀ ਸਾਂਝਾ ਕਰਨਾ ਹੈ, ਇਸਦਾ ਕੰਟਰੋਲ ਤੁਹਾਡੇ ਕੋਲ ਰਹਿੰਦਾ ਹੈ।",
    checkbox:
      "ਮੈਂ ਸਮਝਦਾ/ਸਮਝਦੀ ਹਾਂ ਅਤੇ ਇਸ ਸਿਹਤ ਪ੍ਰਕਿਰਿਆ ਲਈ MediKiosk ਨੂੰ ਮੇਰੀ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਅਤੇ ਪ੍ਰੋਸੈਸ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ।",
    continue: "ਸਹਿਮਤੀ ਦਿਓ ਅਤੇ ਜਾਰੀ ਰੱਖੋ",
    back: "ਵਾਪਸ",
    secure: "ਸੁਰੱਖਿਅਤ ਅਤੇ ਸਹਿਮਤੀ-ਅਧਾਰਿਤ",
    required: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਸਹਿਮਤੀ ਦਿਓ।",
  },
};

export default function PatientConsentPage() {
  const router = useRouter();

  const [language, setLanguage] =
    useState<LanguageKey>("english");

  const [consentGiven, setConsentGiven] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const savedLanguage =
      localStorage.getItem(
        "medikiosk-language"
      ) as LanguageKey | null;

    if (
      savedLanguage &&
      Object.prototype.hasOwnProperty.call(
        translations,
        savedLanguage
      )
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = translations[language];

  function handleContinue() {
    if (!consentGiven) {
      setError(t.required);
      return;
    }

    localStorage.setItem(
      "medikiosk-consent",
      JSON.stringify({
        given: true,
        language: language,
        timestamp: new Date().toISOString(),
      })
    );

    // IMPORTANT:
    // Consent ke baad directly AI Interview par jao
    router.push("/patient/intake");
  }

  return (
    <main className="min-h-screen bg-[#F6F7F5] flex flex-col">

      {/* HEADER */}
      <header className="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6 flex items-center justify-between gap-4">

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

        <Link
          href="/patient/language"
          className="inline-flex items-center gap-2 text-[#5C6B67] hover:text-[#10201D] text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </Link>

      </header>


      {/* MAIN */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-12">

        <div className="w-full max-w-4xl">

          {/* TITLE */}
          <div className="text-center mb-7 sm:mb-9">

            <div className="w-14 h-14 rounded-xl bg-[#E6F2EF] flex items-center justify-center mx-auto mb-4">

              <ShieldCheck
                className="w-7 h-7 text-[#1B7A6B]"
                strokeWidth={2}
              />

            </div>

            <h1 className="font-[family-name:var(--font-heading)] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#10201D]">
              {t.title}
            </h1>

            <p className="mt-2 text-[#5C6B67] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>

          </div>


          {/* CONSENT CARD */}
          <div className="bg-white rounded-xl border border-[#E1E5E3] p-5 sm:p-7 lg:p-8">

            <div className="mb-6">

              <h2 className="font-semibold text-[#10201D] text-lg sm:text-xl">
                {t.consentTitle}
              </h2>

              <p className="mt-2 text-sm sm:text-base text-[#66736F] leading-relaxed">
                {t.consentText}
              </p>

            </div>


            {/* INFORMATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* VOICE */}
              <div className="rounded-xl border border-[#E1E5E3] bg-[#FAFCFB] p-4 sm:p-5">

                <div className="w-10 h-10 rounded-lg bg-[#E6F2EF] flex items-center justify-center mb-4">

                  <Mic
                    className="w-5 h-5 text-[#1B7A6B]"
                    strokeWidth={2}
                  />

                </div>

                <h3 className="font-semibold text-[#10201D]">
                  {t.voiceTitle}
                </h3>

                <p className="mt-2 text-sm text-[#6B7874] leading-relaxed">
                  {t.voiceText}
                </p>

              </div>


              {/* DATA */}
              <div className="rounded-xl border border-[#E1E5E3] bg-[#FAFCFB] p-4 sm:p-5">

                <div className="w-10 h-10 rounded-lg bg-[#E6F2EF] flex items-center justify-center mb-4">

                  <FileText
                    className="w-5 h-5 text-[#1B7A6B]"
                    strokeWidth={2}
                  />

                </div>

                <h3 className="font-semibold text-[#10201D]">
                  {t.dataTitle}
                </h3>

                <p className="mt-2 text-sm text-[#6B7874] leading-relaxed">
                  {t.dataText}
                </p>

              </div>


              {/* PRIVACY */}
              <div className="rounded-xl border border-[#E1E5E3] bg-[#FAFCFB] p-4 sm:p-5">

                <div className="w-10 h-10 rounded-lg bg-[#E6F2EF] flex items-center justify-center mb-4">

                  <Lock
                    className="w-5 h-5 text-[#1B7A6B]"
                    strokeWidth={2}
                  />

                </div>

                <h3 className="font-semibold text-[#10201D]">
                  {t.privacyTitle}
                </h3>

                <p className="mt-2 text-sm text-[#6B7874] leading-relaxed">
                  {t.privacyText}
                </p>

              </div>

            </div>


            {/* CHECKBOX */}
            <div className="mt-7 pt-6 border-t border-[#E8EBE9]">

              <button
                type="button"
                onClick={() => {
                  setConsentGiven(!consentGiven);
                  setError("");
                }}
                className="w-full text-left cursor-pointer"
              >

                <div
                  className={`flex items-start gap-3 rounded-xl border p-4 sm:p-5 transition-all ${
                    consentGiven
                      ? "border-[#1B7A6B] bg-[#EAF6F3]"
                      : "border-[#E1E5E3] bg-white hover:border-[#A9C9C1]"
                  }`}
                >

                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      consentGiven
                        ? "bg-[#1B7A6B] border-[#1B7A6B]"
                        : "border-[#B8C2BE] bg-white"
                    }`}
                  >

                    {consentGiven && (
                      <CheckCircle2
                        className="w-4 h-4 text-white"
                        strokeWidth={3}
                      />
                    )}

                  </div>

                  <p className="text-sm sm:text-base text-[#34423E] leading-relaxed">
                    {t.checkbox}
                  </p>

                </div>

              </button>


              {error && (
                <p className="mt-3 text-sm text-red-600">
                  {error}
                </p>
              )}

            </div>


            {/* CONTINUE BUTTON */}
            <div className="mt-6">

              <button
                type="button"
                onClick={handleContinue}
                className="w-full bg-[#1B7A6B] text-white rounded-lg py-3.5 text-base font-medium hover:bg-[#166358] transition-colors cursor-pointer"
              >
                {t.continue}
              </button>

            </div>

          </div>


          {/* FOOTER */}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs sm:text-sm text-[#7B8783]">

            <ShieldCheck
              className="w-4 h-4 text-[#1B7A6B]"
            />

            <span>
              {t.secure}
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}