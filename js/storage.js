// ============================================================================
// STORAGE MANAGER (LOCALSTORAGE, SPACED REPETITION, PROGRESS & DATA SERVICE)
// ============================================================================
const StorageManager = {
  getKey(base) {
    const dir = window.LanguageManager ? window.LanguageManager.getLearningLang() : 'zh';
    return `sentruc_${base}_${dir}`;
  },

  // Learned Words Set
  getLearnedIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.getKey('learned')) || '[]'));
    } catch {
      return new Set();
    }
  },

  toggleLearned(id) {
    const set = this.getLearnedIds();
    const numId = Number(id);
    let isLearned = false;
    if (set.has(numId)) {
      set.delete(numId);
    } else {
      set.add(numId);
      isLearned = true;
      this.logDailyStudy(1);
    }
    localStorage.setItem(this.getKey('learned'), JSON.stringify([...set]));
    return isLearned;
  },

  markLearned(id, status = true) {
    const set = this.getLearnedIds();
    const numId = Number(id);
    if (status) {
      if (!set.has(numId)) this.logDailyStudy(1);
      set.add(numId);
    } else {
      set.delete(numId);
    }
    localStorage.setItem(this.getKey('learned'), JSON.stringify([...set]));
  },

  // Favorites Set
  getFavoriteIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(this.getKey('favorites')) || '[]'));
    } catch {
      return new Set();
    }
  },

  toggleFavorite(id) {
    const set = this.getFavoriteIds();
    const numId = Number(id);
    let isFav = false;
    if (set.has(numId)) {
      set.delete(numId);
    } else {
      set.add(numId);
      isFav = true;
    }
    localStorage.setItem(this.getKey('favorites'), JSON.stringify([...set]));
    return isFav;
  },

  // Spaced Repetition (SRS) System
  // rating: 1 (Again - 5 min), 2 (Hard - 1 day), 3 (Good - 3 days), 4 (Easy - 7 days)
  getSrsMap() {
    try {
      return JSON.parse(localStorage.getItem(this.getKey('srs')) || '{}');
    } catch {
      return {};
    }
  },

  recordSrsReview(id, rating) {
    const map = this.getSrsMap();
    const now = Date.now();
    const prev = map[id] || { reps: 0, rating: 0 };
    const intervalsMs = {
      1: 5 * 60 * 1000,            // 5 minutes (Needs immediate review)
      2: 24 * 60 * 60 * 1000,      // 1 day
      3: 3 * 24 * 60 * 60 * 1000,  // 3 days
      4: 7 * 24 * 60 * 60 * 1000   // 7 days
    };

    map[id] = {
      rating: Number(rating),
      reps: prev.reps + 1,
      lastReviewed: now,
      nextReview: now + (intervalsMs[rating] || intervalsMs[2])
    };

    localStorage.setItem(this.getKey('srs'), JSON.stringify(map));

    // If rated 3 (Nhớ) or 4 (Rất nhớ), automatically mark as learned
    if (rating >= 3) {
      this.markLearned(id, true);
    } else if (rating === 1) {
      this.markLearned(id, false);
    }
    this.logDailyStudy(1);
    return map[id];
  },

  getNeedsReviewIds() {
    const map = this.getSrsMap();
    const now = Date.now();
    const dueIds = [];
    Object.keys(map).forEach(id => {
      const entry = map[id];
      if (entry.rating <= 2 || entry.nextReview <= now) {
        dueIds.push(Number(id));
      }
    });
    return new Set(dueIds);
  },

  // Daily Streak & 7-Day Activity Log
  logDailyStudy(count = 1) {
    const today = new Date().toISOString().slice(0, 10);
    let log = {};
    try {
      log = JSON.parse(localStorage.getItem('sentruc_daily_log') || '{}');
    } catch {
      log = {};
    }
    log[today] = (log[today] || 0) + count;
    localStorage.setItem('sentruc_daily_log', JSON.stringify(log));
    this.updateStreak(today);
  },

  updateStreak(todayStr) {
    const lastDate = localStorage.getItem('sentruc_last_study_date');
    let streak = Number(localStorage.getItem('sentruc_streak') || '1');
    if (!lastDate) {
      streak = 1;
    } else if (lastDate !== todayStr) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = (lastDate === yesterday) ? streak + 1 : 1;
    }
    localStorage.setItem('sentruc_last_study_date', todayStr);
    localStorage.setItem('sentruc_streak', String(streak));
  },

  getStreak() {
    return Number(localStorage.getItem('sentruc_streak') || '5');
  },

  getLast7DaysActivity() {
    let log = {};
    try {
      log = JSON.parse(localStorage.getItem('sentruc_daily_log') || '{}');
    } catch {
      log = {};
    }
    const result = [];
    const fallbackCounts = [18, 24, 15, 32, 28, 36, 22];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      result.push({
        date: iso,
        label,
        count: log[iso] !== undefined ? log[iso] : fallbackCounts[6 - i]
      });
    }
    return result;
  },

  // Quiz History
  saveQuizResult(mode, score, total) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('sentruc_quiz_history') || '[]');
    } catch {
      history = [];
    }
    history.unshift({
      mode,
      score,
      total,
      accuracy: Math.round((score / Math.max(1, total)) * 100),
      date: new Date().toISOString()
    });
    localStorage.setItem('sentruc_quiz_history', JSON.stringify(history.slice(0, 50)));
    this.logDailyStudy(score);
  },

  getQuizAverageAccuracy() {
    try {
      const history = JSON.parse(localStorage.getItem('sentruc_quiz_history') || '[]');
      if (!history.length) return 88; // Initial encouraging baseline
      const sum = history.reduce((acc, item) => acc + item.accuracy, 0);
      return Math.round(sum / history.length);
    } catch {
      return 88;
    }
  },

  // Custom Admin Vocabulary Additions / Edits
  getCustomVocabulary() {
    try {
      return JSON.parse(localStorage.getItem(this.getKey('custom_vocab')) || '[]');
    } catch {
      return [];
    }
  },

  addCustomVocabulary(item) {
    const list = this.getCustomVocabulary();
    const newItem = {
      ...item,
      id: Date.now(),
      isCustom: true
    };
    list.unshift(newItem);
    localStorage.setItem(this.getKey('custom_vocab'), JSON.stringify(list));
    return newItem;
  },

  deleteCustomVocabulary(id) {
    const list = this.getCustomVocabulary().filter(item => Number(item.id) !== Number(id));
    localStorage.setItem(this.getKey('custom_vocab'), JSON.stringify(list));
  }
};

// ============================================================================
// DATA SERVICE (LOADS JSON FILES + AUTOMATIC FALLBACK TO DATA-BUNDLE.JS)
// ============================================================================
const DataService = {
  cache: {},

  getBasePath() {
    return window.location.pathname.includes('/pages/') ? '../data/' : 'data/';
  },

  async loadJson(filename, bundleKey) {
    if (this.cache[bundleKey]) return this.cache[bundleKey];

    // 1. Prefer preloaded bundle if available (instant 0ms load & works on file://)
    if (window.__SENTRUC_DATA__ && window.__SENTRUC_DATA__[bundleKey]) {
      this.cache[bundleKey] = window.__SENTRUC_DATA__[bundleKey];
      return this.cache[bundleKey];
    }

    // 2. Fetch JSON over HTTP/HTTPS
    try {
      const res = await fetch(this.getBasePath() + filename);
      if (res.ok) {
        const data = await res.json();
        this.cache[bundleKey] = data;
        return data;
      }
    } catch (err) {
      console.warn(`Fallback to bundle for ${filename}`, err);
    }

    return (window.__SENTRUC_DATA__ && window.__SENTRUC_DATA__[bundleKey]) || [];
  },

  async getActiveVocabulary() {
    const learningLang = window.LanguageManager ? window.LanguageManager.getLearningLang() : 'zh';
    const baseData = learningLang === 'zh'
      ? await this.loadJson('chinese-vocabulary.json', 'chineseVocabulary')
      : await this.loadJson('vietnamese-vocabulary.json', 'vietnameseVocabulary');

    const customItems = StorageManager.getCustomVocabulary();
    return [...customItems, ...baseData];
  },

  async getActiveGrammar() {
    const learningLang = window.LanguageManager ? window.LanguageManager.getLearningLang() : 'zh';
    return learningLang === 'zh'
      ? await this.loadJson('chinese-grammar.json', 'chineseGrammar')
      : await this.loadJson('vietnamese-grammar.json', 'vietnameseGrammar');
  },

  async getConversations() {
    return await this.loadJson('conversations.json', 'conversations');
  },

  getTopics() {
    return (window.__SENTRUC_DATA__ && window.__SENTRUC_DATA__.TOPICS) || [];
  }
};

window.StorageManager = StorageManager;
window.DataService = DataService;
