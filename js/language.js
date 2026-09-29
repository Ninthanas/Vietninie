// ============================================================================
// BILINGUAL UI TRANSLATION SYSTEM (VI <-> ZH, EXTENSIBLE TO EN/JA)
// ============================================================================
const translations = {
  vi: {
    brandName: 'Vietninie',
    brandTagline: '越学越辣 🌶️ • Học Song Ngữ Việt ⇄ Trung',
    switchLangBtn: 'Đổi ngôn ngữ / 切换语言',
    directionBadge: '🇻🇳 Người Việt học Tiếng Trung 🇨🇳',
    home: 'Trang chủ',
    vocabulary: 'Từ vựng',
    grammar: 'Ngữ pháp',
    conversation: 'Hội thoại',
    listening: 'Luyện nghe',
    quiz: 'Kiểm tra (Quiz)',
    progress: 'Tiến độ',
    settings: 'Cài đặt & Admin',
    profile: 'Hồ sơ',
    startLearning: 'Bắt đầu học ngay',
    exploreVocab: 'Khám phá 2.300+ từ vựng',
    heroEyebrow: '✨ Nền tảng song ngữ Việt ⇄ Trung thế hệ mới',
    heroTitle: 'Chinh phục <span class="highlight">Tiếng Trung</span> tự nhiên cùng Linh vật Bảo Sen',
    heroDesc: 'Hơn 2.300+ từ vựng HSK 1–6 chia theo 60 chủ đề thực tế, đầy đủ Pinyin chuẩn, phát âm giọng bản xứ, Flashcard 3D lặp lại ngắt quãng (SRS), 16 chuyên đề ngữ pháp và 17 tình huống hội thoại.',
    statWords: 'Từ vựng tiếng Trung',
    statTopics: 'Chủ đề thực tế',
    statDialogues: 'Hội thoại tình huống',
    statQuizModes: 'Chế độ Quiz',
    dailySpotlightTitle: 'Từ vựng tiêu điểm hôm nay',
    listenAudio: '🔊 Nghe phát âm',
    featuresTitle: 'Hệ sinh thái học toàn diện',
    featuresSubtitle: 'Thiết kế tối ưu riêng cho người Việt học tiếng Trung từ con số 0 đến HSK 6',
    feat1Title: '2.300+ Từ vựng 60 Chủ đề',
    feat1Desc: 'Đầy đủ chữ Hán, Pinyin chuẩn, nghĩa tiếng Việt tự nhiên, phân loại HSK 1–6 và ghi chú cách dùng.',
    feat2Title: 'Flashcard 3D & Spaced Repetition',
    feat2Desc: 'Lật thẻ 3D mượt mà, tự động lên lịch ôn tập thông minh theo 4 mức độ ghi nhớ (Chưa nhớ → Rất nhớ).',
    feat3Title: '8 Chế độ Quiz & Ghép thẻ',
    feat3Desc: 'Trắc nghiệm nghĩa, chọn chữ Hán, kiểm tra Pinyin, nghe hiểu, điền từ vào câu và ghép cặp tốc độ.',
    feat4Title: 'Ngữ pháp trực quan theo cấp độ',
    feat4Desc: 'Làm chủ 是, 有, 在, 了, 过, 的/得/地, câu chữ 把, câu bị động 被, câu so sánh 比 kèm bài tập.',
    feat5Title: '17 Hội thoại & Luyện nghe thực tế',
    feat5Desc: 'Giao tiếp nhà hàng, sân bay, khách sạn, đàm phán thương mại, phỏng vấn và chat WeChat/Zalo.',
    feat6Title: 'Theo dõi Tiến độ & Chuỗi ngày học',
    feat6Desc: 'Biểu đồ thống kê số từ đã thuộc, từ cần ôn tập SRS, tỷ lệ chính xác Quiz và chuỗi Streak.',
    pathTitle: 'Lộ trình chinh phục Tiếng Trung',
    pathStep1: 'Nền tảng Pinyin & HSK 1–2 (Giao tiếp sinh hoạt)',
    pathStep2: 'Mở rộng HSK 3–4 (Du lịch, Công sở & Mua sắm)',
    pathStep3: 'Thành thạo HSK 5 (Kinh doanh, Thương mại & Công nghệ)',
    pathStep4: 'Làm chủ HSK 6 (Thành ngữ, Tiếng lóng & Đàm phán)',
    vocabPreviewTitle: 'Khám phá kho từ vựng Tiếng Trung',
    viewAllVocab: 'Xem toàn bộ 2.300+ từ →',
    faqTitle: 'Câu hỏi thường gặp (FAQ)',
    faq1Q: 'Làm sao để đổi giữa giao diện học Tiếng Trung và học Tiếng Việt?',
    faq1A: 'Bạn chỉ cần bấm nút "Đổi ngôn ngữ / 切换语言" trên thanh menu trên cùng. Toàn bộ giao diện và kho dữ liệu sẽ chuyển sang hướng học tương ứng ngay lập tức.',
    faq2Q: 'Hệ thống ôn tập Spaced Repetition (SRS) hoạt động như thế nào?',
    faq2A: 'Khi học Flashcard, bạn đánh giá mức độ nhớ (❌ Chưa nhớ, 😐 Hơi nhớ, 😊 Nhớ, 🔥 Rất nhớ). Hệ thống sẽ lưu vào bộ nhớ trình duyệt và ưu tiên nhắc lại những từ bạn hay quên.',
    faq3Q: 'Website có phát âm giọng đọc khi không có mạng hoặc thiếu file MP3 không?',
    faq3A: 'Có! Hệ thống ưu tiên phát file MP3 trong thư mục audio/zh/ và tự động chuyển sang giọng đọc AI bản xứ (Web Speech API zh-CN) trên mọi thiết bị.',
    // Vocabulary Page
    vocabPageTitle: 'Kho Từ Vựng Tiếng Trung (2.300+ Từ - 60 Chủ Đề)',
    vocabSearchPlaceholder: 'Tìm bằng chữ Hán (你好), Pinyin (ni hao / nǐ hǎo), nghĩa tiếng Việt (xin chào) hoặc chủ đề...',
    filterAll: 'Tất cả',
    filterLearned: '✓ Đã học',
    filterUnlearned: '○ Chưa học',
    filterFavorite: '❤️ Yêu thích',
    filterReview: '🧠 Cần ôn SRS',
    allTopics: 'Tất cả 60 chủ đề',
    allLevels: 'Mọi cấp độ (HSK 1–6)',
    allTypes: 'Mọi từ loại',
    modeList: '📋 Danh sách từ',
    modeFlashcard: '🃏 Chế độ Flashcard 3D',
    btnMarkLearned: 'Đã thuộc',
    btnMarkRepeat: 'Học lại',
    btnFavorite: 'Yêu thích',
    btnDetail: 'Chi tiết',
    srsPrompt: 'Mức độ ghi nhớ của bạn với từ này:',
    srs1: '❌ Chưa nhớ (Ôn ngay)',
    srs2: '😐 Hơi nhớ (1 ngày)',
    srs3: '😊 Nhớ (3 ngày)',
    srs4: '🔥 Rất nhớ (7 ngày)',
    // Onboarding
    onboardTitle: 'Chào mừng bạn đến với Vietninie (越学越辣)! 🌶️',
    onboardSubtitle: 'Hãy chọn ngôn ngữ mẹ đẻ của bạn để hệ thống thiết lập chương trình học phù hợp nhất:',
    onboardViTitle: 'Tôi là người Việt Nam',
    onboardViDesc: 'Giao diện Tiếng Việt • Học Tiếng Trung (2.300+ từ HSK)',
    onboardZhTitle: '我是中国人 (Người Trung Quốc)',
    onboardZhDesc: '中文界面 • 学习地道越南语 (2,100+ 实用词汇)',
    onboardLevelTitle: 'Bạn đang ở trình độ nào?',
    lvlBeginner: '🌱 Mới bắt đầu (A1 / HSK 1)',
    lvlElementary: '🌿 Cơ bản (A2 / HSK 2)',
    lvlIntermediate: '🌳 Trung cấp (B1-B2 / HSK 3-4)',
    lvlAdvanced: '🎋 Nâng cao (C1-C2 / HSK 5-6)',
    onboardConfirm: 'Hoàn tất & Bắt đầu học 🚀'
  },
  zh: {
    brandName: 'Vietninie 越学越辣',
    brandTagline: '越学越辣 🌶️ • 中国人学地道越南语',
    switchLangBtn: '切换语言 / Đổi ngôn ngữ',
    directionBadge: '🇨🇳 中国人学习越南语 🇻🇳',
    home: '首页',
    vocabulary: '越南语词汇',
    grammar: '越南语语法',
    conversation: '情景对话',
    listening: '听力训练',
    quiz: '互动测验',
    progress: '学习进度',
    settings: '设置与管理',
    profile: '个人中心',
    startLearning: '立即开始学习',
    exploreVocab: '探索 2,160+ 越南语词汇',
    heroEyebrow: '✨ 专为华人打造的沉浸式越南语学习平台',
    heroTitle: '与吉祥物“宝莲”一起轻松掌握<span class="highlight">地道越南语</span>',
    heroDesc: '涵盖 60 大高频生活与跨境商务主题、超过 2,160+ 核心越南语词条，配备谐音/国际音标发音指南、真人级语音合成、3D 闪卡间隔重复 (SRS)、12 大语法专题及 17 个真实交际对话。',
    statWords: '越南语核心词汇',
    statTopics: '实用分类主题',
    statDialogues: '真实生活对话',
    statQuizModes: '专项测验模式',
    dailySpotlightTitle: '今日精选越南语词汇',
    listenAudio: '🔊 听越南语发音',
    featuresTitle: '全方位双语学习体系',
    featuresSubtitle: '针对母语为中文的学习者量身定制，突破越语声调与定语后置难关',
    feat1Title: '2,160+ 词汇覆盖 60 大主题',
    feat1Desc: '包含越文拼写、中文精准释义、发音技巧、词性、CEFR A1–C2 等级以及自然双语例句。',
    feat2Title: '3D 翻转闪卡与记忆曲线 (SRS)',
    feat2Desc: '点击卡片流畅翻转，支持“未记住、有点印象、已记住、非常熟练”四档智能复习调度。',
    feat3Title: '8 种互动测验与配对挑战',
    feat3Desc: '支持选中文意思、选越南语单词、选发音、听音辨词、连线配对、选词填空及句子翻译。',
    feat4Title: '中越对比语法精讲',
    feat4Desc: '深入浅出解析 Đã/Đang/Sẽ 时态、Được/Bị 褒贬被动、Không/Chưa 否定区分及定语后置规律。',
    feat5Title: '17 大实景对话与听力实训',
    feat5Desc: '涵盖问候、餐厅点餐、打Grab网约车、酒店入住、机场清关、工厂园区商务洽谈与Zalo聊天。',
    feat6Title: '可视化学习进度与打卡日历',
    feat6Desc: '实时统计已掌握词汇量、待复习词条、连续学习天数（Streak）以及每日学习趋势图。',
    pathTitle: '越南语进阶学习路径',
    pathStep1: 'A1 入门阶段（发音规则、人称代词 Anh/Chị/Em 与基础问候）',
    pathStep2: 'A2 基础交际（餐饮点单、购物砍价、租房与出行打车）',
    pathStep3: 'B1–B2 职场与商务（办公室行政、合同谈判、跨境电商与物流）',
    pathStep4: 'C1–C2 高阶精通（地道俗语、网络流行语与专业园区管理）',
    vocabPreviewTitle: '精选越南语高频词汇预览',
    viewAllVocab: '查看全部 2,160+ 词汇 →',
    faqTitle: '常见问题解答 (FAQ)',
    faq1Q: '如何切换“学越南语”和“学中文”模式？',
    faq1A: '点击顶部导航栏的“切换语言 / Đổi ngôn ngữ”按钮，全站界面语言、词库方向、语法课程及测验题目会自动无缝切换。',
    faq2Q: '间隔重复（Spaced Repetition）功能如何帮助记单词？',
    faq2A: '在闪卡模式下评估您的熟悉程度（❌未记住、😐有点印象、😊已记住、🔥非常熟练），系统会自动使用 localStorage 安排复习优先级。',
    faq3Q: '越南语词条支持发音朗读吗？',
    faq3A: '支持！系统内置音频播放器，优先读取本地 MP3（audio/vi/），并自动无缝回退至浏览器原生越南语语音引擎（vi-VN）。',
    // Vocabulary Page
    vocabPageTitle: '越南语核心词库 (2,160+ 词汇 - 60 大主题)',
    vocabSearchPlaceholder: '输入越南语 (Xin chào / Cà phê)、中文意思 (你好 / 咖啡) 或主题进行搜索...',
    filterAll: '全部词汇',
    filterLearned: '✓ 已掌握',
    filterUnlearned: '○ 未学习',
    filterFavorite: '❤️ 收藏夹',
    filterReview: '🧠 待复习 (SRS)',
    allTopics: '全部 60 个主题',
    allLevels: '所有等级 (A1–C2)',
    allTypes: '所有词性',
    modeList: '📋 词汇列表模式',
    modeFlashcard: '🃏 3D 闪卡背词模式',
    btnMarkLearned: '已掌握',
    btnMarkRepeat: '重学',
    btnFavorite: '收藏',
    btnDetail: '详情',
    srsPrompt: '请选择您对该词的掌握程度：',
    srs1: '❌ 未记住 (立即重现)',
    srs2: '😐 有点印象 (1天后)',
    srs3: '😊 已记住 (3天后)',
    srs4: '🔥 非常熟练 (7天后)',
    // Onboarding
    onboardTitle: '欢迎来到 Vietninie (越学越辣)! 🌶️',
    onboardSubtitle: '请选择您的母语，系统将自动为您配置专属界面与学习词库：',
    onboardViTitle: '🇻🇳 Tôi là người Việt Nam',
    onboardViDesc: '越南语界面 • 学习中文 (2,300+ HSK 词汇)',
    onboardZhTitle: '🇨🇳 我是中国人',
    onboardZhDesc: '中文界面 • 学习地道越南语 (2,160+ 越南语词汇)',
    onboardLevelTitle: '您目前的语言基础是？',
    lvlBeginner: '🌱 零基础入门 (A1)',
    lvlElementary: '🌿 初级基础 (A2)',
    lvlIntermediate: '🌳 中级进阶 (B1-B2)',
    lvlAdvanced: '🎋 高级流利 (C1-C2)',
    onboardConfirm: '保存设置并开始学习 🚀'
  }
};

const LanguageManager = {
  getNativeLang() {
    return localStorage.getItem('sentruc_native_lang') || 'vi';
  },

  setNativeLang(lang) {
    const valid = lang === 'zh' ? 'zh' : 'vi';
    localStorage.setItem('sentruc_native_lang', valid);
    document.documentElement.lang = valid;
    this.applyTranslations();
    window.dispatchEvent(new CustomEvent('sentruc:lang-changed', { detail: { lang: valid } }));
  },

  toggleLanguage() {
    const current = this.getNativeLang();
    this.setNativeLang(current === 'vi' ? 'zh' : 'vi');
  },

  getLearningLang() {
    // Vietnamese native -> learns Chinese ('zh'); Chinese native -> learns Vietnamese ('vi')
    return this.getNativeLang() === 'vi' ? 'zh' : 'vi';
  },

  t(key, fallback = '') {
    const lang = this.getNativeLang();
    return (translations[lang] && translations[lang][key]) || fallback || key;
  },

  applyTranslations() {
    const lang = this.getNativeLang();
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = this.t(key);
      if (val) el.setAttribute('placeholder', val);
    });
  }
};

window.LanguageManager = LanguageManager;
window.translations = translations;
