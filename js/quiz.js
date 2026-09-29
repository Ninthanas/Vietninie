// ============================================================================
// QUIZ ENGINE (ALL 8 INTERACTIVE QUIZ MODES + SCORE TRACKING)
// ============================================================================
const QuizController = {
  vocabPool: [],
  activeMode: 'word', // 1..8 modes
  questions: [],
  currentIndex: 0,
  score: 0,
  totalQuestions: 10,
  matchSelection: null,
  matchedPairsCount: 0,

  modesConfig: [
    { id: 'meaning', icon: '📖', vi: '1. Chọn nghĩa đúng', zh: '1. 选择正确释义' },
    { id: 'word', icon: '🎯', vi: '2. Chọn từ đúng', zh: '2. 根据释义选词' },
    { id: 'pinyin', icon: '🔤', vi: '3. Chọn Pinyin / Phiên âm', zh: '3. 选择正确拼音/读音' },
    { id: 'listening', icon: '🔊', vi: '4. Nghe & chọn đáp án', zh: '4. 听音辨词测验' },
    { id: 'matching', icon: '🧩', vi: '5. Ghép từ với nghĩa', zh: '5. 词义连线配对' },
    { id: 'fill_blank', icon: '✍️', vi: '6. Điền từ còn thiếu', zh: '6. 语境选词填空' },
    { id: 'translate', icon: '🌏', vi: '7. Dịch câu hoàn chỉnh', zh: '7. 双语句子翻译' },
    { id: 'speed_flash', icon: '⚡', vi: '8. Flashcard Challenge', zh: '8. 极速闪卡挑战' }
  ],

  async init() {
    if (!document.getElementById('quizModesMount')) return;
    this.vocabPool = await window.DataService.getActiveVocabulary();
    this.renderModeSelector();
    this.startNewQuiz(this.activeMode);

    window.addEventListener('sentruc:lang-changed', async () => {
      this.vocabPool = await window.DataService.getActiveVocabulary();
      this.renderModeSelector();
      this.startNewQuiz(this.activeMode);
    });
  },

  renderModeSelector() {
    const mount = document.getElementById('quizModesMount');
    if (!mount) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    mount.innerHTML = this.modesConfig.map(m => `
      <button type="button" class="quiz-mode-btn ${m.id === this.activeMode ? 'active' : ''}" onclick="QuizController.startNewQuiz('${m.id}')">
        <div style="font-size: 1.4rem; margin-bottom: 6px;">${m.icon}</div>
        <div style="font-weight: 800; font-size: 0.95rem;">${isLearningZh ? m.vi : m.zh}</div>
      </button>
    `).join('');
  },

  startNewQuiz(modeId) {
    this.activeMode = modeId;
    this.currentIndex = 0;
    this.score = 0;
    this.renderModeSelector();

    if (modeId === 'matching') {
      this.renderMatchingGame();
      return;
    }

    // Generate 10 randomized questions from the 2,000+ vocabulary pool
    const shuffled = [...this.vocabPool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, this.totalQuestions);
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';

    this.questions = picked.map(item => {
      const distractors = shuffled
        .filter(d => d.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const optionItems = [item, ...distractors].sort(() => 0.5 - Math.random());
      const correctIdx = optionItems.findIndex(o => o.id === item.id);

      let promptTitle = '';
      let promptMain = '';
      let promptSub = '';
      let optionsText = [];

      const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
      const phonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
      const exTarget = isLearningZh ? item.example_zh : item.example_vi;
      const exNative = isLearningZh ? item.example_vi : item.example_zh;

      if (modeId === 'meaning') {
        promptTitle = isLearningZh ? 'Nghĩa tiếng Việt của từ này là gì?' : '这个越南语词汇的中文意思是什么？';
        promptMain = item.word;
        promptSub = phonetic;
        optionsText = optionItems.map(o => isLearningZh ? o.meaning_vi : o.meaning_zh);
      } else if (modeId === 'word') {
        promptTitle = isLearningZh ? `"${meaning}" trong tiếng Trung là:` : `“${meaning}”用越南语怎么说？`;
        promptMain = meaning;
        promptSub = isLearningZh ? `Chủ đề: ${item.topic_label_vi}` : `主题：${item.topic_label_zh}`;
        optionsText = optionItems.map(o => o.word);
      } else if (modeId === 'pinyin') {
        promptTitle = isLearningZh ? `Chọn Pinyin chính xác cho chữ Hán:` : `选择该越南语词汇的正确发音指南：`;
        promptMain = item.word;
        promptSub = meaning;
        optionsText = optionItems.map(o => isLearningZh ? o.pinyin : o.pronunciation_guide);
      } else if (modeId === 'listening') {
        promptTitle = isLearningZh ? 'Nghe phát âm và chọn từ đúng:' : '请听发音并选择正确的词条：';
        promptMain = '🔊 Bấm để nghe phát âm';
        promptSub = isLearningZh ? 'Nghe kỹ thanh điệu và âm tiết' : '仔细分辨声调与发音';
        optionsText = optionItems.map(o => `${o.word} (${isLearningZh ? o.meaning_vi : o.meaning_zh})`);
      } else if (modeId === 'fill_blank') {
        promptTitle = isLearningZh ? 'Điền từ còn thiếu vào chỗ trống (___):' : '请选择正确的词填入句中空白处 (___)：';
        promptMain = exTarget.replace(item.word, ' ______ ');
        promptSub = exNative;
        optionsText = optionItems.map(o => o.word);
      } else if (modeId === 'translate') {
        promptTitle = isLearningZh ? 'Chọn bản dịch đúng nhất cho câu sau:' : '请选择下列句子最准确的翻译：';
        promptMain = exTarget;
        promptSub = isLearningZh ? item.example_pinyin : '';
        optionsText = optionItems.map(o => isLearningZh ? o.example_vi : o.example_zh);
      } else {
        // speed_flash
        promptTitle = isLearningZh ? '⚡ Phản xạ nhanh Flashcard:' : '⚡ 极速闪卡反应挑战：';
        promptMain = item.word;
        promptSub = phonetic;
        optionsText = optionItems.map(o => isLearningZh ? o.meaning_vi : o.meaning_zh);
      }

      return {
        item,
        promptTitle,
        promptMain,
        promptSub,
        optionsText,
        correctIdx
      };
    });

    this.renderCurrentQuestion();
  },

  renderCurrentQuestion() {
    const arena = document.getElementById('quizArenaMount');
    if (!arena) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';
    const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';

    if (this.currentIndex >= this.questions.length) {
      window.StorageManager.saveQuizResult(this.activeMode, this.score, this.questions.length);
      const pct = Math.round((this.score / this.questions.length) * 100);
      arena.innerHTML = `
        <div style="text-align:center; padding: 24px 0;">
          <div style="font-size: 4rem; margin-bottom: 12px;">🏆</div>
          <h2 style="font-size: 2rem; font-weight: 800;">${isLearningZh ? 'Hoàn thành bài Quiz!' : '测验完成！'}</h2>
          <p style="font-size: 1.25rem; margin: 12px 0; color: var(--brand-primary); font-weight: 800;">
            ${isLearningZh ? `Điểm số: ${this.score} / ${this.questions.length} (${pct}%)` : `得分：${this.score} / ${this.questions.length} (${pct}%)`}
          </p>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">
            ${isLearningZh ? 'Kết quả đã được lưu vào bảng Tiến độ học tập của bạn.' : '成绩已自动保存至您的学习进度档案。'}
          </p>
          <div style="display:flex; justify-content:center; gap:12px;">
            <button type="button" class="btn btn-primary" onclick="QuizController.startNewQuiz('${this.activeMode}')">
              🔄 ${isLearningZh ? 'Làm đề mới' : '再来一局'}
            </button>
            <a href="progress.html" class="btn btn-outline">
              📊 ${isLearningZh ? 'Xem Tiến độ' : '查看学习进度'}
            </a>
          </div>
        </div>
      `;
      return;
    }

    const q = this.questions[this.currentIndex];
    const progressPct = Math.round(((this.currentIndex) / this.questions.length) * 100);
    const safeWord = q.item.word.replace(/'/g, "\\'");

    arena.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge badge-rose">${isLearningZh ? `Câu ${this.currentIndex + 1} / ${this.questions.length}` : `第 ${this.currentIndex + 1} / ${this.questions.length} 题`}</span>
          <span class="badge badge-jade">${isLearningZh ? `Điểm: ${this.score}` : `当前得分: ${this.score}`}</span>
        </div>

        <div class="quiz-progress-track">
          <div class="quiz-progress-fill" style="width: ${progressPct}%;"></div>
        </div>

        <p style="color: var(--text-secondary); font-weight: 700; margin-bottom: 8px;">${q.promptTitle}</p>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; background: var(--bg-primary); padding: 24px; border-radius: 20px; border: 1px solid var(--border-color);">
          <div>
            <div style="font-size: 2rem; font-weight: 800;">${q.promptMain}</div>
            ${q.promptSub ? `<div style="color: var(--brand-primary); font-weight: 600; margin-top: 4px;">${q.promptSub}</div>` : ''}
          </div>
          <button type="button" class="btn btn-primary" onclick="AudioEngine.speak('${safeWord}', '${speechLang}', '${q.item.pronunciation}')">
            🔊 ${isLearningZh ? 'Nghe' : '发音'}
          </button>
        </div>

        <div class="quiz-options-grid">
          ${q.optionsText.map((optText, idx) => `
            <button type="button" class="quiz-opt-btn" onclick="QuizController.submitAnswer(this, ${idx}, ${q.correctIdx})">
              ${String.fromCharCode(65 + idx)}. ${optText}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    if (this.activeMode === 'listening') {
      setTimeout(() => window.AudioEngine.speak(q.item.word, speechLang, q.item.pronunciation), 200);
    }
  },

  submitAnswer(btnEl, chosenIdx, correctIdx) {
    const buttons = btnEl.parentElement.querySelectorAll('.quiz-opt-btn');
    buttons.forEach((b, idx) => {
      b.disabled = true;
      if (idx === correctIdx) b.classList.add('correct');
      else if (idx === chosenIdx) b.classList.add('wrong');
    });

    if (chosenIdx === correctIdx) {
      this.score++;
      window.StorageManager.markLearned(this.questions[this.currentIndex].item.id, true);
    }

    setTimeout(() => {
      this.currentIndex++;
      this.renderCurrentQuestion();
    }, 850);
  },

  // ============================================================================
  // MODE 5: INTERACTIVE MATCHING PAIRS BOARD (GHÉP TỪ VỚI NGHĨA)
  // ============================================================================
  renderMatchingGame() {
    const arena = document.getElementById('quizArenaMount');
    if (!arena) return;
    const isLearningZh = window.LanguageManager.getLearningLang() === 'zh';

    const pairs = [...this.vocabPool].sort(() => 0.5 - Math.random()).slice(0, 6);
    this.matchSelection = null;
    this.matchedPairsCount = 0;

    const leftCards = pairs.map(p => ({ pairId: p.id, side: 'word', label: p.word })).sort(() => 0.5 - Math.random());
    const rightCards = pairs.map(p => ({ pairId: p.id, side: 'meaning', label: isLearningZh ? p.meaning_vi : p.meaning_zh })).sort(() => 0.5 - Math.random());

    arena.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
          <h3>🧩 ${isLearningZh ? 'Ghép 6 cặp Từ vựng & Nghĩa tương ứng' : '将左侧词汇与右侧正确释义配对'}</h3>
          <button type="button" class="btn btn-sm btn-outline" onclick="QuizController.renderMatchingGame()">🔄 ${isLearningZh ? 'Đổi bộ thẻ' : '换一组'}</button>
        </div>
        <div class="matching-board">
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${leftCards.map(c => `<div class="match-card" data-pair-id="${c.pairId}" data-side="word" onclick="QuizController.handleMatchClick(this)">${c.label}</div>`).join('')}
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${rightCards.map(c => `<div class="match-card" data-pair-id="${c.pairId}" data-side="meaning" onclick="QuizController.handleMatchClick(this)">${c.label}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  },

  handleMatchClick(cardEl) {
    if (cardEl.classList.contains('matched')) return;
    if (!this.matchSelection) {
      this.matchSelection = cardEl;
      cardEl.classList.add('selected');
      return;
    }
    if (this.matchSelection === cardEl) {
      cardEl.classList.remove('selected');
      this.matchSelection = null;
      return;
    }

    const firstId = this.matchSelection.getAttribute('data-pair-id');
    const secondId = cardEl.getAttribute('data-pair-id');
    const firstSide = this.matchSelection.getAttribute('data-side');
    const secondSide = cardEl.getAttribute('data-side');

    if (firstId === secondId && firstSide !== secondSide) {
      this.matchSelection.classList.remove('selected');
      this.matchSelection.classList.add('matched');
      cardEl.classList.add('matched');
      this.matchSelection = null;
      this.matchedPairsCount++;
      window.StorageManager.markLearned(Number(firstId), true);

      if (this.matchedPairsCount === 6) {
        window.StorageManager.saveQuizResult('matching', 6, 6);
        window.AppUI.showToast('🎉 Tuyệt vời! Bạn đã ghép đúng cả 6 cặp từ! / 恭喜全部配对成功！');
      }
    } else {
      cardEl.classList.add('wrong');
      const prev = this.matchSelection;
      this.matchSelection = null;
      setTimeout(() => {
        prev.classList.remove('selected');
        cardEl.classList.remove('wrong');
      }, 450);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  QuizController.init();
});

window.QuizController = QuizController;
