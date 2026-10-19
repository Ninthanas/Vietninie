// ============================================================================
// VIETNINIE - SPECIALIZED VOCABULARY & WORKPLACE CHINESE CONTROLLER
// Supports: Game, Project Management (PM), Cross-team Comm, Market Research,
// Tools & Documentation, Interview Competencies, Marketing & Sales.
// ============================================================================

const SpecializedController = {
  data: null,
  activeMode: 'list', // 'list' | 'interview' | 'cheatsheet' | 'flashcard'
  selectedCategory: 'all',
  searchQuery: '',
  flashcardIndex: 0,
  flashcardDeck: [],
  isCardFlipped: false,

  async init() {
    await this.loadData();
    this.bindEvents();
    this.renderCategoryBar();
    this.renderCurrentView();
  },

  async loadData() {
    if (window.SPECIALIZED_VOCAB_DATA) {
      this.data = window.SPECIALIZED_VOCAB_DATA;
      return;
    }

    try {
      const res = await fetch('../data/specialized-vocabulary.json');
      if (res.ok) {
        this.data = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch specialized-vocabulary.json, fallback to global bundle');
    }

    if (!this.data && window.__SENTRUC_DATA__ && window.__SENTRUC_DATA__.specializedVocabulary) {
      this.data = window.__SENTRUC_DATA__.specializedVocabulary;
    }
  },

  bindEvents() {
    // Mode tabs
    const modeTabs = document.querySelectorAll('.spec-mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const mode = tab.dataset.mode;
        this.setMode(mode);
      });
    });

    // Search input
    const searchInput = document.getElementById('specSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderCurrentView();
      });
    }

    // Keyboard support for flashcards
    window.addEventListener('keydown', (e) => {
      if (this.activeMode !== 'flashcard') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.flipCard();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.nextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.prevCard();
      }
    });
  },

  setMode(mode) {
    this.activeMode = mode;
    document.querySelectorAll('.spec-mode-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === mode);
    });

    const filterArea = document.getElementById('specFilterArea');
    if (filterArea) {
      // In interview or cheatsheet mode, category pills can still filter or be hidden if not needed
      filterArea.style.display = (mode === 'list' || mode === 'flashcard') ? 'block' : 'none';
    }

    if (mode === 'flashcard') {
      this.initFlashcardDeck();
    }

    this.renderCurrentView();
  },

  setCategory(catId) {
    this.selectedCategory = catId;
    document.querySelectorAll('.spec-cat-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.cat === catId);
    });

    if (this.activeMode === 'flashcard') {
      this.initFlashcardDeck();
    }

    this.renderCurrentView();
  },

  renderCategoryBar() {
    const mount = document.getElementById('specCategoryPillsMount');
    if (!mount || !this.data) return;

    const totalWords = (this.data.words || []).length;
    let html = `
      <button type="button" class="spec-cat-pill ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="SpecializedController.setCategory('all')">
        <span>🌟 Tất cả</span>
        <span class="cat-count">${totalWords}</span>
      </button>
    `;

    (this.data.categories || []).forEach(cat => {
      const count = (this.data.words || []).filter(w => w.category === cat.id).length;
      html += `
        <button type="button" class="spec-cat-pill ${this.selectedCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}" onclick="SpecializedController.setCategory('${cat.id}')">
          <span>${cat.icon} ${cat.name_vi}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    });

    mount.innerHTML = html;
  },

  getFilteredWords() {
    if (!this.data || !this.data.words) return [];
    return this.data.words.filter(w => {
      const matchesCat = this.selectedCategory === 'all' || w.category === this.selectedCategory;
      if (!matchesCat) return false;

      if (!this.searchQuery) return true;
      const q = this.searchQuery;
      return (
        w.zh.toLowerCase().includes(q) ||
        (w.zh_tw && w.zh_tw.toLowerCase().includes(q)) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.vi.toLowerCase().includes(q) ||
        (w.explanation && w.explanation.toLowerCase().includes(q))
      );
    });
  },

  renderCurrentView() {
    const stage = document.getElementById('specMainStage');
    if (!stage) return;

    switch (this.activeMode) {
      case 'list':
        this.renderListView(stage);
        break;
      case 'interview':
        this.renderInterviewView(stage);
        break;
      case 'cheatsheet':
        this.renderCheatsheetView(stage);
        break;
      case 'flashcard':
        this.renderFlashcardView(stage);
        break;
    }
  },

  // 1. LIST VIEW
  renderListView(stage) {
    const words = this.getFilteredWords();

    if (!words.length) {
      stage.innerHTML = `
        <div style="text-align:center; padding:60px 20px; background:var(--bg-primary); border-radius:16px; border:1px dashed var(--border-color);">
          <div style="font-size:3rem; margin-bottom:12px;">🔍</div>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Không tìm thấy thuật ngữ phù hợp</h3>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Hãy thử tìm từ khóa khác (ví dụ: game, Jira, deadline, phỏng vấn...)</p>
          <button type="button" class="btn btn-outline btn-sm" onclick="SpecializedController.resetSearch()" style="margin-top:14px;">Xóa bộ lọc tìm kiếm</button>
        </div>
      `;
      return;
    }

    const scriptMode = window.ChineseScriptEngine ? window.ChineseScriptEngine.getMode() : 'simplified';

    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:0.92rem; font-weight:700; color:var(--text-secondary);">
          Hiển thị <strong>${words.length}</strong> thuật ngữ chuyên ngành
        </span>
        <span style="font-size:0.85rem; color:var(--text-muted);">
          Bấm 🔊 để nghe phát âm • 📋 để sao chép
        </span>
      </div>
      <div class="spec-grid">
    `;

    words.forEach(w => {
      const catObj = (this.data.categories || []).find(c => c.id === w.category);
      const catBadge = catObj ? `${catObj.icon} ${catObj.name_vi.split('&')[0]}` : w.category;

      let displayZh = w.zh;
      let displaySubZh = '';
      if (scriptMode === 'traditional' && w.zh_tw) {
        displayZh = w.zh_tw;
        displaySubZh = `(Giản: ${w.zh})`;
      } else if (scriptMode === 'both' && w.zh_tw && w.zh_tw !== w.zh) {
        displaySubZh = `[繁 ${w.zh_tw}]`;
      } else if (w.zh_tw && w.zh_tw !== w.zh) {
        displaySubZh = `[繁 ${w.zh_tw}]`;
      }

      html += `
        <div class="spec-card">
          <div class="spec-card-header">
            <span class="spec-card-cat-badge">${catBadge}</span>
            <div class="spec-card-actions">
              <button type="button" class="spec-action-btn" title="Nghe phát âm chuẩn" onclick="SpecializedController.speak('${w.zh}')">
                🔊
              </button>
              <button type="button" class="spec-action-btn" title="Sao chép từ" onclick="SpecializedController.copyText('${w.zh}', this)">
                📋
              </button>
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <div class="spec-word-main">
              ${displayZh}
              ${displaySubZh ? `<span class="spec-word-tw">${displaySubZh}</span>` : ''}
            </div>
            <div class="spec-pinyin">${w.pinyin}</div>
          </div>

          <div class="spec-meaning">${w.vi}</div>

          ${w.explanation ? `
            <div class="spec-note-box">
              💡 ${w.explanation}
            </div>
          ` : ''}

          ${w.example && w.example.zh ? `
            <div class="spec-example-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.75rem; font-weight:800; color:var(--brand-primary); text-transform:uppercase;">Ví dụ công sở</span>
                <button type="button" style="background:none; border:none; cursor:pointer; font-size:0.8rem; color:var(--brand-primary);" onclick="SpecializedController.speak('${w.example.zh.replace(/'/g, "\\'")}')" title="Nghe câu ví dụ">
                  🔊 Nghe câu
                </button>
              </div>
              <div class="spec-eg-zh">${w.example.zh}</div>
              ${w.example.pinyin ? `<div class="spec-eg-py">${w.example.pinyin}</div>` : ''}
              ${w.example.vi ? `<div class="spec-eg-vi">${w.example.vi}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    stage.innerHTML = html;
  },

  // 2. INTERVIEW SCENARIOS VIEW
  renderInterviewView(stage) {
    if (!this.data || !this.data.interview_scenarios) {
      stage.innerHTML = `<p>Đang tải dữ liệu phỏng vấn...</p>`;
      return;
    }

    const scriptMode = window.ChineseScriptEngine ? window.ChineseScriptEngine.getMode() : 'simplified';

    let html = `
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.35rem; font-weight:900; color:var(--text-primary); margin-bottom:6px;">
          🎙️ Kịch Bản Phỏng Vấn & Xử Lý Tình Huống Công Sở
        </h2>
        <p style="color:var(--text-secondary); font-size:0.95rem;">
          Các tình huống thực chiến kinh điển khi phỏng vấn công ty game / dự án Trung Quốc: Giới thiệu chuyên môn, xử lý thiếu thông tin, và quy trình phân tích tựa game mới.
        </p>
      </div>
    `;

    this.data.interview_scenarios.forEach((sc, idx) => {
      let answerZh = (scriptMode === 'traditional' && sc.answer_zh_tw) ? sc.answer_zh_tw : sc.answer_zh;

      html += `
        <div class="interview-scenario-card">
          <div class="interview-badge">
            <span>🎯 Tình huống ${idx + 1}: ${sc.topic_vi}</span>
          </div>

          <div class="scenario-qa-box">
            <!-- Question Box -->
            <div class="scenario-q">
              <div class="scenario-q-label">❓ Câu hỏi của Nhà tuyển dụng / Đối tác (Interview Question):</div>
              <div class="scenario-q-text">${sc.question_zh}</div>
              <div style="font-size:0.88rem; color:#92400E; margin-top:4px;">${sc.question_vi}</div>
              <div style="margin-top:8px;">
                <button type="button" class="btn btn-sm btn-outline" style="border-color:#F59E0B; color:#B45309; padding:4px 10px; font-size:0.8rem;" onclick="SpecializedController.speak('${sc.question_zh.replace(/'/g, "\\'")}')">
                  🔊 Nghe câu hỏi
                </button>
              </div>
            </div>

            <!-- Model Answer Box -->
            <div class="scenario-a">
              <div class="scenario-a-header">
                <span class="scenario-a-label">⭐ Câu trả lời mẫu ghi điểm (Model Answer):</span>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn btn-sm" style="background:#15803D; color:#FFFFFF; padding:4px 12px; font-size:0.82rem;" onclick="SpecializedController.speak('${sc.answer_zh.replace(/'/g, "\\'")}')">
                    🔊 Nghe toàn bộ câu trả lời
                  </button>
                  <button type="button" class="btn btn-sm btn-outline" style="border-color:#15803D; color:#15803D; padding:4px 10px; font-size:0.82rem;" onclick="SpecializedController.copyText('${sc.answer_zh.replace(/'/g, "\\'")}', this)">
                    📋 Sao chép
                  </button>
                </div>
              </div>

              <div class="scenario-a-text">${answerZh}</div>
              <div class="scenario-a-pinyin">${sc.answer_pinyin}</div>
              <div class="scenario-a-vi">👉 ${sc.answer_vi}</div>
            </div>
          </div>

          ${sc.tips_vi ? `
            <div class="scenario-tips">
              <span style="font-size:1.1rem;">💡</span>
              <div>
                <strong>Mẹo ứng xử phỏng vấn:</strong> ${sc.tips_vi}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });

    stage.innerHTML = html;
  },

  // 3. CHEATSHEET VIEW (Game Core Roles + 8 PM Phrases + Tools Table)
  renderCheatsheetView(stage) {
    if (!this.data) return;

    const scriptMode = window.ChineseScriptEngine ? window.ChineseScriptEngine.getMode() : 'simplified';
    const gameCore = this.data.game_core_distinction;
    const pmPhrases = this.data.pm_action_phrases || [];
    const tools = this.data.workplace_tools || [];

    let html = `
      <div style="margin-bottom:28px;">
        <h2 style="font-size:1.35rem; font-weight:900; color:var(--text-primary); margin-bottom:6px;">
          🛠️ Cẩm Nang Tra Cứu: Ngành Game, Quản Lý Dự Án & Công Cụ
        </h2>
        <p style="color:var(--text-secondary); font-size:0.95rem;">
          Được tổng hợp dành riêng cho các bạn làm việc trực tiếp với đối tác Trung Quốc, Game Studio, quản lý dự án và công nghệ.
        </p>
      </div>
    `;

    // 1. Phân biệt 开发 vs 发行 vs 运营
    if (gameCore) {
      html += `
        <div style="margin-bottom:36px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">
              🎮 1. Phân biệt 3 vị trí cốt lõi trong ngành Game
            </h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">${gameCore.title_zh}</span>
          </div>

          <div class="game-distinction-grid">
      `;

      const roleClasses = ['role-kaifa', 'role-faxing', 'role-yunying'];
      (gameCore.roles || []).forEach((role, i) => {
        const cls = roleClasses[i] || '';
        const roleZh = (scriptMode === 'traditional' && role.zh_tw) ? role.zh_tw : role.zh;

        html += `
          <div class="distinction-card ${cls}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div class="distinction-zh">
                ${roleZh}
                <span style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">${role.pinyin}</span>
              </div>
              <button type="button" class="spec-action-btn" onclick="SpecializedController.speak('${role.zh}')" title="Nghe phát âm">
                🔊
              </button>
            </div>
            <div class="distinction-vi">${role.role_vi}</div>
            <p class="distinction-desc">${role.desc_vi}</p>
            <div class="distinction-keywords">
              ${(role.keywords || []).map(kw => `<span class="kw-badge">${kw}</span>`).join('')}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // 2. 8 Cụm từ PM Dùng Ngay
    if (pmPhrases.length) {
      html += `
        <div style="margin-bottom:36px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">
              📋 2. Tám (8) Cụm Từ PM & Điều Phối Nên Dùng Được Ngay
            </h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">项目日常高频短语</span>
          </div>

          <div class="pm-phrases-grid">
      `;

      pmPhrases.forEach(p => {
        const phraseZh = (scriptMode === 'traditional' && p.zh_tw) ? p.zh_tw : p.zh;
        html += `
          <div class="pm-phrase-card">
            <div>
              <div class="pm-phrase-top">
                <div class="pm-phrase-zh">${phraseZh}</div>
                <button type="button" class="spec-action-btn" onclick="SpecializedController.speak('${p.zh}')" title="Nghe phát âm">
                  🔊
                </button>
              </div>
              <div style="font-size:0.85rem; color:var(--brand-secondary); font-weight:700; margin-bottom:4px;">${p.pinyin}</div>
              <div class="pm-phrase-vi">${p.vi}</div>
            </div>
            <div class="pm-phrase-ctx">
              💡 ${p.context_vi}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // 3. Bảng công cụ làm việc
    if (tools.length) {
      html += `
        <div style="margin-bottom:36px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">
              📁 3. Tên Các Công Cụ Văn Phòng & Phần Mềm Trong Tiếng Trung
            </h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">常用办公与协作工具称谓</span>
          </div>

          <div class="spec-tools-table-wrap">
            <table class="spec-tools-table">
              <thead>
                <tr>
                  <th style="width:18%;">Tên công cụ</th>
                  <th style="width:28%;">Tiếng Trung & Pinyin</th>
                  <th style="width:44%;">Ứng dụng thực tế trong công việc</th>
                  <th style="width:10%; text-align:center;">Âm thanh</th>
                </tr>
              </thead>
              <tbody>
      `;

      tools.forEach(t => {
        const toolZh = (scriptMode === 'traditional' && t.zh_tw) ? t.zh_tw : t.zh;
        html += `
          <tr>
            <td>
              <strong style="color:var(--brand-primary); font-size:1rem;">${t.tool}</strong>
            </td>
            <td>
              <div style="font-weight:800; font-size:1rem; color:var(--text-primary);">${toolZh}</div>
              <small style="color:var(--text-secondary); font-size:0.82rem;">${t.pinyin}</small>
            </td>
            <td style="color:var(--text-secondary); line-height:1.5;">
              ${t.usage_vi}
            </td>
            <td style="text-align:center;">
              <button type="button" class="spec-action-btn" onclick="SpecializedController.speak('${t.zh.split('/')[1] ? t.zh.split('/')[1].trim() : t.zh}')" title="Nghe cách gọi">
                🔊
              </button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    stage.innerHTML = html;
  },

  // 4. FLASHCARD 3D VIEW
  initFlashcardDeck() {
    this.flashcardDeck = this.getFilteredWords();
    this.flashcardIndex = 0;
    this.isCardFlipped = false;
  },

  flipCard() {
    this.isCardFlipped = !this.isCardFlipped;
    const box = document.getElementById('specFlashcardBox');
    if (box) {
      box.classList.toggle('flipped', this.isCardFlipped);
    }
  },

  nextCard() {
    if (!this.flashcardDeck.length) return;
    this.isCardFlipped = false;
    this.flashcardIndex = (this.flashcardIndex + 1) % this.flashcardDeck.length;
    this.renderFlashcardView(document.getElementById('specMainStage'));
  },

  prevCard() {
    if (!this.flashcardDeck.length) return;
    this.isCardFlipped = false;
    this.flashcardIndex = (this.flashcardIndex - 1 + this.flashcardDeck.length) % this.flashcardDeck.length;
    this.renderFlashcardView(document.getElementById('specMainStage'));
  },

  shuffleDeck() {
    for (let i = this.flashcardDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.flashcardDeck[i], this.flashcardDeck[j]] = [this.flashcardDeck[j], this.flashcardDeck[i]];
    }
    this.flashcardIndex = 0;
    this.isCardFlipped = false;
    this.renderFlashcardView(document.getElementById('specMainStage'));
  },

  renderFlashcardView(stage) {
    if (!this.flashcardDeck.length) {
      this.initFlashcardDeck();
    }

    const total = this.flashcardDeck.length;
    if (!total) {
      stage.innerHTML = `
        <div style="text-align:center; padding:60px 20px;">
          <h3>Không có thẻ từ vựng nào trong danh mục này.</h3>
        </div>
      `;
      return;
    }

    const currentWord = this.flashcardDeck[this.flashcardIndex];
    const scriptMode = window.ChineseScriptEngine ? window.ChineseScriptEngine.getMode() : 'simplified';
    let displayZh = (scriptMode === 'traditional' && currentWord.zh_tw) ? currentWord.zh_tw : currentWord.zh;

    stage.innerHTML = `
      <div class="spec-flashcard-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span style="font-size:0.9rem; font-weight:800; color:var(--text-secondary);">
            Thẻ <strong>${this.flashcardIndex + 1}</strong> / ${total}
          </span>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-sm btn-outline" onclick="SpecializedController.shuffleDeck()" title="Xáo trộn thẻ">
              🔀 Xáo thẻ
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="SpecializedController.speak('${currentWord.zh}')" title="Nghe phát âm">
              🔊 Nghe
            </button>
          </div>
        </div>

        <div id="specFlashcardBox" class="spec-flashcard-box ${this.isCardFlipped ? 'flipped' : ''}" onclick="SpecializedController.flipCard()">
          <!-- FRONT FACE -->
          <div class="spec-card-face spec-card-front">
            <span style="font-size:0.8rem; font-weight:800; padding:4px 12px; border-radius:999px; background:var(--bg-secondary); color:var(--text-secondary); margin-bottom:20px;">
              ${currentWord.category.toUpperCase()}
            </span>
            <div style="font-size:3.2rem; font-weight:900; color:var(--brand-primary); margin-bottom:12px; line-height:1.2;">
              ${displayZh}
            </div>
            <div style="font-size:1.3rem; font-weight:700; color:var(--brand-secondary); margin-bottom:24px;">
              ${currentWord.pinyin}
            </div>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              👆 Nhấp thẻ hoặc bấm [Phím Cách] để lật xem nghĩa & ví dụ
            </p>
          </div>

          <!-- BACK FACE -->
          <div class="spec-card-face spec-card-back">
            <div style="font-size:1.8rem; font-weight:900; color:var(--text-primary); margin-bottom:8px;">
              ${currentWord.vi}
            </div>
            <div style="font-size:1rem; font-weight:700; color:var(--brand-secondary); margin-bottom:18px;">
              ${displayZh} (${currentWord.pinyin})
            </div>

            ${currentWord.explanation ? `
              <div style="background:var(--bg-secondary); border-radius:10px; padding:12px 16px; font-size:0.88rem; color:var(--text-secondary); text-align:left; line-height:1.5; margin-bottom:14px; width:100%;">
                💡 ${currentWord.explanation}
              </div>
            ` : ''}

            ${currentWord.example && currentWord.example.zh ? `
              <div style="border-top:1px dashed var(--border-color); padding-top:10px; width:100%; text-align:left; font-size:0.86rem;">
                <div style="font-weight:700; color:var(--text-primary);">${currentWord.example.zh}</div>
                <div style="color:var(--text-muted); font-size:0.82rem; margin-top:2px;">${currentWord.example.vi || ''}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="flashcard-nav-row">
          <button type="button" class="btn btn-outline" style="padding:10px 24px;" onclick="SpecializedController.prevCard()">
            ← Thẻ trước
          </button>
          <button type="button" class="btn btn-primary" style="padding:10px 32px;" onclick="SpecializedController.flipCard()">
            🔄 Lật mặt thẻ
          </button>
          <button type="button" class="btn btn-outline" style="padding:10px 24px;" onclick="SpecializedController.nextCard()">
            Thẻ sau →
          </button>
        </div>
      </div>
    `;
  },

  speak(text) {
    if (!text) return;
    if (window.AudioEngine && typeof window.AudioEngine.speak === 'function') {
      window.AudioEngine.speak(text, 'zh-CN');
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  },

  copyText(text, btnEl) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (btnEl) {
        const original = btnEl.innerHTML;
        btnEl.innerHTML = '✓';
        btnEl.style.background = '#10B981';
        btnEl.style.color = '#FFFFFF';
        setTimeout(() => {
          btnEl.innerHTML = original;
          btnEl.style.background = '';
          btnEl.style.color = '';
        }, 1500);
      }
      if (window.AppUI && typeof window.AppUI.showToast === 'function') {
        window.AppUI.showToast(`Đã sao chép: "${text}"`);
      }
    });
  },

  resetSearch() {
    this.searchQuery = '';
    const input = document.getElementById('specSearchInput');
    if (input) input.value = '';
    this.selectedCategory = 'all';
    this.renderCategoryBar();
    this.renderCurrentView();
  }
};

window.SpecializedController = SpecializedController;

document.addEventListener('DOMContentLoaded', () => {
  SpecializedController.init();
});
