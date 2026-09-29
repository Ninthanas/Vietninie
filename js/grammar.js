// ============================================================================
// GRAMMAR, CONVERSATION & LISTENING CONTROLLER
// ============================================================================
const GrammarAndDialogueController = {
  grammarList: [],
  activeGrammarIndex: 0,
  conversations: [],
  activeConvIndex: 0,
  showPinyin: true,
  showTranslation: true,
  listeningIdx: 0,
  listeningItems: [],

  async init() {
    if (document.getElementById('grammarSidebarMount')) {
      await this.initGrammarPage();
      window.addEventListener('sentruc:lang-changed', () => this.initGrammarPage());
    }

    if (document.getElementById('conversationSidebarMount')) {
      await this.initConversationPage();
      window.addEventListener('sentruc:lang-changed', () => this.initConversationPage());
    }

    if (document.getElementById('listeningArenaMount')) {
      await this.initListeningPage();
      window.addEventListener('sentruc:lang-changed', () => this.initListeningPage());
    }
  },

  // ============================================================================
  // 1. GRAMMAR PAGE
  // ============================================================================
  async initGrammarPage() {
    this.grammarList = await window.DataService.getActiveGrammar();
    this.activeGrammarIndex = 0;
    this.renderGrammarSidebar();
    this.renderGrammarDetail();
  },

  renderGrammarSidebar() {
    const sb = document.getElementById('grammarSidebarMount');
    if (!sb) return;
    sb.innerHTML = this.grammarList.map((g, idx) => `
      <div class="grammar-nav-item ${idx === this.activeGrammarIndex ? 'active' : ''}" onclick="GrammarAndDialogueController.selectGrammar(${idx})">
        <span>${g.id}. ${g.title}</span>
        <span class="badge badge-rose">${g.level}</span>
      </div>
    `).join('');
  },

  selectGrammar(idx) {
    this.activeGrammarIndex = idx;
    this.renderGrammarSidebar();
    this.renderGrammarDetail();
  },

  renderGrammarDetail() {
    const mount = document.getElementById('grammarDetailMount');
    if (!mount || !this.grammarList.length) return;
    const g = this.grammarList[this.activeGrammarIndex];
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';

    mount.innerHTML = `
      <div class="grammar-detail-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <span class="badge badge-rose">${g.level}</span>
          <span style="color:var(--text-muted); font-size:0.86rem;">Chuyên đề ${g.id} / ${this.grammarList.length}</span>
        </div>
        <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 12px;">${g.title}</h2>

        <div class="formula-banner">
          📐 ${isLearningZh ? 'Công thức cấu trúc:' : '核心句型公式：'} <br/>
          <span style="color:var(--brand-primary);">${g.pattern}</span>
        </div>

        <h3 style="margin: 20px 0 10px;">💡 ${isLearningZh ? 'Giải thích chi tiết & Lưu ý' : '语法详解与避坑指南'}</h3>
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.7;">${g.explanation}</p>

        <h3 style="margin: 24px 0 12px;">🗣️ ${isLearningZh ? 'Ví dụ ứng dụng thực tế' : '典型双语例句'}</h3>
        <div class="example-card-list">
          ${g.examples.map(ex => {
            const targetLine = isLearningZh ? ex.zh : ex.vi;
            const nativeLine = isLearningZh ? ex.vi : ex.zh;
            return `
              <div class="example-item-row">
                <div>
                  <div style="font-size: 1.2rem; font-weight: 800;">${targetLine}</div>
                  <div style="color: var(--brand-primary); font-weight: 600; font-size: 0.92rem; margin: 4px 0;">${ex.pinyin || ''}</div>
                  <div style="color: var(--text-secondary);">${nativeLine}</div>
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick="AudioEngine.speak('${targetLine.replace(/'/g, "\\'")}', '${speechLang}')">
                  🔊 ${isLearningZh ? 'Nghe' : '发音'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Mini Quiz Exercise inside Grammar Lesson -->
        ${g.quiz ? `
          <div class="card" style="background: var(--bg-primary); margin-top: 28px;">
            <h4 style="margin-bottom: 10px;">🎯 ${isLearningZh ? 'Bài tập kiểm tra nhanh' : '随堂即时测验'}</h4>
            <p style="font-weight: 700; margin-bottom: 14px;">${g.quiz.question}</p>
            <div class="quiz-options-grid">
              ${g.quiz.options.map((opt, oIdx) => `
                <button type="button" class="quiz-opt-btn" onclick="GrammarAndDialogueController.checkGrammarQuiz(this, ${oIdx}, ${g.quiz.answerIndex}, '${(g.quiz.explanation || '').replace(/'/g, "\\'")}')">
                  ${String.fromCharCode(65 + oIdx)}. ${opt}
                </button>
              `).join('')}
            </div>
            <div id="grammarQuizFeedback" style="margin-top: 14px; font-weight: 700; display:none;"></div>
          </div>
        ` : ''}
      </div>
    `;
  },

  checkGrammarQuiz(btnEl, selectedIdx, correctIdx, explanation) {
    const parent = btnEl.parentElement;
    parent.querySelectorAll('.quiz-opt-btn').forEach((b, i) => {
      b.disabled = true;
      if (i === correctIdx) b.classList.add('correct');
      else if (i === selectedIdx) b.classList.add('wrong');
    });
    const fb = document.getElementById('grammarQuizFeedback');
    if (fb) {
      fb.style.display = 'block';
      const isCorrect = selectedIdx === correctIdx;
      fb.style.color = isCorrect ? '#059669' : '#DC2626';
      fb.innerHTML = `${isCorrect ? '🎉 Chính xác! / 回答正确！' : '💡 Chưa đúng / 回答有误：'} ${explanation}`;
    }
  },

  // ============================================================================
  // 2. CONVERSATION PAGE (17 SITUATIONS)
  // ============================================================================
  async initConversationPage() {
    this.conversations = await window.DataService.getConversations();
    this.activeConvIndex = 0;
    this.renderConversationSidebar();
    this.renderConversationStream();
  },

  renderConversationSidebar() {
    const sb = document.getElementById('conversationSidebarMount');
    if (!sb) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    sb.innerHTML = this.conversations.map((c, idx) => `
      <div class="grammar-nav-item ${idx === this.activeConvIndex ? 'active' : ''}" onclick="GrammarAndDialogueController.selectConversation(${idx})">
        <span>${isLearningZh ? c.title_vi : c.title_zh}</span>
        <span class="badge badge-jade">${c.level.split('/')[0]}</span>
      </div>
    `).join('');
  },

  selectConversation(idx) {
    this.activeConvIndex = idx;
    this.renderConversationSidebar();
    this.renderConversationStream();
  },

  togglePinyin() {
    this.showPinyin = !this.showPinyin;
    this.renderConversationStream();
  },

  toggleTranslation() {
    this.showTranslation = !this.showTranslation;
    this.renderConversationStream();
  },

  playFullConversation() {
    const conv = this.conversations[this.activeConvIndex];
    if (!conv) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';
    const fullText = conv.lines.map(l => isLearningZh ? l.zh : l.vi).join('。 ');
    window.AudioEngine.speak(fullText, speechLang);
  },

  renderConversationStream() {
    const mount = document.getElementById('conversationStreamMount');
    if (!mount || !this.conversations.length) return;
    const c = this.conversations[this.activeConvIndex];
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';

    mount.innerHTML = `
      <div class="grammar-detail-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <span class="badge badge-rose">${c.level}</span>
            <h2 style="font-size: 1.65rem; font-weight: 800; margin-top: 8px;">${isLearningZh ? c.title_vi : c.title_zh}</h2>
            <p style="color: var(--text-secondary); font-size: 0.94rem;">${isLearningZh ? c.scenario_vi : c.scenario_zh}</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="GrammarAndDialogueController.playFullConversation()">
              ▶️ ${isLearningZh ? 'Nghe toàn bộ hội thoại' : '播放完整对话'}
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="GrammarAndDialogueController.togglePinyin()">
              ${this.showPinyin ? '🙈 Ẩn Pinyin' : '👁️ Hiện Pinyin'}
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="GrammarAndDialogueController.toggleTranslation()">
              ${this.showTranslation ? '🙈 Ẩn bản dịch' : '👁️ Hiện bản dịch'}
            </button>
          </div>
        </div>

        <div class="dialogue-stream">
          ${c.lines.map(line => {
            const primaryText = isLearningZh ? line.zh : line.vi;
            const secondaryText = isLearningZh ? line.vi : line.zh;
            const safeLine = primaryText.replace(/'/g, "\\'");
            return `
              <div class="chat-bubble-row speaker-${line.speaker}">
                <div class="speaker-avatar">${line.name[0]}</div>
                <div class="chat-bubble">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:4px;">
                    <strong style="font-size:0.82rem; color:var(--text-muted);">${line.name}</strong>
                    <button type="button" class="action-icon-btn" onclick="AudioEngine.speak('${safeLine}', '${speechLang}')">
                      🔊 ${isLearningZh ? 'Nghe câu' : '听本句'}
                    </button>
                  </div>
                  <div style="font-size: 1.18rem; font-weight: 800;">${primaryText}</div>
                  ${this.showPinyin ? `<div style="color: var(--brand-primary); font-size: 0.92rem; font-weight: 600; margin-top: 3px;">${line.pinyin}</div>` : ''}
                  ${this.showTranslation ? `<div style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-color);">${secondaryText}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ============================================================================
  // 3. LISTENING PAGE (AUDIO COMPREHENSION & DICTATION)
  // ============================================================================
  async initListeningPage() {
    const vocab = await window.DataService.getActiveVocabulary();
    this.listeningItems = vocab.slice(0, 60);
    this.listeningIdx = 0;
    this.renderListeningChallenge();
  },

  renderListeningChallenge() {
    const mount = document.getElementById('listeningArenaMount');
    if (!mount || !this.listeningItems.length) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';

    const current = this.listeningItems[this.listeningIdx % this.listeningItems.length];
    const distractors = this.listeningItems
      .filter(i => i.id !== current.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const options = [current, ...distractors].sort(() => 0.5 - Math.random());
    const safeWord = current.word.replace(/'/g, "\\'");
    const safeSentence = (isLearningZh ? current.example_zh : current.example_vi).replace(/'/g, "\\'");

    mount.innerHTML = `
      <div class="quiz-arena" style="text-align:center;">
        <span class="badge badge-jade">Bài luyện nghe ${this.listeningIdx + 1} / ${this.listeningItems.length}</span>
        <h2 style="margin: 14px 0 8px;">🎧 ${isLearningZh ? 'Nghe phát âm và chọn từ + nghĩa đúng' : '听标准发音并选择正确词条'}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 22px;">
          ${isLearningZh ? 'Bấm nút loa bên dưới để nghe từ vựng hoặc câu ví dụ:' : '点击下方扬声器按钮聆听词汇或完整例句：'}
        </p>

        <div style="display:flex; justify-content:center; gap:14px; margin-bottom: 24px;">
          <button type="button" class="btn btn-primary" style="padding: 16px 28px; font-size: 1.08rem;" onclick="AudioEngine.speak('${safeWord}', '${speechLang}', '${current.pronunciation}')">
            🔊 ${isLearningZh ? 'Phát âm Từ vựng' : '播放单词音频'}
          </button>
          <button type="button" class="btn btn-outline" style="padding: 16px 24px;" onclick="AudioEngine.speak('${safeSentence}', '${speechLang}')">
            🗣️ ${isLearningZh ? 'Nghe cả câu ví dụ' : '播放完整例句'}
          </button>
        </div>

        <div class="quiz-options-grid">
          ${options.map(opt => {
            const label = isLearningZh
              ? `${opt.word} (${opt.pinyin}) — ${opt.meaning_vi}`
              : `${opt.word} — ${opt.meaning_zh}`;
            return `
              <button type="button" class="quiz-opt-btn" onclick="GrammarAndDialogueController.verifyListeningAnswer(this, ${opt.id === current.id})">
                ${label}
              </button>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 24px; display:flex; justify-content:center; gap:12px;">
          <button type="button" class="btn btn-outline" onclick="GrammarAndDialogueController.listeningIdx++; GrammarAndDialogueController.renderListeningChallenge();">
            ${isLearningZh ? 'Câu nghe tiếp theo →' : '下一题听力 →'}
          </button>
        </div>
      </div>
    `;

    // Auto-speak on render
    setTimeout(() => window.AudioEngine.speak(current.word, speechLang, current.pronunciation), 250);
  },

  verifyListeningAnswer(btn, isCorrect) {
    if (isCorrect) {
      btn.classList.add('correct');
      window.AppUI.showToast('🎉 Chính xác! Tai nghe rất nhạy! / 听力完全正确！');
    } else {
      btn.classList.add('wrong');
      window.AppUI.showToast('💡 Hãy bấm nghe lại một lần nữa nhé! / 请再听一遍试试！');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  GrammarAndDialogueController.init();
});

window.GrammarAndDialogueController = GrammarAndDialogueController;
