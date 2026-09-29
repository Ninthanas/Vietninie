// ============================================================================
// PROGRESS DASHBOARD & SETTINGS / ADMIN DATA MANAGER CONTROLLER
// ============================================================================
const ProgressAndSettingsController = {
  async init() {
    if (document.getElementById('progressDashboardMount')) {
      await this.renderProgressPage();
      window.addEventListener('sentruc:lang-changed', () => this.renderProgressPage());
      window.addEventListener('sentruc:auth-changed', () => this.renderProgressPage());
    }

    if (document.getElementById('settingsAdminMount')) {
      await this.renderSettingsPage();
      window.addEventListener('sentruc:lang-changed', () => this.renderSettingsPage());
      window.addEventListener('sentruc:auth-changed', () => this.renderSettingsPage());
    }
  },

  async renderProgressPage() {
    const mount = document.getElementById('progressDashboardMount');
    if (!mount) return;

    const vocab = await window.DataService.getActiveVocabulary();
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const learnedIds = window.StorageManager.getLearnedIds();
    const favIds = window.StorageManager.getFavoriteIds();
    const reviewIds = window.StorageManager.getNeedsReviewIds();
    const streak = window.StorageManager.getStreak();
    const quizAcc = window.StorageManager.getQuizAverageAccuracy();

    const totalWords = vocab.length;
    const learnedCount = learnedIds.size;
    const pct = Math.min(100, Math.round((learnedCount / Math.max(1, totalWords)) * 100));
    const daysLog = window.StorageManager.getLast7DaysActivity();
    const maxDayCount = Math.max(20, ...daysLog.map(d => d.count));

    mount.innerHTML = `
      <!-- Hero Mastery Banner -->
      <div class="card" style="padding: 32px; margin-bottom: 28px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span class="badge badge-rose">${isLearningZh ? '🇻🇳 Người Việt → Học Tiếng Trung 🇨🇳' : '🇨🇳 中国人 → 学习越南语 🇻🇳'}</span>
            <h2 style="font-size: 1.9rem; font-weight: 800; margin-top: 8px;">
              ${isLearningZh ? 'Tiến Độ Học Tiếng Trung' : '越南语学习总进度'}
            </h2>
            <p style="color: var(--text-secondary);">
              <strong>${learnedCount.toLocaleString()}</strong> / ${totalWords.toLocaleString()} ${isLearningZh ? 'từ đã học' : '词已掌握'} (${pct}%)
            </p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-outline" onclick="ProgressAndSettingsController.seedDemoProgress()">
              ✨ ${isLearningZh ? 'Nạp tiến độ mẫu (1.284 từ - 75%)' : '加载演示数据 (1,284 词)'}
            </button>
            <a href="vocabulary.html?mode=flashcard" class="btn btn-sm btn-primary">
              🃏 ${isLearningZh ? 'Ôn tập SRS ngay' : '立即复习闪卡'}
            </a>
          </div>
        </div>

        <div class="quiz-progress-track" style="height: 16px; margin: 18px 0 8px;">
          <div class="quiz-progress-fill" style="width: ${Math.max(3, pct)}%;"></div>
        </div>
      </div>

      <!-- 5 KPI Cards -->
      <div class="progress-kpi-grid">
        <div class="kpi-card">
          <span style="font-size:1.6rem;">📚</span>
          <div class="kpi-value">${learnedCount.toLocaleString()}</div>
          <div style="color:var(--text-secondary); font-weight:600;">${isLearningZh ? 'Từ vựng đã thuộc' : '已掌握词汇'}</div>
        </div>
        <div class="kpi-card">
          <span style="font-size:1.6rem;">❤️</span>
          <div class="kpi-value">${favIds.size}</div>
          <div style="color:var(--text-secondary); font-weight:600;">${isLearningZh ? 'Từ vựng Yêu thích' : '收藏夹词汇'}</div>
        </div>
        <div class="kpi-card">
          <span style="font-size:1.6rem;">🧠</span>
          <div class="kpi-value">${reviewIds.size}</div>
          <div style="color:var(--text-secondary); font-weight:600;">${isLearningZh ? 'Cần ôn tập (SRS)' : '待复习词汇 (SRS)'}</div>
        </div>
        <div class="kpi-card">
          <span style="font-size:1.6rem;">🔥</span>
          <div class="kpi-value">${streak} ${isLearningZh ? 'ngày' : '天'}</div>
          <div style="color:var(--text-secondary); font-weight:600;">${isLearningZh ? 'Chuỗi ngày học liên tiếp' : '连续打卡天数'}</div>
        </div>
        <div class="kpi-card">
          <span style="font-size:1.6rem;">🎯</span>
          <div class="kpi-value">${quizAcc}%</div>
          <div style="color:var(--text-secondary); font-weight:600;">${isLearningZh ? 'Tỷ lệ đúng Quiz' : '测验平均正确率'}</div>
        </div>
      </div>

      <!-- 7-Day Daily Study Bar Chart -->
      <div class="card" style="padding: 28px;">
        <h3 style="margin-bottom: 6px;">📈 ${isLearningZh ? 'Biểu đồ tiến độ học tập 7 ngày gần nhất' : '近 7 天每日词汇学习趋势图'}</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          ${isLearningZh ? 'Số lượng từ vựng & lượt ôn tập hoàn thành mỗi ngày:' : '每日完成的新学与复习词条数量：'}
        </p>
        <div class="chart-bars-wrap">
          ${daysLog.map(day => {
            const heightPct = Math.max(10, Math.round((day.count / maxDayCount) * 100));
            return `
              <div class="chart-col">
                <span style="font-size:0.78rem; font-weight:800; color:var(--brand-primary);">${day.count}</span>
                <div class="chart-bar" style="height: ${heightPct}%;"></div>
                <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:600;">${day.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Unified Lesson Score History & Placement Level -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px; margin-top: 28px;">
        <div class="card" style="padding: 26px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3>🎓 ${isLearningZh ? 'Bảng Điểm Các Bài Học (4 Bước)' : '核心课程得分记录 (4步法)'}</h3>
            <button type="button" class="btn btn-sm btn-primary" onclick="window.CoreLessonController && window.CoreLessonController.openSelector()">
              + ${isLearningZh ? 'Học bài mới' : '开始闯关'}
            </button>
          </div>
          <div id="progressLessonScoresMount">
            ${(() => {
              const scoresObj = window.CoreLessonController ? window.CoreLessonController.getSavedScores() : {};
              const entries = Object.values(scoresObj);
              if (!entries.length) {
                return `<p style="color:var(--text-secondary); font-size:0.9rem;">${isLearningZh ? 'Chưa có bài học nào được chấm điểm. Hãy bấm "+ Học bài mới" để hoàn thành bài học đầu tiên!' : '暂无课程得分记录，点击右上角开始学习第一课！'}</p>`;
              }
              return `<div style="display:flex; flex-direction:column; gap:10px;">` + entries.map(e => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border-radius:12px; background:var(--bg-primary); border:1px solid var(--border-color);">
                  <div>
                    <div style="font-weight:800;">${isLearningZh ? e.title_vi : e.title_zh}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">📅 ${e.date}</div>
                  </div>
                  <span class="badge badge-jade" style="font-size:0.95rem;">🏆 ${e.score} / ${e.total}</span>
                </div>
              `).join('') + `</div>`;
            })()}
          </div>
        </div>

        <div class="card" style="padding: 26px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3>🧭 ${isLearningZh ? 'Đánh Giá Năng Lực Đầu Vào' : '语言水平定级测试'}</h3>
            <button type="button" class="btn btn-sm btn-outline" onclick="window.PlacementController && window.PlacementController.open()">
              🎯 ${isLearningZh ? 'Làm bài Test' : '重新测评'}
            </button>
          </div>
          <p style="color:var(--text-secondary); font-size:0.92rem; margin-bottom:16px;">
            ${isLearningZh
              ? 'Kiểm tra trình độ thực tế từ A1 đến C2 (hoặc HSK 1–6) để hệ thống gợi ý bài học phù hợp nhất.'
              : '通过分级测试精准评估您的当前水平（A1–C2），自动匹配最适合您的课程。'}
          </p>
          <div style="padding:18px; border-radius:14px; background:var(--bg-primary); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.84rem; color:var(--text-secondary);">${isLearningZh ? 'Trình độ hiện tại của bạn:' : '您当前的评定等级：'}</div>
              <div style="font-size:1.8rem; font-weight:900; color:var(--brand-primary);">${localStorage.getItem('sentruc_placement_level') || 'A1 / HSK 1'}</div>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.PlacementController && window.PlacementController.open()">
              🚀 ${isLearningZh ? 'Kiểm tra ngay' : '立即定级'}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async seedDemoProgress() {
    const vocab = await window.DataService.getActiveVocabulary();
    const sampleLearned = vocab.slice(0, 1284).map(i => i.id);
    const sampleFavs = vocab.slice(0, 86).map(i => i.id);
    localStorage.setItem(window.StorageManager.getKey('learned'), JSON.stringify(sampleLearned));
    localStorage.setItem(window.StorageManager.getKey('favorites'), JSON.stringify(sampleFavs));
    localStorage.setItem('sentruc_streak', '12');

    // Seed 132 SRS review items
    const srsMap = {};
    vocab.slice(1284, 1416).forEach(item => {
      srsMap[item.id] = { rating: 2, reps: 2, lastReviewed: Date.now() - 86400000, nextReview: Date.now() - 1000 };
    });
    localStorage.setItem(window.StorageManager.getKey('srs'), JSON.stringify(srsMap));

    window.AppUI.showToast('🎉 Đã nạp dữ liệu tiến độ mẫu: 1.284 từ đã học, 86 yêu thích, 132 cần ôn, Streak 12 ngày!');
    this.renderProgressPage();
  },

  // ============================================================================
  // SETTINGS & ADMIN DATA MANAGEMENT PAGE
  // ============================================================================
  async renderSettingsPage() {
    const mount = document.getElementById('settingsAdminMount');
    if (!mount) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const customList = window.StorageManager.getCustomVocabulary();

    mount.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px;">
        <!-- Preferences Card -->
        <div class="card">
          <h3 style="margin-bottom: 16px;">⚙️ ${isLearningZh ? 'Cài đặt Ngôn ngữ & Giao diện' : '语言方向与界面设置'}</h3>

          <div style="margin-bottom: 18px;">
            <label style="font-weight:700; display:block; margin-bottom:8px;">
              ${isLearningZh ? 'Hướng học hiện tại:' : '当前学习方向：'}
            </label>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn ${isLearningZh ? 'btn-primary' : 'btn-outline'}" onclick="window.LanguageManager.setNativeLang('vi')">
                🇻🇳 Người Việt → Học Tiếng Trung
              </button>
              <button type="button" class="btn ${!isLearningZh ? 'btn-primary' : 'btn-outline'}" onclick="window.LanguageManager.setNativeLang('zh')">
                🇨🇳 我是中国人 → 学习越南语
              </button>
            </div>
          </div>

          <div style="margin-bottom: 18px;">
            <label style="font-weight:700; display:block; margin-bottom:8px;">
              ${isLearningZh ? 'Chế độ giao diện (Light / Dark Mode):' : '主题外观模式：'}
            </label>
            <button type="button" class="btn btn-outline" onclick="window.AppUI.toggleTheme(); ProgressAndSettingsController.renderSettingsPage();">
              ${currentTheme === 'dark' ? '☀️ Chuyển sang Light Mode' : '🌙 Chuyển sang Dark Mode'}
            </button>
          </div>

          <div style="border-top:1px solid var(--border-color); padding-top:18px; margin-top:18px;">
            <h4 style="margin-bottom:10px;">💾 ${isLearningZh ? 'Sao lưu & Đặt lại Tiến độ' : '数据导出与重置'}</h4>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" class="btn btn-sm btn-outline" onclick="ProgressAndSettingsController.exportVocabularyJson()">
                📥 ${isLearningZh ? 'Xuất JSON Từ vựng' : '导出 JSON 词库'}
              </button>
              <button type="button" class="btn btn-sm btn-outline" onclick="ProgressAndSettingsController.resetAllProgress()">
                🗑️ ${isLearningZh ? 'Xóa tiến độ học' : '重置学习记录'}
              </button>
            </div>
          </div>
        </div>

        <!-- Admin CMS: Add Custom Vocabulary Item -->
        <div class="card">
          <h3 style="margin-bottom: 14px;">🛠️ ${isLearningZh ? 'Admin CMS: Thêm Từ Vựng Mới' : '词库管理后台：新增自定义词条'}</h3>
          <form id="adminAddVocabForm" onsubmit="ProgressAndSettingsController.handleAddCustomWord(event)" style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" id="admWord" class="filter-select" placeholder="${isLearningZh ? 'Từ vựng tiếng Trung (VD: 跨境直播)' : '越南语词汇 (例: Thương mại điện tử)'}" required />
            <input type="text" id="admPhonetic" class="filter-select" placeholder="${isLearningZh ? 'Pinyin (VD: kuàjìng zhíbō)' : '发音指南 (例: [thương mại điện tử])'}" required />
            <input type="text" id="admMeaning" class="filter-select" placeholder="${isLearningZh ? 'Nghĩa tiếng Việt (VD: Livestream xuyên biên giới)' : '中文释义 (例: 电子商务)'}" required />
            <input type="text" id="admExampleTarget" class="filter-select" placeholder="${isLearningZh ? 'Câu ví dụ tiếng Trung' : '越南语例句'}" required />
            <input type="text" id="admExampleNative" class="filter-select" placeholder="${isLearningZh ? 'Dịch nghĩa câu ví dụ' : '中文例句翻译'}" required />
            <button type="submit" class="btn btn-primary">+ ${isLearningZh ? 'Lưu từ vựng vào Hệ thống' : '保存至本地词库'}</button>
          </form>

          ${customList.length > 0 ? `
            <div style="margin-top:18px;">
              <h4>Từ vựng đã thêm (${customList.length}):</h4>
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                ${customList.map(c => `
                  <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-primary); padding:8px 12px; border-radius:8px;">
                    <span><strong>${c.word}</strong> — ${isLearningZh ? c.meaning_vi : c.meaning_zh}</span>
                    <button type="button" class="btn btn-sm btn-outline" onclick="window.StorageManager.deleteCustomVocabulary(${c.id}); ProgressAndSettingsController.renderSettingsPage();">Xóa</button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  handleAddCustomWord(e) {
    e.preventDefault();
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const word = document.getElementById('admWord').value.trim();
    const phonetic = document.getElementById('admPhonetic').value.trim();
    const meaning = document.getElementById('admMeaning').value.trim();
    const exTarget = document.getElementById('admExampleTarget').value.trim();
    const exNative = document.getElementById('admExampleNative').value.trim();

    window.StorageManager.addCustomVocabulary({
      word,
      pinyin: phonetic,
      pronunciation_guide: phonetic,
      meaning_vi: meaning,
      meaning_zh: meaning,
      word_type: 'phrase',
      level: isLearningZh ? 'HSK 4' : 'B1',
      topic: 'vn_proficiency',
      topic_key: 'vn_proficiency',
      topic_label_vi: '60. Từ vựng giao tiếp Việt - Trung chuyên sâu',
      topic_label_zh: '60. 越中跨境实务词汇',
      example_zh: isLearningZh ? exTarget : exNative,
      example_pinyin: isLearningZh ? phonetic : '',
      example_vi: isLearningZh ? exNative : exTarget,
      pronunciation: '',
      usage_note: 'Từ vựng do Admin/Người học bổ sung.'
    });

    // Clear DataService cache so vocabulary page immediately sees it
    window.DataService.cache = {};
    window.AppUI.showToast('✅ Đã thêm từ vựng mới vào cơ sở dữ liệu!');
    this.renderSettingsPage();
  },

  async exportVocabularyJson() {
    const vocab = await window.DataService.getActiveVocabulary();
    const blob = new Blob([JSON.stringify(vocab, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentruc-vocabulary-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  resetAllProgress() {
    localStorage.removeItem(window.StorageManager.getKey('learned'));
    localStorage.removeItem(window.StorageManager.getKey('favorites'));
    localStorage.removeItem(window.StorageManager.getKey('srs'));
    window.AppUI.showToast('🗑️ Đã đặt lại tiến độ học của hướng hiện tại!');
    this.renderSettingsPage();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProgressAndSettingsController.init();
});

window.ProgressAndSettingsController = ProgressAndSettingsController;
