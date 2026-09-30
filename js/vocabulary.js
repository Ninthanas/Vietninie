// ============================================================================
// VOCABULARY ENGINE (SEARCH, FILTER, PAGINATION, 3D FLASHCARD, SRS & DETAIL)
// ============================================================================
function stripTones(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

const VocabularyController = {
  allItems: [],
  filteredItems: [],
  currentPage: 1,
  pageSize: 24,
  viewMode: 'list', // 'list' | 'flashcard'
  flashcardIndex: 0,
  filters: {
    query: '',
    status: 'all', // 'all' | 'learned' | 'unlearned' | 'favorite' | 'review'
    topic: 'all',
    level: 'all',
    wordType: 'all'
  },

  async init() {
    // Check if we are on vocabulary-detail.html
    if (document.getElementById('vocabDetailMount')) {
      await this.renderDetailPage();
      window.addEventListener('sentruc:lang-changed', () => this.renderDetailPage());
      return;
    }

    if (!document.getElementById('vocabGridMount')) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'flashcard') this.viewMode = 'flashcard';
    if (params.get('topic')) this.filters.topic = params.get('topic');

    await this.loadDataAndPopulateFilters();
    this.bindEvents();
    this.applyFilters();

    window.addEventListener('sentruc:lang-changed', async () => {
      this.filters.level = 'all';
      this.filters.wordType = 'all';
      await this.loadDataAndPopulateFilters();
      this.applyFilters();
    });
  },

  async loadDataAndPopulateFilters() {
    this.allItems = await window.DataService.getActiveVocabulary();
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';

    // Populate 60 Topics select
    const topicSelect = document.getElementById('topicFilterSelect');
    if (topicSelect) {
      const topics = window.DataService.getTopics();
      topicSelect.innerHTML = `<option value="all">${isLearningZh ? 'Tất cả 60 chủ đề (' + this.allItems.length + ' từ)' : '全部 60 个主题 (' + this.allItems.length + ' 词)'}</option>` +
        topics.map(t => `<option value="${t.key}" ${this.filters.topic === t.key ? 'selected' : ''}>${isLearningZh ? t.vi : t.zh}</option>`).join('');
    }

    // Populate Level select (HSK 1-6 for Chinese, A1-C2 for Vietnamese)
    const levelSelect = document.getElementById('levelFilterSelect');
    if (levelSelect) {
      const levels = isLearningZh
        ? ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6']
        : ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      levelSelect.innerHTML = `<option value="all">${isLearningZh ? 'Mọi cấp độ (HSK 1–6)' : '所有等级 (A1–C2)'}</option>` +
        levels.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    // Populate Word Type select
    const typeSelect = document.getElementById('typeFilterSelect');
    if (typeSelect) {
      const uniqueTypes = [...new Set(this.allItems.map(i => i.word_type))];
      typeSelect.innerHTML = `<option value="all">${isLearningZh ? 'Mọi từ loại' : '所有词性'}</option>` +
        uniqueTypes.map(wt => `<option value="${wt}">${wt}</option>`).join('');
    }
  },

  bindEvents() {
    const searchInput = document.getElementById('vocabSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.filters.query = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    const topicSelect = document.getElementById('topicFilterSelect');
    if (topicSelect) {
      topicSelect.addEventListener('change', e => {
        this.filters.topic = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    const levelSelect = document.getElementById('levelFilterSelect');
    if (levelSelect) {
      levelSelect.addEventListener('change', e => {
        this.filters.level = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    const typeSelect = document.getElementById('typeFilterSelect');
    if (typeSelect) {
      typeSelect.addEventListener('change', e => {
        this.filters.wordType = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    document.querySelectorAll('[data-status-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-status-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.status = btn.getAttribute('data-status-filter');
        this.currentPage = 1;
        this.applyFilters();
      });
    });

    const listModeBtn = document.getElementById('modeListBtn');
    const flashModeBtn = document.getElementById('modeFlashcardBtn');
    if (listModeBtn && flashModeBtn) {
      listModeBtn.addEventListener('click', () => {
        this.viewMode = 'list';
        listModeBtn.classList.add('btn-primary');
        listModeBtn.classList.remove('btn-outline');
        flashModeBtn.classList.remove('btn-primary');
        flashModeBtn.classList.add('btn-outline');
        this.renderCurrentView();
      });
      flashModeBtn.addEventListener('click', () => {
        this.viewMode = 'flashcard';
        this.flashcardIndex = 0;
        flashModeBtn.classList.add('btn-primary');
        flashModeBtn.classList.remove('btn-outline');
        listModeBtn.classList.remove('btn-primary');
        listModeBtn.classList.add('btn-outline');
        this.renderCurrentView();
      });
    }
  },

  applyFilters() {
    const qRaw = this.filters.query.trim().toLowerCase();
    const qNoTone = stripTones(qRaw);

    const learnedSet = window.StorageManager.getLearnedIds();
    const favSet = window.StorageManager.getFavoriteIds();
    const reviewSet = window.StorageManager.getNeedsReviewIds();

    this.filteredItems = this.allItems.filter(item => {
      // 1. Status filter
      if (this.filters.status === 'learned' && !learnedSet.has(item.id)) return false;
      if (this.filters.status === 'unlearned' && learnedSet.has(item.id)) return false;
      if (this.filters.status === 'favorite' && !favSet.has(item.id)) return false;
      if (this.filters.status === 'review' && !reviewSet.has(item.id)) return false;

      // 2. Topic filter
      const itemTopicKey = item.topic_key || item.topic;
      if (this.filters.topic !== 'all' && itemTopicKey !== this.filters.topic) return false;

      // 3. Level filter
      if (this.filters.level !== 'all' && item.level !== this.filters.level) return false;

      // 4. Word Type filter
      if (this.filters.wordType !== 'all' && item.word_type !== this.filters.wordType) return false;

      // 5. Smart Query search (Hanzi, Pinyin with or without tones, Vietnamese, Chinese, Topic)
      if (qRaw) {
        const w = (item.word || '').toLowerCase();
        const py = (item.pinyin || item.pronunciation_guide || '').toLowerCase();
        const pyClean = stripTones(py);
        const mVi = (item.meaning_vi || '').toLowerCase();
        const mViClean = stripTones(mVi);
        const mZh = (item.meaning_zh || '').toLowerCase();
        const tVi = stripTones(item.topic_label_vi || '');
        const tZh = (item.topic_label_zh || '').toLowerCase();

        const matched =
          w.includes(qRaw) ||
          stripTones(w).includes(qNoTone) ||
          py.includes(qRaw) ||
          pyClean.includes(qNoTone) ||
          mVi.includes(qRaw) ||
          mViClean.includes(qNoTone) ||
          mZh.includes(qRaw) ||
          tVi.includes(qNoTone) ||
          tZh.includes(qRaw);

        if (!matched) return false;
      }

      return true;
    });

    this.flashcardIndex = 0;
    this.renderCurrentView();
  },

  renderCurrentView() {
    const countLabel = document.getElementById('vocabCountSummary');
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    if (countLabel) {
      countLabel.innerHTML = isLearningZh
        ? `Hiển thị <strong>${this.filteredItems.length}</strong> / ${this.allItems.length} từ vựng tiếng Trung`
        : `当前筛选出 <strong>${this.filteredItems.length}</strong> / ${this.allItems.length} 个越南语词汇`;
    }

    const flashStage = document.getElementById('flashcardStageMount');
    const listStage = document.getElementById('vocabListStage');

    if (this.viewMode === 'flashcard') {
      if (flashStage) flashStage.style.display = 'block';
      if (listStage) listStage.style.display = 'none';
      this.renderFlashcard();
    } else {
      if (flashStage) flashStage.style.display = 'none';
      if (listStage) listStage.style.display = 'block';
      this.renderGridList();
    }
  },

  renderGridList() {
    const grid = document.getElementById('vocabGridMount');
    const pager = document.getElementById('vocabPaginationMount');
    if (!grid) return;

    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const learnedSet = window.StorageManager.getLearnedIds();
    const favSet = window.StorageManager.getFavoriteIds();

    if (this.filteredItems.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3>${isLearningZh ? 'Không tìm thấy từ vựng phù hợp' : '未找到匹配的词汇'}</h3>
          <p style="color: var(--text-secondary); margin-top: 6px;">
            ${isLearningZh ? 'Hãy thử từ khóa khác (chữ Hán, Pinyin không dấu hoặc tiếng Việt) hoặc đặt lại bộ lọc.' : '请尝试其他关键词或重置筛选条件。'}
          </p>
        </div>
      `;
      if (pager) pager.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(this.filteredItems.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageSlice = this.filteredItems.slice(startIdx, startIdx + this.pageSize);

    grid.innerHTML = pageSlice.map(item => {
      const isLearned = learnedSet.has(item.id);
      const isFav = favSet.has(item.id);
      const phonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
      const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
      const exTarget = isLearningZh ? item.example_zh : item.example_vi;
      const exPy = isLearningZh ? item.example_pinyin : '';
      const exNative = isLearningZh ? item.example_vi : item.example_zh;
      const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';
      const safeWord = item.word.replace(/'/g, "\\'");
      const safeEx = exTarget.replace(/'/g, "\\'");

      const zhRef = isLearningZh ? item.word : meaning;
      const sp = window.ChineseScriptEngine ? window.ChineseScriptEngine.getScriptPair(zhRef) : { simp: zhRef, trad: zhRef };
      const twComp = window.ChineseScriptEngine ? window.ChineseScriptEngine.getTaiwanComparison(zhRef) : null;

      return `
        <article class="vocab-card ${isLearned ? 'is-learned' : ''}" id="vocab-card-${item.id}">
          <div>
            <div class="vocab-card-header">
              <div style="display:flex; gap:5px; flex-wrap:wrap;">
                <span class="badge badge-rose">${item.level}</span>
                <span class="badge badge-indigo">🇨🇳 简: ${sp.simp}</span>
                <span class="badge" style="background:var(--brand-gold-soft); color:var(--brand-gold); font-weight:800;">🇹🇼 繁: ${sp.trad}</span>
              </div>
              <button type="button" class="action-icon-btn" onclick="AudioEngine.speak('${safeWord}', '${speechLang}', '${item.pronunciation}')" aria-label="Listen pronunciation">
                🔊 ${isLearningZh ? 'Nghe' : '听发音'}
              </button>
            </div>

            <div class="vocab-word-main">${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(item.word) : item.word}</div>
            <div class="vocab-pinyin">${phonetic}</div>
            <div class="vocab-meaning">${window.ChineseScriptEngine && !isLearningZh ? window.ChineseScriptEngine.formatText(meaning) : meaning}</div>

            <!-- Textbook vs Real-Life Mini Pill -->
            <div style="background:var(--brand-secondary-soft); border-radius:10px; padding:8px 11px; margin-bottom:10px; font-size:0.8rem; color:var(--text-primary); line-height:1.45;">
              ${isLearningZh
                ? `💡 <strong>Hiểu sâu:</strong> 📘 SGK dùng <em>"${item.word}"</em> trang trọng • 🌶️ Đời thực gắn vào ngữ cảnh <strong>${item.topic_label_vi || 'giao tiếp'}</strong>${twComp ? ` (🇹🇼 Đài Loan gọi: <strong>${twComp.tw}</strong>)` : ''}.`
                : `💡 <strong>活学活用:</strong> 📘 课本规范词 • 🌶️ 越南日常交际高频词（加语气词 nhé/nha 更地道）。`}
            </div>

            <div class="vocab-example-box">
              <div class="ex-target" style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                <span>${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(exTarget) : exTarget}</span>
                <button type="button" class="btn-icon" style="width:26px; height:26px; font-size:0.75rem; flex-shrink:0;" onclick="AudioEngine.speak('${safeEx}', '${speechLang}')" title="Nghe câu ví dụ">🔊</button>
              </div>
              ${exPy ? `<div class="ex-py">${exPy}</div>` : ''}
              <div class="ex-native">${exNative}</div>
            </div>
          </div>

          <div class="vocab-card-footer" style="flex-wrap:wrap; gap:6px;">
            <div style="display:flex; gap:6px;">
              <button type="button" class="action-icon-btn ${isFav ? 'active-fav' : ''}" onclick="VocabularyController.handleToggleFav(${item.id})">
                ${isFav ? '❤️' : '🤍'}
              </button>
              <button type="button" class="action-icon-btn ${isLearned ? 'active-learned' : ''}" onclick="VocabularyController.handleToggleLearned(${item.id})">
                ${isLearned ? (isLearningZh ? '✓ Đã thuộc' : '✓ 已掌握') : (isLearningZh ? '+ Đã thuộc' : '+ 已学')}
              </button>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="action-icon-btn" style="border-color:var(--brand-primary); color:var(--brand-primary); font-weight:800;" onclick="window.DeepWordInsightEngine && window.DeepWordInsightEngine.openModal(${item.id})">
                ✨ ${isLearningZh ? 'Giải mã thú vị' : '趣味解析'}
              </button>
              <a href="vocabulary-detail.html?id=${item.id}" class="action-icon-btn">
                ${isLearningZh ? 'Chi tiết →' : '详情 →'}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Render Pagination Controls
    if (pager) {
      const maxButtons = 7;
      let startPage = Math.max(1, this.currentPage - 3);
      let endPage = Math.min(totalPages, startPage + maxButtons - 1);
      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      let html = `
        <button type="button" class="btn btn-sm btn-outline" ${this.currentPage === 1 ? 'disabled' : ''} onclick="VocabularyController.goToPage(${this.currentPage - 1})">
          ← ${isLearningZh ? 'Trước' : '上一页'}
        </button>
      `;
      for (let p = startPage; p <= endPage; p++) {
        html += `
          <button type="button" class="btn btn-sm ${p === this.currentPage ? 'btn-primary' : 'btn-outline'}" onclick="VocabularyController.goToPage(${p})">
            ${p}
          </button>
        `;
      }
      html += `
        <button type="button" class="btn btn-sm btn-outline" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="VocabularyController.goToPage(${this.currentPage + 1})">
          ${isLearningZh ? 'Tiếp' : '下一页'} →
        </button>
      `;
      pager.innerHTML = html;
    }
  },

  goToPage(page) {
    this.currentPage = page;
    this.renderGridList();
    window.scrollTo({ top: 180, behavior: 'smooth' });
  },

  handleToggleFav(id) {
    const isFav = window.StorageManager.toggleFavorite(id);
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    window.AppUI.showToast(isFav
      ? (isLearningZh ? '❤️ Đã thêm vào Yêu thích' : '❤️ 已加入收藏夹')
      : (isLearningZh ? '🤍 Đã bỏ Yêu thích' : '🤍 已取消收藏'));
    this.renderCurrentView();
  },

  handleToggleLearned(id) {
    const isLearned = window.StorageManager.toggleLearned(id);
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    window.AppUI.showToast(isLearned
      ? (isLearningZh ? '✓ Đã đánh dấu thuộc từ này!' : '✓ 已标记为掌握！')
      : (isLearningZh ? '🔄 Đã đưa về danh sách Học lại' : '🔄 已移回待学习列表'));
    this.renderCurrentView();
  },

  // ============================================================================
  // 3D FLASHCARD & SPACED REPETITION (SRS) RENDERER
  // ============================================================================
  renderFlashcard() {
    const mount = document.getElementById('flashcardStageMount');
    if (!mount) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';

    if (this.filteredItems.length === 0) {
      mount.innerHTML = `<div class="card" style="text-align:center;">${isLearningZh ? 'Không có từ nào trong bộ lọc này.' : '当前筛选下没有词卡。'}</div>`;
      return;
    }

    const item = this.filteredItems[this.flashcardIndex % this.filteredItems.length];
    const phonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
    const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
    const exTarget = isLearningZh ? item.example_zh : item.example_vi;
    const exNative = isLearningZh ? item.example_vi : item.example_zh;
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';
    const safeWord = item.word.replace(/'/g, "\\'");
    const isFav = window.StorageManager.getFavoriteIds().has(item.id);
    const isLearned = window.StorageManager.getLearnedIds().has(item.id);
    const zhRef = isLearningZh ? item.word : meaning;
    const sp = window.ChineseScriptEngine ? window.ChineseScriptEngine.getScriptPair(zhRef) : { simp: zhRef, trad: zhRef };

    mount.innerHTML = `
      <div class="flashcard-stage">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <span class="badge badge-indigo">Card ${this.flashcardIndex + 1} / ${this.filteredItems.length}</span>
          <div style="display:flex; gap:6px;">
            <span class="badge badge-indigo">🇨🇳 简: ${sp.simp}</span>
            <span class="badge" style="background:var(--brand-gold-soft); color:var(--brand-gold); font-weight:800;">🇹🇼 繁: ${sp.trad}</span>
            <span class="badge badge-jade">${isLearningZh ? item.topic_label_vi : item.topic_label_zh} (${item.level})</span>
          </div>
        </div>

        <div class="flashcard-3d-wrapper" id="activeFlashcard3D" onclick="this.classList.toggle('flipped')">
          <div class="flashcard-3d-inner">
            <!-- FRONT FACE -->
            <div class="flashcard-face flashcard-front">
              <span class="badge badge-rose" style="margin-bottom:16px;">${isLearningZh ? 'Nhấn vào thẻ để lật xem nghĩa & Mẹo nhớ ↺' : '点击卡片翻转查看释义与记忆窍门 ↺'}</span>
              <div style="font-size: 3.2rem; font-weight: 800; margin-bottom: 10px;">${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(item.word) : item.word}</div>
              <div style="display:flex; gap:10px;">
                <button type="button" class="btn btn-outline" onclick="event.stopPropagation(); AudioEngine.speak('${safeWord}', '${speechLang}', '${item.pronunciation}')">
                  🔊 ${isLearningZh ? 'Nghe phát âm' : '听标准发音'}
                </button>
                <button type="button" class="btn btn-outline" style="border-color:var(--brand-primary); color:var(--brand-primary);" onclick="event.stopPropagation(); window.DeepWordInsightEngine && window.DeepWordInsightEngine.openModal(${item.id})">
                  ✨ ${isLearningZh ? 'Giải mã thú vị' : '趣味解析'}
                </button>
              </div>
            </div>

            <!-- BACK FACE -->
            <div class="flashcard-face flashcard-back">
              <div style="font-size: 1.85rem; font-weight: 800;">${item.word} <span style="font-size:1rem; color:var(--brand-indigo);">(简:${sp.simp} / 繁:${sp.trad})</span></div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--brand-primary); margin: 4px 0;">${phonetic}</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-secondary); margin-bottom: 10px;">${meaning}</div>
              <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: 14px; width: 100%; font-size: 0.9rem;">
                <div style="font-weight: 700;">${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(exTarget) : exTarget}</div>
                <div style="color: var(--text-secondary); margin-top: 4px;">${exNative}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Action Row -->
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-bottom:18px;">
          <button type="button" class="btn btn-sm btn-outline" onclick="VocabularyController.prevFlashcard()">← ${isLearningZh ? 'Từ trước' : '上一张'}</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="AudioEngine.speak('${safeWord}', '${speechLang}', '${item.pronunciation}')">🔊 ${isLearningZh ? 'Nghe' : '发音'}</button>
          <button type="button" class="btn btn-sm btn-primary" onclick="window.DeepWordInsightEngine && window.DeepWordInsightEngine.openModal(${item.id})">✨ ${isLearningZh ? 'Giải mã SGK vs Đời thực' : '教科书 vs 现实解析'}</button>
          <button type="button" class="btn btn-sm ${isFav ? 'btn-primary' : 'btn-outline'}" onclick="VocabularyController.handleToggleFav(${item.id})">❤️ ${isLearningZh ? 'Yêu thích' : '收藏'}</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="VocabularyController.nextFlashcard()">${isLearningZh ? 'Từ tiếp' : '下一张'} →</button>
        </div>

        <!-- Spaced Repetition (SRS) 4-Level Rating -->
        <div class="card" style="padding: 18px; text-align: center;">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 8px;" data-i18n="srsPrompt">
            ${isLearningZh ? 'Đánh giá mức độ nhớ (Spaced Repetition SRS):' : '间隔重复记忆评分 (Spaced Repetition):'}
          </div>
          <div class="srs-rating-grid">
            <button type="button" class="srs-btn srs-1" onclick="VocabularyController.rateSrs(${item.id}, 1)">
              <span style="font-size:1.3rem;">❌</span>
              <span>${isLearningZh ? 'Chưa nhớ' : '未记住'}</span>
              <small style="color:var(--text-muted); font-size:0.72rem;">5 phút</small>
            </button>
            <button type="button" class="srs-btn srs-2" onclick="VocabularyController.rateSrs(${item.id}, 2)">
              <span style="font-size:1.3rem;">😐</span>
              <span>${isLearningZh ? 'Hơi nhớ' : '有点印象'}</span>
              <small style="color:var(--text-muted); font-size:0.72rem;">1 ngày</small>
            </button>
            <button type="button" class="srs-btn srs-3" onclick="VocabularyController.rateSrs(${item.id}, 3)">
              <span style="font-size:1.3rem;">😊</span>
              <span>${isLearningZh ? 'Nhớ' : '已记住'}</span>
              <small style="color:var(--text-muted); font-size:0.72rem;">3 ngày</small>
            </button>
            <button type="button" class="srs-btn srs-4" onclick="VocabularyController.rateSrs(${item.id}, 4)">
              <span style="font-size:1.3rem;">🔥</span>
              <span>${isLearningZh ? 'Rất nhớ' : '非常熟练'}</span>
              <small style="color:var(--text-muted); font-size:0.72rem;">7 ngày</small>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  rateSrs(id, rating) {
    window.StorageManager.recordSrsReview(id, rating);
    const labelsVi = { 1: '❌ Sẽ nhắc lại sau 5 phút', 2: '😐 Đã lên lịch ôn sau 1 ngày', 3: '😊 Đã thuộc! Ôn lại sau 3 ngày', 4: '🔥 Rất nhớ! Ôn lại sau 7 ngày' };
    const labelsZh = { 1: '❌ 5分钟后再次复习', 2: '😐 已安排1天后复习', 3: '😊 已掌握！3天后复习', 4: '🔥 非常熟练！7天后复习' };
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    window.AppUI.showToast(isLearningZh ? labelsVi[rating] : labelsZh[rating]);
    this.nextFlashcard();
  },

  nextFlashcard() {
    this.flashcardIndex = (this.flashcardIndex + 1) % Math.max(1, this.filteredItems.length);
    this.renderFlashcard();
  },

  prevFlashcard() {
    this.flashcardIndex = (this.flashcardIndex - 1 + this.filteredItems.length) % Math.max(1, this.filteredItems.length);
    this.renderFlashcard();
  },

  // ============================================================================
  // VOCABULARY DETAIL PAGE RENDERER (pages/vocabulary-detail.html)
  // ============================================================================
  async renderDetailPage() {
    const mount = document.getElementById('vocabDetailMount');
    if (!mount) return;

    const all = await window.DataService.getActiveVocabulary();
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id') || '1');
    const item = all.find(i => Number(i.id) === id) || all[0];
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';

    const phonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
    const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
    const exTarget = isLearningZh ? item.example_zh : item.example_vi;
    const exPy = isLearningZh ? item.example_pinyin : '';
    const exNative = isLearningZh ? item.example_vi : item.example_zh;
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';
    const related = all.filter(i => (i.topic_key || i.topic) === (item.topic_key || item.topic) && i.id !== item.id).slice(0, 6);
    const insight = window.DeepWordInsightEngine ? window.DeepWordInsightEngine.buildInsight(item, isLearningZh) : null;

    mount.innerHTML = `
      <div style="margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <a href="vocabulary.html" class="btn btn-sm btn-outline">← ${isLearningZh ? 'Quay lại kho từ vựng' : '返回词汇列表'}</a>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-sm btn-outline" onclick="window.ChineseScriptEngine && window.ChineseScriptEngine.setMode('simplified')">🇨🇳 Chữ Giản Thể (简体)</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="window.ChineseScriptEngine && window.ChineseScriptEngine.setMode('traditional')">🇹🇼 Chữ Phồn Thể (繁體)</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="window.ChineseScriptEngine && window.ChineseScriptEngine.setMode('both')">简+繁 Song hành</button>
        </div>
      </div>

      <div class="card" style="padding: 32px; margin-bottom: 28px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
              <span class="badge badge-rose">${item.level}</span>
              <span class="badge badge-indigo">${item.word_type}</span>
              <span class="badge badge-jade">${isLearningZh ? item.topic_label_vi : item.topic_label_zh}</span>
              ${insight ? `
                <span class="badge badge-indigo">🇨🇳 简体: ${insight.scriptPair.simp}</span>
                <span class="badge" style="background:var(--brand-gold-soft); color:var(--brand-gold); font-weight:800;">🇹🇼 繁體: ${insight.scriptPair.trad}</span>
              ` : ''}
            </div>
            <h1 style="font-size: 3rem; font-weight: 800; line-height: 1.15;">${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(item.word) : item.word}</h1>
            <div style="font-size: 1.45rem; font-weight: 700; color: var(--brand-primary); margin: 8px 0;">${phonetic}</div>
            <div style="font-size: 1.55rem; font-weight: 800; color: var(--brand-secondary);">${window.ChineseScriptEngine && !isLearningZh ? window.ChineseScriptEngine.formatText(meaning) : meaning}</div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" onclick="AudioEngine.speak('${item.word.replace(/'/g, "\\'")}', '${speechLang}', '${item.pronunciation}')">
              🔊 ${isLearningZh ? 'Nghe phát âm chuẩn' : '播放标准发音'}
            </button>
            <button type="button" class="btn btn-outline" onclick="window.StorageManager.toggleFavorite(${item.id}); VocabularyController.renderDetailPage();">
              ${window.StorageManager.getFavoriteIds().has(item.id) ? '❤️ Đã thích' : '🤍 Yêu thích'}
            </button>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border-color); margin: 24px 0;" />

        ${insight ? `
          <!-- Layer 1: Word DNA & Memory Hook -->
          <div style="background:var(--brand-primary-soft); border-left:5px solid var(--brand-primary); padding:18px 20px; border-radius:14px; margin-bottom:20px;">
            <h3 style="color:var(--brand-primary); margin-bottom:6px;">🧬 1. Giải mã Gốc từ & Mẹo nhớ 1 lần thuộc ngay</h3>
            <p style="font-size:1rem; line-height:1.7;">${insight.memoryHook}</p>
          </div>

          <!-- Layer 2: Textbook (SGK) vs Street/Office Real-Life -->
          <h3 style="margin-bottom: 12px;">🎭 2. So sánh: Trong Sách Giáo Khoa (SGK) vs Ngoài Đời Thực</h3>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:16px; margin-bottom:22px;">
            <div style="background:var(--bg-primary); border:1.5px solid var(--border-color); padding:18px; border-radius:16px; line-height:1.65;">
              ${insight.textbookStyle}
            </div>
            <div style="background:var(--brand-secondary-soft); border:1.5px solid rgba(5,150,105,0.35); padding:18px; border-radius:16px; line-height:1.65;">
              ${insight.streetRealLife}
            </div>
          </div>

          <!-- Layer 3: Interactive Mini Real-Life Chat -->
          <h3 style="margin-bottom: 12px;">💬 3. Đoạn Chat Thực Chiến (WeChat / LINE / Zalo)</h3>
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:22px;">
            ${insight.miniDialogue.map(line => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; background:var(--bg-primary); padding:14px 18px; border-radius:14px; border:1px solid var(--border-color);">
                <div>
                  <span class="badge badge-rose" style="margin-bottom:4px;">${line.speaker}</span>
                  <div style="font-weight:800; font-size:1.08rem; margin-top:4px;">${window.ChineseScriptEngine ? window.ChineseScriptEngine.formatText(line.target) : line.target}</div>
                  <div style="color:var(--text-secondary); font-size:0.92rem;">${line.sub}</div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick="AudioEngine.speak('${line.target.replace(/'/g, "\\'")}', '${line.lang}')">🔊 Nghe</button>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <h3 style="margin-bottom: 12px;">📝 ${isLearningZh ? 'Câu ví dụ & Ghi chú bổ sung' : '标准语境例句与备注'}</h3>
        <div class="vocab-example-box" style="font-size: 1.05rem; padding: 18px;">
          <div class="ex-target" style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <span>${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(exTarget) : exTarget}</span>
            <button type="button" class="btn btn-sm btn-outline" onclick="AudioEngine.speak('${exTarget.replace(/'/g, "\\'")}', '${speechLang}')">🔊 ${isLearningZh ? 'Nghe câu' : '听例句'}</button>
          </div>
          ${exPy ? `<div class="ex-py" style="font-size:0.95rem; margin:6px 0;">${exPy}</div>` : ''}
          <div class="ex-native" style="margin-top:4px;">${exNative}</div>
        </div>
      </div>

      <h3 style="margin-bottom: 16px;">🔗 ${isLearningZh ? 'Từ vựng cùng chủ đề' : '同主题相关词汇'}</h3>
      <div class="vocab-grid">
        ${related.map(r => `
          <a href="vocabulary-detail.html?id=${r.id}" class="vocab-card">
            <div class="vocab-word-main" style="font-size:1.4rem;">${window.ChineseScriptEngine && isLearningZh ? window.ChineseScriptEngine.formatText(r.word) : r.word}</div>
            <div class="vocab-pinyin">${isLearningZh ? r.pinyin : r.pronunciation_guide}</div>
            <div class="vocab-meaning">${isLearningZh ? r.meaning_vi : r.meaning_zh}</div>
          </a>
        `).join('')}
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VocabularyController.init();
});

window.VocabularyController = VocabularyController;
