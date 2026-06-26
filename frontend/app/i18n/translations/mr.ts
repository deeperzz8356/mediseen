import en from "./en"

const mr = {
  ...en,
  splash: { tagline: "आरोग्य स्टुडिओ" },
  getStarted: {
    ...en.getStarted,
    badge: "आरोग्य निर्णयांना बळ देणे",
    headline: "आरोग्य विश्लेषण,\nनव्या रूपात.",
    subtitle: "तुमच्या आरोग्य अहवालांमधून आणि स्कॅनमधून त्वरित स्पष्ट, AI-आधारित अंतर्दृष्टी मिळवा.",
    cta: "सुरू करा",
    terms: "पुढे सुरू ठेवल्यास, तुम्ही आमच्या सेवा अटींना सहमती देता",
  },
  languageSelection: {
    ...en.languageSelection,
    title: "भाषा निवडा",
    subtitle: "अधिक चांगल्या आरोग्य अनुभवासाठी तुमची पसंतीची भाषा निवडा.",
    finish: "सेटअप पूर्ण करा",
  },
  onboarding: {
    ...en.onboarding,
    languageSelector: {
      title: "भाषा निवडा",
      subtitle: "अ‍ॅप इंटरफेससाठी तुमची पसंतीची भाषा निवडा.",
      back: "मागे",
      confirm: "भाषा निवडा",
    },
    notification: {
      title: "तुमच्या<br /> <span className='text-violet-500'>आरोग्यावर</span> लक्ष ठेवा",
      descriptionRuntime: "वेळेवर आरोग्य आठवणी आणि सूचना मिळवण्यासाठी नोटिफिकेशन्स सुरू करा.",
      descriptionRelaxed: "तुम्हाला ट्रॅकवर ठेवण्यासाठी आम्ही उपयुक्त आरोग्य आठवणी पाठवू.",
      skip: "वगळा",
      back: "मागे",
      allowRuntime: "नोटिफिकेशन्सना परवानगी द्या",
      allowRelaxed: "सुरू ठेवा",
      reasons: {
        medicineReminders: { title: "औषध आठवणी", desc: "वेळेवर आठवणींसह कोणताही डोस चुकवू नका" },
        aiHealthAlerts: { title: "AI आरोग्य सूचना", desc: "महत्त्वाच्या आरोग्य अंतर्दृष्टींबद्दल सूचित राहा" },
        dailyHealthTips: { title: "दैनिक आरोग्य टिप्स", desc: "तुमचे आरोग्य सुधारण्यासाठी छोटे, उपयुक्त सल्ले" },
      },
    },
    slides: {
      skip: "वगळा",
      next: "पुढे",
      getStarted: "सुरू करा",
      cards: {
        aiDetection: {
          title: "AI रोग शोध",
          subtitle: "क्षणात आरोग्य माहिती",
          description: "कोणताही आरोग्य स्कॅन किंवा अहवाल अपलोड करा आणि आमचा प्रगत AI तो काही सेकंदांत विश्लेषित करतो. स्पष्ट, सहज समजणारे विश्लेषण आणि विश्वास गुण मिळवा.",
          features: ["छातीच्या एक्स-रेचे विश्लेषण", "त्वचारोग शोध", "98% अचूकता"],
        },
        diet: {
          title: "आहार शिफारसी",
          subtitle: "तुमच्यासाठी अनुरूप पोषण",
          description: "तुमची विश्लेषण झालेली स्थिती, वय आणि आरोग्य उद्दिष्टांवर आधारित वैयक्तिक आहार योजना मिळवा. काय खावे आणि काय टाळावे हे अचूकपणे जाणून घ्या.",
          features: ["स्थितीनिहाय जेवण योजना", "मॅक्रो ट्रॅकिंग", "अन्न बदलण्याच्या सूचना"],
        },
        reports: {
          title: "आरोग्य अहवाल आणि ट्रॅकिंग",
          toolsTitle: "सर्व साधने",
          toolsSubtitle: "प्रोजेक्ट जे काही करू शकतो, ते सर्व एकाच ठिकाणी.",
          tools: {
            dietSupport: {
              title: "आहार सहाय्य",
              desc: "आहार मार्गदर्शन आणि वेलनेस योजना पहा.",
            },
            chatAssistant: {
              title: "चॅट सहाय्यक",
              desc: "प्रोजेक्ट सहायकाशी बोला आणि जलद मदत मिळवा.",
            },
            accountSettings: {
              title: "खाते सेटिंग्ज",
              desc: "प्रोफाइल, भाषा आणि अॅप प्राधान्ये अपडेट करा.",
            },
          },
          subtitle: "तुमचे आरोग्य, दृश्यमान",
          description: "पावले, झोप, कॅलरी आणि हृदयगती ट्रॅक करण्यासाठी Google Health Connect सह सिंक करा. डॉक्टरांसोबत शेअर करण्यासाठी तपशीलवार PDF अहवाल तयार करा.",
          features: ["Health Connect सिंक", "दृश्य चार्ट", "शेअर करण्यायोग्य PDF अहवाल"],
        },
        assistant: {
          title: "AI आरोग्य सहाय्यक",
          subtitle: "कधीही, काहीही विचारा",
          description: "अलीकडील आरोग्य ज्ञानाने समर्थित आमच्या AI आरोग्य सल्लागाराशी चॅट करा. तुमच्या विश्लेषण आणि उपचार पर्यायांबद्दल सविस्तर स्पष्टीकरण मिळवा.",
          features: ["२४/७ आरोग्य मार्गदर्शन", "बहुभाषिक समर्थन", "पुराव्यावर आधारित उत्तरे"],
        },
      },
    },
  },
  navbar: {
    ...en.navbar,
    home: "मुख्यपृष्ठ",
    checkup: "स्कॅन",
    diet: "आहार",
    library: "लायब्ररी",
    profile: "प्रोफाइल",
    reports: "अहवाल",
    notSignedIn: "साइन इन केलेले नाही",
  },
  agent: {
    ...en.agent,
    title: "MediSeen एजंट",
    greeting: "नमस्कार! मी तुमचा MediSeen AI सहाय्यक आहे. आज मी कशी मदत करू शकतो?",
    analyzing: "मी तुमचा प्रश्न आरोग्य मॉडेलसह विश्लेषित करत आहे...",
    placeholder: "मला काहीही विचारा...",
  },
  home: {
    ...en.home,
    badge: "तुमच्या आरोग्य निर्णयांना बळ",
    greeting: "नमस्कार,",
    subtitle: "आज मी कशी मदत करू शकतो? मी स्कॅनचे विश्लेषण किंवा प्रश्नांची उत्तरे देण्यासाठी तयार आहे.",
    whatDoYouNeed: "काय हवे आहे?",
    chooseTool: "सुरुवात करण्यासाठी एक साधन निवडा",
    viewAllTools: "सर्व साधने पहा",
  },
  login: {
    ...en.login,
    welcomeBack: "पुन्हा स्वागत",
    subtitle: "AI डायग्नोस्टिक प्लॅटफॉर्मवर प्रवेश करण्यासाठी लॉगिन करा",
    signIn: "साइन इन",
  },
  register: {
    ...en.register,
    createAccount: "खाते तयार करा",
    subtitle: "AI प्लॅटफॉर्ममध्ये सहभागी व्हा",
  },
  diagnose: {
    ...en.diagnose,
    badge: "स्मार्ट सहाय्यक",
    title: "आरोग्य",
    titleHighlight: "सहाय्यक",
  },
  diseaseInfo: {
    ...en.diseaseInfo,
    title: "आरोग्य",
    titleHighlight: "लायब्ररी",
  },
  diet: {
    ...en.diet,
    title: "तुमचे आरोग्य",
    titleHighlight: "आणि पोषण",
  },
  communication: {
    ...en.communication,
    consultations: "सल्लामसलत",
    activeConsultant: "सक्रिय सल्लागार",
  },
}

export default mr