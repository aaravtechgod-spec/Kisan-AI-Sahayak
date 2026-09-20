export type Language = 'hi' | 'en';

export interface Translations {
  appName: string;
  appBadge: string;
  appSubtitle: string;
  langSwitchBtn: string;
  langName: string;
  
  // Navigation
  navDoctor: string;
  navSocial: string;
  navChat: string;
  navProfile: string;
  
  // Account / Top bar
  loginOrSwitch: string;
  helpline: string;
  prescription: string;
  copied: string;
  
  // Doctor tab
  oneTapAssistance: string;
  adviceAndRx: string;
  farmProfile: string;
  voiceAskTitle: string;
  voiceAskSubtitle: string;
  tapToSpeak: string;
  listening: string;
  speechNotSupported: string;
  queryPlaceholder: string;
  getAdviceBtn: string;
  preparingAdvice: string;
  quickTopicsTitle: string;
  categoryLabel: string;
  categoryAll: string;
  categoryPest: string;
  categoryWater: string;
  categorySchemes: string;
  problemLabel: string;
  speakOrTypeHint: string;
  helplineText: string;
  placeholderHeading: string;
  placeholderDesc: string;
  servicePestTitle: string;
  servicePestDesc: string;
  serviceWaterTitle: string;
  serviceWaterDesc: string;
  serviceSchemesTitle: string;
  serviceSchemesDesc: string;
  
  // 1-Tap Cards
  cardsHeaderTitle: string;
  cardsHeaderTag: string;
  cardsHeaderSubtitle: string;
  cardPestTitle: string;
  cardPestDesc: string;
  cardPestQuery: string;
  cardPestAudio: string;
  cardWaterTitle: string;
  cardWaterDesc: string;
  cardWaterQuery: string;
  cardWaterAudio: string;
  cardFertilizerTitle: string;
  cardFertilizerDesc: string;
  cardFertilizerQuery: string;
  cardFertilizerAudio: string;
  cardSchemeTitle: string;
  cardSchemeDesc: string;
  cardSchemeQuery: string;
  cardSchemeAudio: string;
  
  // Farm Profile Editor
  farmProfileTitle: string;
  activeFarmBadge: string;
  quickCropSelect: string;
  tapToSelect: string;
  currentCropLabel: string;
  currentCropPlaceholder: string;
  landAndSoilLabel: string;
  landAndSoilPlaceholder: string;
  irrigationLabel: string;
  irrigationPlaceholder: string;
  cropAgeLabel: string;
  cropAgeDays: string;
  
  // Advice Card
  listenAloud: string;
  stopAudio: string;
  shareWhatsApp: string;
  copyPrescription: string;
  kisanSummaryHeader: string;
  treatmentHeader: string;
  verdictShipTitle: string;
  verdictShipSubtitle: string;
  verdictFakeTitle: string;
  verdictFakeSubtitle: string;
  verdictCutTitle: string;
  verdictCutSubtitle: string;
  freeKisanHelpline: string;
  callCenterNumber: string;
  
  // Social Feed
  socialTitle: string;
  socialSubtitle: string;
  createPostBtn: string;
  allCropsFilter: string;
  filterWheat: string;
  filterCotton: string;
  filterMustard: string;
  filterPaddy: string;
  like: string;
  comment: string;
  share: string;
  directMessage: string;
  follow: string;
  following: string;
  addCommentPlaceholder: string;
  postCommentBtn: string;
  farmerStories: string;
  newPostModalTitle: string;
  cropTagLabel: string;
  captionLabel: string;
  captionPlaceholder: string;
  selectPhotoPreset: string;
  publishPostBtn: string;
  cancelBtn: string;
  
  // Direct Chat
  chatTitle: string;
  chatSubtitle: string;
  typeMessagePlaceholder: string;
  sendBtn: string;
  shareActiveRxBtn: string;
  onlineNow: string;
  selectConversation: string;
  advicePrescriptionCard: string;
  
  // Profile View
  farmerProfileTitle: string;
  postsCount: string;
  followersCount: string;
  followingCount: string;
  landSizeLabel: string;
  primaryCropsLabel: string;
  joinedDateLabel: string;
  switchAccountBtn: string;
  logoutBtn: string;
  myPostsTab: string;
  noPostsYet: string;
  
  // Auth Modal
  authModalTitle: string;
  authModalSubtitle: string;
  tabLogin: string;
  tabRegister: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  villageLabel: string;
  villagePlaceholder: string;
  acresLabel: string;
  acresPlaceholder: string;
  cropsLabel: string;
  cropsPlaceholder: string;
  loginActionBtn: string;
  registerActionBtn: string;
  quickSwitchAccountTitle: string;
  switchNow: string;
  loginError: string;
  registerError: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  hi: {
    appName: 'किसान AI सहायक',
    appBadge: 'डिजिटल चौपाल',
    appSubtitle: 'कृषि डॉक्टर • किसान सोशल फीड • डायरेक्ट चैट',
    langSwitchBtn: 'English',
    langName: 'हिन्दी',

    // Navigation
    navDoctor: 'कृषि डॉक्टर',
    navSocial: 'किसान चौपाल (Feed)',
    navChat: 'किसान चैट (DM)',
    navProfile: 'मेरी प्रोफाइल',

    // Account / Top bar
    loginOrSwitch: 'लॉगिन / बदलें ▾',
    helpline: '1800-180-1551',
    prescription: 'पर्ची',
    copied: 'कॉपी हो गया',

    // Doctor tab
    oneTapAssistance: '1-टैप समाधान',
    adviceAndRx: 'सलाह व पर्ची',
    farmProfile: 'खेत प्रोफाइल',
    voiceAskTitle: 'बोलकर सवाल पूछें (आवाज से इनपुट)',
    voiceAskSubtitle: 'अपनी भाषा में बोलें, एआई सुनकर जवाब देगा',
    tapToSpeak: 'माइक दबाएं',
    listening: 'सुन रहा है...',
    speechNotSupported: 'आपके ब्राउज़र में आवाज पहचान उपलब्ध नहीं है। कृपया लिखकर या कार्ड चुनकर पूछें।',
    queryPlaceholder: 'उदा. गेहूं की पत्तियां पीली पड़ रही हैं कौन सी दवा डालें? या कपास में सुंडी लग गई है क्या उपाय करें?',
    getAdviceBtn: 'डॉक्टर सलाह प्राप्त करें',
    preparingAdvice: 'कृषि डॉक्टर सलाह तैयार कर रहे हैं...',
    quickTopicsTitle: 'अक्सर पूछे जाने वाले सवाल (Quick Topics)',
    categoryLabel: 'सलाह का विषय चुनें (Category):',
    categoryAll: 'सभी विषय',
    categoryPest: 'कीट/रोग',
    categoryWater: 'खाद/पानी',
    categorySchemes: 'योजनाएं',
    problemLabel: 'फसल की समस्या या सवाल (Type or speak):',
    speakOrTypeHint: 'माइक से भी बोल सकते हैं',
    helplineText: 'मुफ्त कॉल सहायता:',
    placeholderHeading: 'नमस्ते किसान भाई! आपकी फसल में क्या समस्या है?',
    placeholderDesc: 'ऊपर दिए गए 1-टैप कार्ड पर दबाएं या माइक का बटन दबाकर बोलें। कृषि विशेषज्ञ एआई आपको तुरंत सही दवा, छिड़काव की विधि और सरकारी योजनाओं की जानकारी देगा।',
    servicePestTitle: 'कीट व रोग नियंत्रण',
    servicePestDesc: 'दवा का सही नाम, मात्रा व छिड़काव का सही समय।',
    serviceWaterTitle: 'सिंचाई व मौसम',
    serviceWaterDesc: 'मौसम व मिट्टी के अनुसार पानी की 40% बचत।',
    serviceSchemesTitle: 'सरकारी सब्सिडी',
    serviceSchemesDesc: 'फसल बीमा, सोलर पंप, और KCC ऋण सहायता।',

    // 1-Tap Cards
    cardsHeaderTitle: 'किसान 1-टैप सहायता',
    cardsHeaderTag: 'आवाज व चित्र',
    cardsHeaderSubtitle: 'बटन दबाकर सीधे डॉक्टर सलाह पाएं • आवाज में सुनें',
    cardPestTitle: 'कीट व बीमारी का इलाज',
    cardPestDesc: 'पत्तियों का पीलापन, सुंडी, कीड़ा या फफूंद का तुरंत उपाय',
    cardPestQuery: 'मेरी गेहूं और धान की पत्तियों में पीलापन और छेद दिख रहे हैं। कौन सी दवा और कितने एमएल पानी में मिलाकर छिड़काव करना चाहिए?',
    cardPestAudio: 'फसल में कीड़ा या बीमारी का इलाज पूछने के लिए यहाँ दबाएं',
    cardWaterTitle: 'मौसम व सिंचाई सलाह',
    cardWaterDesc: 'कल बारिश की संभावना या ट्यूबवेल चलाने का सही समय',
    cardWaterQuery: 'आने वाले 3 दिनों में मौसम का क्या अनुमान है? क्या मुझे आज खेत में पानी देना चाहिए या बारिश का इंतजार करना चाहिए?',
    cardWaterAudio: 'मौसम और पानी की सलाह जानने के लिए यहाँ दबाएं',
    cardFertilizerTitle: 'खाद व पोषण प्रबंधन',
    cardFertilizerDesc: 'यूरिया, डीएपी, पोटाश व जिंक की सही मात्रा व छिड़काव',
    cardFertilizerQuery: 'बुवाई के 40 दिन बाद प्रति एकड़ कितनी यूरिया, जिंक और नैनो यूरिया का छिड़काव करना चाहिए ताकि उपज बढ़े?',
    cardFertilizerAudio: 'खाद और पोषण की सही मात्रा जानने के लिए यहाँ दबाएं',
    cardSchemeTitle: 'सरकारी योजना व सब्सिडी',
    cardSchemeDesc: 'पीएम किसान, फसल बीमा क्लेम व सोलर पंप अनुदान',
    cardSchemeQuery: 'प्रधानमंत्री फसल बीमा योजना और सोलर पंप सब्सिडी के लिए किसान कैसे आवेदन करें और आवश्यक दस्तावेज क्या हैं?',
    cardSchemeAudio: 'सरकारी योजनाओं और सब्सिडी की जानकारी के लिए यहाँ दबाएं',

    // Farm Profile Editor
    farmProfileTitle: 'मेरा खेत व फसल प्रोफाइल',
    activeFarmBadge: '🌾 सक्रिय खेत',
    quickCropSelect: 'प्रमुख फसल चुनें (Quick Select Crop):',
    tapToSelect: 'टैप करें',
    currentCropLabel: 'वर्तमान फसल और किस्म (Current Crop & Variety)',
    currentCropPlaceholder: 'उदा. गेहूं PBW 550, बासमती 1121, संकर मक्का',
    landAndSoilLabel: 'जमीन का रकबा और मिट्टी (Land & Soil Type)',
    landAndSoilPlaceholder: 'उदा. 4 एकड़, दोमट व बलुई मिट्टी',
    irrigationLabel: 'सिंचाई का साधन (Irrigation Source)',
    irrigationPlaceholder: 'उदा. ट्यूबवेल, नहर, ड्रिप सिंचाई',
    cropAgeLabel: 'फसल की उम्र (बुवाई के दिन / Age in Days)',
    cropAgeDays: 'दिन',

    // Advice Card
    listenAloud: 'आवाज में सुनें (Listen Audio)',
    stopAudio: 'आवाज बंद करें',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    copyPrescription: 'पर्ची कॉपी करें',
    kisanSummaryHeader: 'किसान मित्र सार (सरल शब्दों में)',
    treatmentHeader: 'उपचार व जरूरी कदम (Dos & Don\'ts)',
    verdictShipTitle: '✅ तुरंत करें (अनुशंसित उपाय)',
    verdictShipSubtitle: 'इस उपाय से फसल सुरक्षित रहेगी और पैदावार में सुधार होगा।',
    verdictFakeTitle: '⚠️ सावधानी बरतें (वैकल्पिक / शर्त लागू)',
    verdictFakeSubtitle: 'मौसम या मिट्टी की नमी देखकर ही यह कदम उठाएं।',
    verdictCutTitle: '❌ न करें (हानिकारक / मनाही)',
    verdictCutSubtitle: 'यह करने से लागत बढ़ेगी या फसल को नुकसान हो सकता है।',
    freeKisanHelpline: 'निःशुल्क किसान कॉल सेंटर:',
    callCenterNumber: '1800-180-1551 (टोल-फ्री)',

    // Social Feed
    socialTitle: 'किसान चौपाल (Farmer Community Feed)',
    socialSubtitle: 'देशभर के प्रगतिशील किसानों से जुड़ें, अनुभव देखें और अपनी फसल साझा करें',
    createPostBtn: '+ नई पोस्ट डालें',
    allCropsFilter: 'सभी फसलें',
    filterWheat: 'गेहूं',
    filterCotton: 'कपास',
    filterMustard: 'सरसों',
    filterPaddy: 'धान',
    like: 'पसंद',
    comment: 'टिप्पणी',
    share: 'शेयर',
    directMessage: 'संदेश',
    follow: 'फॉलो करें',
    following: 'फॉलो कर रहे हैं',
    addCommentPlaceholder: 'अपनी सलाह या विचार लिखें...',
    postCommentBtn: 'भेजें',
    farmerStories: 'किसान स्टोरीज व खेत अपडेट',
    newPostModalTitle: 'किसान चौपाल पर नई पोस्ट साझा करें',
    cropTagLabel: 'फसल का टैग चुनें:',
    captionLabel: 'कैप्शन व विवरण:',
    captionPlaceholder: 'आज खेत में क्या किया? फसल कैसी है? खाद या कीट का अनुभव यहाँ लिखें...',
    selectPhotoPreset: 'खेत की तस्वीर चुनें:',
    publishPostBtn: 'चौपाल पर पोस्ट करें',
    cancelBtn: 'रद्द करें',

    // Direct Chat
    chatTitle: 'किसान चैट चौपाल (Direct Messages)',
    chatSubtitle: 'साथी किसानों से सीधे बातचीत करें या अपनी डॉक्टर पर्ची साझा करें',
    typeMessagePlaceholder: 'संदेश लिखें...',
    sendBtn: 'भेजें',
    shareActiveRxBtn: '📋 सक्रिय डॉक्टर पर्ची भेजें',
    onlineNow: 'ऑनलाइन',
    selectConversation: 'बातचीत के लिए किसान चुनें',
    advicePrescriptionCard: '🌾 डॉक्टर पर्ची साझा की',

    // Profile View
    farmerProfileTitle: 'किसान प्रोफाइल',
    postsCount: 'पोस्ट्स (Posts)',
    followersCount: 'फॉलोअर्स (Followers)',
    followingCount: 'फॉलोइंग (Following)',
    landSizeLabel: 'जमीन:',
    primaryCropsLabel: 'मुख्य फसलें:',
    joinedDateLabel: 'जुड़े:',
    switchAccountBtn: 'खाता बदलें',
    logoutBtn: 'लॉगआउट',
    myPostsTab: 'खेत की पोस्ट व तस्वीरें',
    noPostsYet: 'अभी तक कोई पोस्ट नहीं की गई है।',

    // Auth Modal
    authModalTitle: 'किसान खाता व लॉगिन',
    authModalSubtitle: 'अपनी यूजर आईडी (@username) व पासवर्ड से सुरक्षित प्रवेश करें',
    tabLogin: 'लॉगिन (Login)',
    tabRegister: 'नया खाता (Register)',
    usernameLabel: 'यूजर आईडी (User ID / Username)',
    usernamePlaceholder: 'उदा. ramesh_kisan',
    passwordLabel: 'पासवर्ड (Password)',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    fullNameLabel: 'पूरा नाम (Full Name)',
    fullNamePlaceholder: 'उदा. रमेश कुमार पटेल',
    villageLabel: 'गाँव व जिला (Village & District)',
    villagePlaceholder: 'उदा. मेरठ, उत्तर प्रदेश',
    acresLabel: 'जमीन का रकबा (Acres)',
    acresPlaceholder: 'उदा. 5 एकड़',
    cropsLabel: 'मुख्य फसलें (Crops grown)',
    cropsPlaceholder: 'उदा. गेहूं, धान, सरसों',
    loginActionBtn: 'लॉगिन करें (Enter App)',
    registerActionBtn: 'खाता बनाएं व जुड़ें (Register & Join)',
    quickSwitchAccountTitle: '1-क्लिक में टेस्ट खाता चुनें (Quick Switch):',
    switchNow: 'बदलें',
    loginError: 'यूजर आईडी या पासवर्ड गलत है। कृपया पुनः प्रयास करें।',
    registerError: 'यह यूजर आईडी पहले से मौजूद है। कोई दूसरी आईडी चुनें।',
  },

  en: {
    appName: 'Kisan AI Assistant',
    appBadge: 'Digital Agri-Hub',
    appSubtitle: 'Crop Doctor • Farmer Community Feed • Direct Chat',
    langSwitchBtn: 'हिन्दी',
    langName: 'English',

    // Navigation
    navDoctor: 'Crop Doctor',
    navSocial: 'Farmer Feed',
    navChat: 'Farmer Chat (DM)',
    navProfile: 'My Profile',

    // Account / Top bar
    loginOrSwitch: 'Login / Switch ▾',
    helpline: '1800-180-1551',
    prescription: 'Prescription',
    copied: 'Copied',

    // Doctor tab
    oneTapAssistance: '1-Tap Solutions',
    adviceAndRx: 'Advice & Rx',
    farmProfile: 'Farm Profile',
    voiceAskTitle: 'Ask by Voice (Audio Input)',
    voiceAskSubtitle: 'Speak naturally, AI listens and answers clearly',
    tapToSpeak: 'Tap Mic',
    listening: 'Listening...',
    speechNotSupported: 'Voice recognition is not supported in your browser. Please type or choose an issue card.',
    queryPlaceholder: 'e.g. Wheat leaves turning yellow, which pesticide should I spray? Or cotton bollworm treatment?',
    getAdviceBtn: 'Get Doctor Advice',
    preparingAdvice: 'Senior Agronomist is analyzing...',
    quickTopicsTitle: 'Frequently Asked Questions (Quick Topics)',
    categoryLabel: 'Select Advisory Category:',
    categoryAll: 'All Topics',
    categoryPest: 'Pests/Disease',
    categoryWater: 'Water/Fertilizer',
    categorySchemes: 'Schemes',
    problemLabel: 'Crop Problem or Question (Type or speak):',
    speakOrTypeHint: 'You can also speak via microphone',
    helplineText: 'Toll-Free Helpline:',
    placeholderHeading: 'Namaste Farmer Brother! How can we help your crop today?',
    placeholderDesc: 'Tap any 1-tap card above or click the microphone to speak. The AI Agronomist will instantly provide exact pesticide dosage, spray methods, and government scheme support.',
    servicePestTitle: 'Pest & Disease Control',
    servicePestDesc: 'Accurate brand names, dosage per acre, and spraying timing.',
    serviceWaterTitle: 'Irrigation & Weather',
    serviceWaterDesc: 'Save up to 40% water based on soil moisture and forecast.',
    serviceSchemesTitle: 'Government Subsidies',
    serviceSchemesDesc: 'Crop insurance claims, PM-KUSUM solar pumps, and KCC loan benefits.',

    // 1-Tap Cards
    cardsHeaderTitle: 'Farmer 1-Tap Assistance',
    cardsHeaderTag: 'Voice & Visual',
    cardsHeaderSubtitle: 'Tap once for instant agronomist advice • Audio playback included',
    cardPestTitle: 'Pest & Disease Remedy',
    cardPestDesc: 'Yellowing leaves, caterpillars, stem borers, or blight remedy',
    cardPestQuery: 'My wheat and paddy leaves are showing yellow spots and holes. Which fungicide/pesticide should I apply with exact dosage per acre?',
    cardPestAudio: 'Tap here to get instant treatment for crop pests and diseases',
    cardWaterTitle: 'Weather & Irrigation',
    cardWaterDesc: 'Rain forecasts and optimum tubewell scheduling',
    cardWaterQuery: 'What is the 3-day rainfall forecast? Should I irrigate my field today or hold off for incoming rain?',
    cardWaterAudio: 'Tap here to check weather and irrigation recommendations',
    cardFertilizerTitle: 'Nutrient & Fertilizer Plan',
    cardFertilizerDesc: 'Urea, DAP, Potash, and Zinc dosages per acre',
    cardFertilizerQuery: 'How much Urea, Zinc sulphate, and Nano Urea should I apply 40 days after sowing to maximize crop tillering?',
    cardFertilizerAudio: 'Tap here for precise fertilizer dosage and scheduling',
    cardSchemeTitle: 'Govt Schemes & Subsidies',
    cardSchemeDesc: 'PM-Kisan, Crop Insurance (PMFBY), Solar pump grant',
    cardSchemeQuery: 'How do I apply for PMFBY crop loss claims and solar pump subsidies under the PM-KUSUM scheme?',
    cardSchemeAudio: 'Tap here to learn about government subsidies and farmer schemes',

    // Farm Profile Editor
    farmProfileTitle: 'My Farm & Crop Profile',
    activeFarmBadge: '🌾 Active Farm',
    quickCropSelect: 'Quick Select Primary Crop:',
    tapToSelect: 'Tap to pick',
    currentCropLabel: 'Current Crop & Variety',
    currentCropPlaceholder: 'e.g. Wheat PBW 550, Basmati 1121, Hybrid Corn',
    landAndSoilLabel: 'Land Area & Soil Type',
    landAndSoilPlaceholder: 'e.g. 4 Acres, Loamy / Sandy Soil',
    irrigationLabel: 'Irrigation Source',
    irrigationPlaceholder: 'e.g. Tubewell, Canal, Drip Irrigation',
    cropAgeLabel: 'Crop Age (Days After Sowing)',
    cropAgeDays: 'Days',

    // Advice Card
    listenAloud: 'Listen Aloud (Voice Output)',
    stopAudio: 'Stop Audio',
    shareWhatsApp: 'Share on WhatsApp',
    copyPrescription: 'Copy Prescription',
    kisanSummaryHeader: 'Agronomist Summary (Simple Terms)',
    treatmentHeader: 'Action Plan & Recommended Steps',
    verdictShipTitle: '✅ Recommended (Actionable Now)',
    verdictShipSubtitle: 'This solution will protect your crop and enhance yield safely.',
    verdictFakeTitle: '⚠️ Exercise Caution (Conditional)',
    verdictFakeSubtitle: 'Check soil moisture or rain forecast before proceeding.',
    verdictCutTitle: '❌ Avoid (Harmful / High Risk)',
    verdictCutSubtitle: 'Avoid this practice as it increases expenses or risks crop loss.',
    freeKisanHelpline: 'Toll-Free Kisan Call Center:',
    callCenterNumber: '1800-180-1551 (All India)',

    // Social Feed
    socialTitle: 'Farmer Community Feed (चौपाल)',
    socialSubtitle: 'Connect with farmers nationwide, share crop updates & real experiences',
    createPostBtn: '+ Create Post',
    allCropsFilter: 'All Crops',
    filterWheat: 'Wheat',
    filterCotton: 'Cotton',
    filterMustard: 'Mustard',
    filterPaddy: 'Paddy',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    directMessage: 'Message',
    follow: 'Follow',
    following: 'Following',
    addCommentPlaceholder: 'Write your tip or comment...',
    postCommentBtn: 'Send',
    farmerStories: 'Farmer Stories & Crop Status',
    newPostModalTitle: 'Share a Post with Farmer Community',
    cropTagLabel: 'Select Crop Tag:',
    captionLabel: 'Caption & Experience:',
    captionPlaceholder: 'What happened in the field today? How is the harvest? Share here...',
    selectPhotoPreset: 'Select Farm Photo:',
    publishPostBtn: 'Publish to Community',
    cancelBtn: 'Cancel',

    // Direct Chat
    chatTitle: 'Farmer Direct Messages (DM)',
    chatSubtitle: 'Privately discuss with fellow farmers or share active AI doctor prescriptions',
    typeMessagePlaceholder: 'Type a message...',
    sendBtn: 'Send',
    shareActiveRxBtn: '📋 Share Active Doctor Slip',
    onlineNow: 'Online',
    selectConversation: 'Select a farmer to chat',
    advicePrescriptionCard: '🌾 Shared Doctor Advisory Prescription',

    // Profile View
    farmerProfileTitle: 'Farmer Profile',
    postsCount: 'Posts',
    followersCount: 'Followers',
    followingCount: 'Following',
    landSizeLabel: 'Land Area:',
    primaryCropsLabel: 'Primary Crops:',
    joinedDateLabel: 'Joined:',
    switchAccountBtn: 'Switch Account / Login',
    logoutBtn: 'Log Out',
    myPostsTab: 'Field Posts & Photos',
    noPostsYet: 'No posts published yet.',

    // Auth Modal
    authModalTitle: 'Farmer Account & Login',
    authModalSubtitle: 'Securely sign in with your User ID (@username) and password',
    tabLogin: 'Sign In (Login)',
    tabRegister: 'Create Account (Register)',
    usernameLabel: 'User ID (Username):',
    usernamePlaceholder: 'e.g. ramesh_kisan',
    passwordLabel: 'Password:',
    passwordPlaceholder: 'Enter your password...',
    fullNameLabel: 'Full Name of Farmer:',
    fullNamePlaceholder: 'e.g. Ramesh Patel',
    villageLabel: 'Village & District:',
    villagePlaceholder: 'e.g. Anand, Gujarat',
    acresLabel: 'Land Area (Acres):',
    acresPlaceholder: 'e.g. 5 Acres',
    cropsLabel: 'Primary Crops (comma separated):',
    cropsPlaceholder: 'e.g. Wheat, Cotton, Mustard',
    loginActionBtn: 'Sign In (Enter App)',
    registerActionBtn: 'Create Account & Begin',
    quickSwitchAccountTitle: 'Or 1-tap sign in with pre-registered accounts:',
    switchNow: 'Switch',
    loginError: 'Incorrect User ID or Password. Please try again.',
    registerError: 'This User ID is already taken. Please pick another.',
  },
};
