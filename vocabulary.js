const VOCAB_CATEGORIES = [
  { key: "all", nameZh: "全部词汇", icon: "📚" },
  { key: "greeting", nameZh: "问候礼貌", icon: "👋" },
  { key: "food", nameZh: "餐饮美食", icon: "🍜" },
  { key: "drinks", nameZh: "特色饮品", icon: "🥤" },
  { key: "cafe", nameZh: "咖啡文化", icon: "☕" },
  { key: "daily", nameZh: "日常生活", icon: "☀️" },
  { key: "family", nameZh: "家庭称呼", icon: "👨‍👩‍👧" },
  { key: "shopping", nameZh: "购物消费", icon: "🛍️" },
  { key: "transportation", nameZh: "交通出行", icon: "🛵" },
  { key: "directions", nameZh: "方向指路", icon: "🧭" },
  { key: "time", nameZh: "时间日期", icon: "⏰" },
  { key: "work", nameZh: "职场办公", icon: "💼" },
  { key: "travel", nameZh: "旅行住宿", icon: "✈️" },
  { key: "health", nameZh: "身体医疗", icon: "🏥" },
  { key: "hobbies", nameZh: "兴趣爱好", icon: "🎨" },
  { key: "business", nameZh: "商务经贸", icon: "📊" },
  { key: "society", nameZh: "社会民生", icon: "🌐" },
  { key: "culture", nameZh: "传统文化", icon: "🏮" },
  { key: "idioms", nameZh: "地道成语", icon: "📜" },
  { key: "advanced", nameZh: "高阶精通", icon: "🎓" }
];

const VIETNAMESE_LEVELS = [
  { key: "ALL", nameZh: "全部级别", nameVi: "Tất cả", descZh: "浏览所有5,000个实用词汇" },
  { key: "A1", nameZh: "A1 · 入门", nameVi: "Mới bắt đầu", descZh: "问候、自我介绍、数字、基本食物饮料与日常生活 (约800词)" },
  { key: "A2", nameZh: "A2 · 基础", nameVi: "Sơ cấp", descZh: "咖啡文化、出行叫车、租房、天气与日常买卖交流 (约900词)" },
  { key: "B1", nameZh: "B1 · 中级", nameVi: "Trung cấp", descZh: "旅行入住、求医就诊、个人爱好、学习经历与深度叙述 (约1,000词)" },
  { key: "B2", nameZh: "B2 · 中高级", nameVi: "Trung cao cấp", descZh: "职场开会、商务谈判、邮件往来、合同条款与经济话题 (约900词)" },
  { key: "C1", nameZh: "C1 · 高级", nameVi: "Cao cấp", descZh: "越南地道成语俗语、深层文化习俗、社会评论与精妙修辞 (约800词)" },
  { key: "C2", nameZh: "C2 · 精通", nameVi: "Thành thạo", descZh: "宏观哲理、深度思辨、精妙微言大义与文学表达 (约600词)" }
];

const VOCABULARY_DATA = [
  ...(typeof VOCABULARY_A1 !== 'undefined' ? VOCABULARY_A1 : []),
  ...(typeof VOCABULARY_A2 !== 'undefined' ? VOCABULARY_A2 : []),
  ...(typeof VOCABULARY_B1 !== 'undefined' ? VOCABULARY_B1 : []),
  ...(typeof VOCABULARY_B2 !== 'undefined' ? VOCABULARY_B2 : []),
  ...(typeof VOCABULARY_C1 !== 'undefined' ? VOCABULARY_C1 : []),
  ...(typeof VOCABULARY_C2 !== 'undefined' ? VOCABULARY_C2 : [])
];

if (typeof window !== "undefined") {
  window.VOCABULARY_DATA = VOCABULARY_DATA;
  window.VOCAB_CATEGORIES = VOCAB_CATEGORIES;
  window.VIETNAMESE_LEVELS = VIETNAMESE_LEVELS;
}

console.log("Vietninie Vocabulary Database ready. Total items: " + VOCABULARY_DATA.length);
