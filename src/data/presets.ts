export interface ScenarioPreset {
  id: string;
  title: string;
  domain: 'Agriculture & Climate' | 'Healthcare' | 'Governance & Civic' | 'Education & Livelihood' | 'General';
  mode: 'SCOPE' | 'DEBUG' | 'PITCH';
  hoursDefault: number;
  query: string;
  status: {
    works: string;
    stubbed: string;
    cut: string;
  };
}

export const PRESETS: ScenarioPreset[] = [
  {
    id: 'cotton-pest',
    title: '🐛 कपास में गुलाबी सुंडी (Cotton Pink Bollworm)',
    domain: 'Agriculture & Climate',
    mode: 'SCOPE',
    hoursDefault: 3,
    query:
      'कपास के पौधे में फूल और डोडे गिर रहे हैं और अंदर गुलाबी सुंडी दिखाई दे रही है। 4 एकड़ खेत है। कौन सी सस्ती दवा या देशी काढ़ा छिड़कें जिससे फसल बच सके?',
    status: {
      works: 'कपास (Cotton) - 4 एकड़',
      stubbed: 'काली मध्यम मिट्टी (Black Soil)',
      cut: 'ड्रिप सिंचाई (Drip Irrigation)',
    },
  },
  {
    id: 'wheat-irrigation',
    title: '💧 गेहूं में सिंचाई व मौसम (Wheat Watering Alert)',
    domain: 'Agriculture & Climate',
    mode: 'SCOPE',
    hoursDefault: 2,
    query:
      'गेहूं की फसल 45 दिन की हो चुकी है, पहली कल्ले फूटने वाली अवस्था है। क्या कल ट्यूबवेल चलाकर पानी दें या अगले दो दिन में बारिश की संभावना है? यूरिया कब डालना सही रहेगा?',
    status: {
      works: 'गेहूं (Wheat PBW 550) - 5 एकड़',
      stubbed: 'दोमट मिट्टी (Loamy Soil)',
      cut: 'ट्यूबवेल / बोरवेल (Tubewell)',
    },
  },
  {
    id: 'paddy-blight',
    title: '🌾 धान में पीलापन व झुलसा रोग (Paddy Blight)',
    domain: 'Agriculture & Climate',
    mode: 'SCOPE',
    hoursDefault: 4,
    query:
      'धान की पत्तियों पर किनारे से पीलापन और भूरे धब्बे आ रहे हैं। क्या यह बैक्टीरियल ब्लाइट है या पोटाश की कमी? इसका सही रासायनिक व जैविक इलाज क्या है?',
    status: {
      works: 'बासमती धान (Basmati Paddy) - 3 एकड़',
      stubbed: 'चिकनी मिट्टी (Clay Soil)',
      cut: 'नहर का पानी (Canal Water)',
    },
  },
  {
    id: 'mandi-rates',
    title: '💰 सोयाबीन व सरसों मंडी भाव (Mandi Rate Advice)',
    domain: 'Agriculture & Climate',
    mode: 'SCOPE',
    hoursDefault: 7,
    query:
      'मेरे पास 50 क्विंटल सोयाबीन है। स्थानीय मंडी में अभी ₹4,200 का भाव मिल रहा है। क्या अभी बेच दूं या 15 दिन रोक कर रखूं? आगे भाव बढ़ने के क्या आसार हैं?',
    status: {
      works: 'सोयाबीन (Soybean JS 9560)',
      stubbed: 'सूखा भंडार गृह (Farm Storage)',
      cut: 'नजदीकी APMC मंडी (Local APMC)',
    },
  },
  {
    id: 'pm-kisan-scheme',
    title: '📜 PM-किसान 17वीं किस्त व फसल बीमा (Govt Scheme)',
    domain: 'Governance & Civic',
    mode: 'SCOPE',
    hoursDefault: 5,
    query:
      'मेरी PM किसान सम्मान निधि की पिछली किस्त नहीं आई है। आधार eKYC और लैंड सीडिंग कैसे चेक करें? अगर भारी बारिश से फसल नष्ट हो जाए तो 72 घंटे में बीमा क्लेम कैसे दर्ज करें?',
    status: {
      works: '2.5 एकड़ सीमांत किसान (Smallholder)',
      stubbed: 'आधार लिंक बैंक खाता (DBT Account)',
      cut: 'CSC जन सेवा केंद्र (Common Service Center)',
    },
  },
  {
    id: 'dairy-health',
    title: '🐄 गाय-भैंस दूध व थनैला बचाव (Dairy Livestock)',
    domain: 'Healthcare',
    mode: 'SCOPE',
    hoursDefault: 1,
    query:
      'भैंस ब्याने के 20 दिन बाद अचानक दूध कम कर रही है और एक थन में सूजन और कड़ापन है। दूध में छींटे आ रहे हैं। तुरंत राहत के लिए क्या देशी या डॉक्टरी इलाज करें?',
    status: {
      works: '2 मुर्राह भैंस + 1 गाय (Murrah Dairy)',
      stubbed: 'हरा चारा (ज्वार/बरसीम) + दलिया',
      cut: 'गाँव का पशु औषधालय (Local Vet Dispensary)',
    },
  },
];
