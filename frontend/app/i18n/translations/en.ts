const en = {
  // Splash
  splash: {
    tagline: "Clinical Studio",
  },
  // GetStarted
  getStarted: {
    badge: "Empowering Clinical Decisions",
    headline: "Health Analysis,\nRedefined.",
    subtitle: "Get clear, AI-powered insights from your medical reports and scans instantly.",
    features: {
      secureData: "Secure Data",
      fastResults: "Fast Results",
      aiPowered: "AI Powered",
      community: "Community",
    },
    cta: "Get Started",
    terms: "By continuing, you agree to our Terms of Service",
  },
  // Language Selection
  languageSelection: {
    title: "Select Language",
    subtitle: "Choose your preferred language for a better clinical experience.",
    finish: "Finish Setup",
  },
  // Auth (landing page auth step)
  auth: {
    welcomeBack: "Welcome",
    subtitle: "Continue with Google to access your clinical dashboard secure data.",
    signInGoogle: "Sign in with Google",
    or: "OR",
    mailLogin: "Mail Login",
  },
  // Navbar
  navbar: {
    home: "Home",
    checkup: "Scan",
    diet: "Diet",
    library: "Library",
    reports: "Reports",
    notSignedIn: "Not signed in",
  },
  // Agent FAB
  agent: {
    title: "MediSeen Agent",
    activeModel: "Active Model",
    greeting: "Hello! I am your MediSeen AI Assistant. How can I help you today?",
    analyzing: "I am analyzing your query with our clinical model...",
    placeholder: "Ask me anything...",
  },
  // Home page
  home: {
    badge: "Empowering Your Clinical Decisions",
    greeting: "Hello,",
    subtitle: "How can I help you today? I'm ready to analyze scans or answer questions.",
    whatDoYouNeed: "What do you need?",
    chooseTool: "Choose a tool to get started",
    viewAllTools: "View all tools",
    quickActions: {
      startDiagnosis: "Start Diagnosis",
      startDiagnosisDesc: "Instant AI analysis for your medical scans.",
      learnExplore: "Learn & Explore",
      learnExploreDesc: "Browse our medical education library.",
    },
    liveMetrics: "Live Metrics",
    connectedVia: "Connected via Bluetooth/Sync",
    syncDevice: "Sync Device",
    metrics: {
      heartRate: "Heart Rate",
      heartRateDesc: "Stable",
      oxygenLevel: "Oxygen Level",
      oxygenLevelDesc: "Healthy",
      dailySteps: "Daily Steps",
      dailyStepsDesc: "Goal: 10k",
      activityLogs: "Activity Logs",
      activityLogsDesc: "Exercise",
    },
  },
  // Login page
  login: {
    welcomeBack: "Welcome",
    subtitle: "Login to access the AI diagnostic platform",
    emailLabel: "Email Address",
    emailPlaceholder: "doctor@hospital.com",
    passwordLabel: "Password",
    signingIn: "Signing In...",
    signIn: "Sign In",
    newToMediseen: "New to Mediseen?",
    createAccount: "Create Account",
    errors: {
      emailPasswordRequired: "Email and password required",
      accountNotFound: "Account not found",
      incorrectPassword: "Incorrect password",
      invalidEmail: "Invalid email address",
      loginFailed: "Login failed. Please try again.",
      googleFailed: "Google sign-in failed. Please try again.",
    },
  },
  // Register page
  register: {
    createAccount: "Create Account",
    subtitle: "Join AI Platform",
    practitioner: "Practitioner",
    patient: "Patient",
    fullName: "Full Name",
    emailLabel: "Email Address",
    emailPlaceholder: "doctor@hospital.com",
    passwordLabel: "Password",
    creatingAccount: "Creating Account...",
    createAccountBtn: "Create Account",
    alreadyRegistered: "Already registered?",
    signIn: "Sign In",
    errors: {
      emailPasswordRequired: "Email and password required",
      nameRequired: "Full name is required",
      timedOut: "Request timed out. Please try again.",
    },
  },
  // Diagnose page
  diagnose: {
    badge: "Smart Assistant",
    title: "Health",
    titleHighlight: "Assistant",
    subtitle: "Upload your medical scan, and our assistant will help you understand it in seconds.",
    scanReport: "Scan Report",
    browseHistory: "Activity",
    camera: {
      alignFrame: "Align report within the frame",
      aiScanning: "AI Scanning Active",
    },
    steps: {
      currentStep: "Current Step",
      uploadScan: "Upload Scan",
      aiAnalysis: "AI Analysis",
      results: "Results",
    },
    waiting: {
      title: "Waiting for Your Scan",
      subtitle: "Fill in the details on the left to start your intelligent analysis.",
    },
    results: {
      badge: "Step 3: Analysis Results",
      title: "Your Health Insights",
      subtitle: "Discover what our AI found in your scan.",
      viewHeatmap: "View Heatmap",
      hideHeatmap: "Hide Heatmap",
      fullReport: "Full Report",
      hideReport: "Hide Report",
    },
    footer: "Clinical Decision Support System © 2026",
  },
  // Disease Info page
  diseaseInfo: {
    title: "Health",
    titleHighlight: "Library",
    subtitle: "Easy guides to help you understand common health conditions and what you can do about them.",
    pneumonia: {
      badge: "Breathing & Lungs",
      title: "Understanding\nPneumonia",
      description: "Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing.",
      symptoms: {
        title: "Key Symptoms",
        highFever: "High Fever",
        chestPain: "Chest Pain",
        shortBreath: "Short Breath",
      },
      howWeCheck: {
        title: "How we check",
        desc: "Our AI looks for specific clouding and patterns in the lungs to give you accurate results.",
      },
    },
    skinHealth: {
      title: "Skin Health",
      subtitle: "Comprehensive guide to common skin conditions",
      clinicalVisuals: "Clinical Visuals",
      viewDetails: "View Details",
      otherConditions: "Other Clinical Conditions",
    },
    overlay: {
      whatItFeels: "What it feels like",
      whyItHappens: "Why it happens",
      conditionTypes: "Condition Types",
      howToBetter: "How to feel better",
      disclaimer: "Clinical Awareness Guide • Consult specialists for diagnosis.",
      startDiagnosis: "Start Diagnosis",
    },
  },
  // Diet page
  diet: {
    title: "Your Health",
    titleHighlight: "& Nutrition",
    subtitle: "Actionable food, lifestyle, and habit plans to help you feel your best.",
  },
  // Communication page
  communication: {
    consultations: "Consultations",
    activeConsultant: "Active Consultant",
    placeholder: "Ask the AI...",
    send: "SEND",
    contacts: {
      aiBot: "AI Diagnostic Bot",
      aiBotLast: "I've updated the record...",
      radiologist: "Radiologist Dept",
      radiologistLast: "Standard protocol looks...",
      patient: "Patient #2918",
      patientLast: "Thank you for the help!",
    },
    initialMessages: {
      msg1: "Hello Sarah, I've reviewed the latest X-ray from patient #HACK-2024-001. AI results are ready.",
      msg2: "Thank you for the update. Should we proceed with the standard antibiotic protocol?",
      msg3: "Yes, based on the high confidence score (94%), amoxicillin is the recommended first-line treatment. Detailed guidelines are in the Education tab.",
      autoReply: "Acknowledged. I've updated the patient records with your notes.",
    },
  },
}

export default en
export type Translations = typeof en
