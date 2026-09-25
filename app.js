const STORAGE_KEYS = {
  LEVEL: "vietmigo_current_level",
  LESSON: "vietmigo_current_lesson",
  COMPLETED_LESSONS: "vietmigo_completed_lessons",
  VOCABULARY_STATUS: "vietmigo_vocabulary_status",
  QUIZ_SCORES: "vietmigo_quiz_scores",
  STREAK: "vietmigo_streak",
  DAILY_GOAL: "vietmigo_daily_goal",
  LAST_ACTIVE_DATE: "vietmigo_last_active_date",
  SPEECH_RATE: "vietmigo_speech_rate"
};

function removeVietnameseDiacritics(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

class VietninieApp {
  constructor() {
    window.app = this;
    this.currentPage = "home";
    this.currentLevel = localStorage.getItem(STORAGE_KEYS.LEVEL) || "A1";
    this.currentLessonId = parseInt(localStorage.getItem(STORAGE_KEYS.LESSON), 10) || 1;
    this.dailyGoal = parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_GOAL), 10) || 10;
    this.speechRate = parseFloat(localStorage.getItem(STORAGE_KEYS.SPEECH_RATE)) || 0.9;
    
    
    this.completedLessons = this.loadJSON(STORAGE_KEYS.COMPLETED_LESSONS, []);
    this.vocabularyStatus = this.loadJSON(STORAGE_KEYS.VOCABULARY_STATUS, {});
    this.quizScores = this.loadJSON(STORAGE_KEYS.QUIZ_SCORES, {});
    this.streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK), 10) || 1;

    
    this.updateDailyStreak();

    
    this.vocabSearchQuery = "";
    this.vocabLevelFilter = "ALL";
    this.vocabCategoryFilter = "all";
    this.filteredVocabList = [];
    this.vocabDisplayLimit = 36; 
    this.currentFlashcardIdx = 0;

    
    this.currentScenarioIdx = 0;
    this.conversationMode = "learn"; 

    
    this.activeLesson = null;
    this.currentLessonStep = 1;
    this.lessonQuizAnswers = {};

    
    this.quizQuestions = [];
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizAnswered = false;

    
    this.vietnameseVoice = null;
    this.initSpeechEngine();

    
    this.init();
  }

  
  loadJSON(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  saveJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("LocalStorage write error:", e);
    }
  }

  getLocalDateString(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  updateDailyStreak() {
    const today = this.getLocalDateString();
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_DATE);
    let savedStreak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK), 10) || 1;

    if (!lastDate) {
      savedStreak = 1;
    } else if (lastDate !== today) {
      const [y1, m1, d1] = lastDate.split("-").map(Number);
      const [y2, m2, d2] = today.split("-").map(Number);
      const utc1 = Date.UTC(y1, (m1 || 1) - 1, d1 || 1);
      const utc2 = Date.UTC(y2, (m2 || 1) - 1, d2 || 1);
      const diffDays = Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        savedStreak += 1;
      } else if (diffDays > 1) {
        savedStreak = 1;
      }
    }

    this.streak = Math.max(1, savedStreak);
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_DATE, today);
    localStorage.setItem(STORAGE_KEYS.STREAK, String(this.streak));

    const streakEl = document.getElementById("streakCount");
    if (streakEl) streakEl.innerText = this.streak;
    const profStreakEl = document.getElementById("profStreakCount");
    if (profStreakEl) profStreakEl.innerText = this.streak;
  }

  showStreakInfo() {
    this.updateDailyStreak();
    const today = this.getLocalDateString();
    this.showToast(`🔥 已连续学习 ${this.streak} 天！今日 (${today}) 已打卡，明天继续学习即可升至 ${this.streak + 1} 天！`);
  }

  
  initSpeechEngine() {
    this.currentAudio = null;
    this.localVietnameseVoice = null;

    if (!("speechSynthesis" in window)) return;

    const scanVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      this.localVietnameseVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        const n = (v.name || "").toLowerCase();
        return (
          l === "vi-vn" ||
          l === "vi" ||
          l.startsWith("vi_") ||
          l.startsWith("vi-") ||
          n.includes("vietnam") ||
          n.includes("tiếng việt") ||
          n.includes("tieng viet")
        );
      });

      const descEl = document.getElementById("profVoiceStatusText");
      if (descEl) {
        if (this.localVietnameseVoice) {
          descEl.innerHTML = `已检测到本地系统越南语引擎: <strong>${this.localVietnameseVoice.name}</strong>`;
          descEl.style.color = "var(--color-accent-green)";
        } else {
          descEl.innerHTML = `系统已启用<strong>在线越南语真人标准原声 (vi-VN)</strong>。点击可查阅离线语音安装指引。`;
          descEl.style.color = "var(--color-primary)";
        }
      }
    };

    scanVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = scanVoices;
    }
  }

  speakVietnamese(text, customRate = null, onEndCallback = null, triggerBtn = null) {
    if (!text) return;
    const cleanText = text.trim();

    
    if (triggerBtn) {
      triggerBtn.classList.add("speaking");
    }

    const finish = () => {
      if (triggerBtn) triggerBtn.classList.remove("speaking");
      if (onEndCallback) onEndCallback();
    };

    
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio = null;
      } catch (e) {}
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    const rate = customRate || this.speechRate || 1.0;

    
    
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(ttsUrl);
      audio.playbackRate = Math.min(2.0, Math.max(0.5, rate));
      this.currentAudio = audio;

      let playedSuccessfully = false;

      audio.onended = () => {
        this.currentAudio = null;
        finish();
      };

      audio.onerror = (err) => {
        
        this.fallbackToSpeechSynthesis(cleanText, rate, finish);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            playedSuccessfully = true;
          })
          .catch((err) => {
            console.warn("在线音频播放未允许或受阻，转入本地备用方案:", err);
            this.fallbackToSpeechSynthesis(cleanText, rate, finish);
          });
      }
    } catch (err) {
      console.warn("音频引擎异常:", err);
      this.fallbackToSpeechSynthesis(cleanText, rate, finish);
    }
  }

  fallbackToSpeechSynthesis(cleanText, rate, callback) {
    if (!("speechSynthesis" in window)) {
      this.showToast("未能播放发音，请检查浏览器声音设置。");
      callback();
      return;
    }

    
    if (!this.localVietnameseVoice) {
      const voices = window.speechSynthesis.getVoices();
      this.localVietnameseVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        const n = (v.name || "").toLowerCase();
        return (
          l === "vi-vn" ||
          l === "vi" ||
          l.startsWith("vi_") ||
          l.startsWith("vi-") ||
          n.includes("vietnam") ||
          n.includes("tiếng việt") ||
          n.includes("tieng viet")
        );
      });
    }

    
    if (!this.localVietnameseVoice) {
      this.showToast("⚠️ 当前设备缺少越南语发音引擎。已为你打开开启指引。");
      this.openVoiceGuideModal();
      callback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.voice = this.localVietnameseVoice; 
    utterance.rate = rate || this.speechRate || 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => callback();
    utterance.onerror = () => callback();

    window.speechSynthesis.speak(utterance);
  }

  testSpeechSynthesis() {
    this.speakVietnamese("Xin chào! Chào mừng bạn đến với Vietninie, 越学越辣！", null, () => {
      this.showToast("纯正越南语发音测试完成！听到地道发音了吗？");
    });
  }

  openVoiceGuideModal() {
    const modal = document.getElementById("modalVoiceGuide");
    if (modal) modal.classList.add("active");
  }

  closeVoiceGuideModal() {
    const modal = document.getElementById("modalVoiceGuide");
    if (modal) modal.classList.remove("active");
  }

  setSpeechRate(rate) {
    this.speechRate = parseFloat(rate) || 0.9;
    localStorage.setItem(STORAGE_KEYS.SPEECH_RATE, this.speechRate);
    this.showToast(`发音语速已更新为: ${this.speechRate}x`);
  }

  
  navigateTo(pageId) {
    this.currentPage = pageId;
    this.updateDailyStreak();

    
    document.querySelectorAll(".desktop-nav .nav-link").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === pageId);
    });

    
    document.querySelectorAll(".mobile-bottom-nav .m-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === pageId);
    });

    
    document.querySelectorAll(".view-section").forEach((sec) => {
      sec.classList.remove("active");
    });
    const target = document.getElementById(`view-${pageId}`);
    if (target) {
      target.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    
    if (pageId === "home") this.renderHomeView();
    if (pageId === "lessons") this.renderLessonsView();
    if (pageId === "vocabulary") this.initVocabularyView();
    if (pageId === "conversation") this.renderConversations();
    if (pageId === "quiz") this.initQuizSession();
    if (pageId === "profile") this.renderProfileView();
  }

  
  renderHomeView() {
    this.updateDailyStreak();
    const hour = new Date().getHours();
    let timeWord = "你好";
    if (hour < 11) timeWord = "早上好";
    else if (hour < 14) timeWord = "中午好";
    else if (hour < 18) timeWord = "下午好";
    else timeWord = "晚上好";

    const greetingEl = document.getElementById("homeGreetingMsg");
    if (greetingEl) {
      greetingEl.innerText = `${timeWord}，今天也一起越学越辣吧！每天 5-10 分钟，轻松积累实用地道表达。`;
    }

    
    const headerLevelEl = document.getElementById("headerLevelText");
    const streakEl = document.getElementById("streakCount");
    if (headerLevelEl) headerLevelEl.innerText = `${this.currentLevel} · 水平`;
    if (streakEl) streakEl.innerText = this.streak;

    
    const today = this.getLocalDateString();
    let learnedToday = 0;
    Object.values(this.vocabularyStatus).forEach((st) => {
      if (st.lastDate === today) learnedToday++;
    });

    const goalProgText = document.getElementById("homeGoalProgressText");
    const goalProgBar = document.getElementById("homeGoalProgressBar");
    if (goalProgText) goalProgText.innerText = `${learnedToday} / ${this.dailyGoal} 词`;
    if (goalProgBar) {
      const goalPct = Math.min(100, Math.round((learnedToday / this.dailyGoal) * 100));
      goalProgBar.style.width = `${goalPct}%`;
    }

    
    let reviewDue = 0;
    Object.values(this.vocabularyStatus).forEach((st) => {
      if (st.status === "learning") reviewDue++;
    });
    const reviewDueEl = document.getElementById("homeReviewDueText");
    if (reviewDueEl) reviewDueEl.innerText = `${reviewDue} 个生词待巩固`;

    
    if (typeof LESSONS_DATA === "undefined" || !Array.isArray(LESSONS_DATA) || LESSONS_DATA.length === 0) {
      return;
    }

    let nextUncompleted = LESSONS_DATA.find((l) => !this.completedLessons.includes(l.id));
    if (!nextUncompleted) nextUncompleted = LESSONS_DATA[LESSONS_DATA.length - 1];
    this.currentLessonId = nextUncompleted.id;
    localStorage.setItem(STORAGE_KEYS.LESSON, this.currentLessonId);

    const clBadge = document.getElementById("homeClBadge");
    const clIcon = document.getElementById("homeClIcon");
    const clTitleVi = document.getElementById("homeClTitleVi");
    const clTitleZh = document.getElementById("homeClTitleZh");
    const clBtnNumber = document.getElementById("homeClBtnNumber");
    const overallProgText = document.getElementById("homeOverallLessonsProgText");
    const overallProgBar = document.getElementById("homeOverallLessonsProgBar");

    if (clBadge) clBadge.innerText = `当前进度 · 第 ${nextUncompleted.lessonNumber} 课`;
    if (clIcon) clIcon.innerText = nextUncompleted.icon;
    if (clTitleVi) clTitleVi.innerText = nextUncompleted.titleVi;
    if (clTitleZh) clTitleZh.innerText = nextUncompleted.titleZh;
    if (clBtnNumber) clBtnNumber.innerText = nextUncompleted.lessonNumber;

    const totalL = LESSONS_DATA.length;
    const compL = this.completedLessons.length;
    const lPct = Math.round((compL / totalL) * 100);
    if (overallProgText) overallProgText.innerText = `${compL} / ${totalL} 课 (${lPct}%)`;
    if (overallProgBar) overallProgBar.style.width = `${lPct}%`;
  }

  startCurrentLesson() {
    this.openLessonModal(this.currentLessonId);
  }

  startDailyReview() {
    this.navigateTo("vocabulary");
    this.showToast("已为你筛选待巩固词汇进行复习！");
  }

  
  renderLessonsView() {
    const container = document.getElementById("lessonsListContainer");
    if (!container || typeof LESSONS_DATA === "undefined") return;

    container.innerHTML = LESSONS_DATA.map((lesson) => {
      const isDone = this.completedLessons.includes(lesson.id);
      const isCur = this.currentLessonId === lesson.id;

      return `
        <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 20px; cursor: pointer; border-color: ${isDone ? "var(--color-accent-green)" : isCur ? "var(--color-primary)" : "var(--color-border)"};" onclick="app.openLessonModal(${lesson.id})">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: ${isDone ? "var(--color-accent-green-light)" : "var(--color-primary-light)"}; color: ${isDone ? "var(--color-accent-green)" : "var(--color-primary)"}; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.15rem;">
              ${isDone ? "✓" : lesson.lessonNumber}
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 850; color: var(--color-text-main);">
                <span>${lesson.icon}</span> ${lesson.titleZh}
              </h3>
              <div style="font-size: 0.9rem; color: var(--color-text-muted); font-weight: 600;">${lesson.titleVi}</div>
              <div style="font-size: 0.8rem; color: var(--color-text-light); margin-top: 4px;">
                ⏱️ ${lesson.duration} · ${lesson.level || "A1"}
              </div>
            </div>
          </div>
          <div>
            ${
              isDone
                ? '<span style="font-size: 0.82rem; font-weight: 800; background: var(--color-accent-green-light); color: #065F46; padding: 6px 14px; border-radius: var(--radius-full);">已通关 ✓</span>'
                : isCur
                ? '<span style="font-size: 0.82rem; font-weight: 800; background: var(--color-primary-light); color: var(--color-primary); padding: 6px 14px; border-radius: var(--radius-full);">当前学习 →</span>'
                : '<span style="font-size: 0.82rem; font-weight: 800; background: var(--color-surface-muted); color: var(--color-text-muted); padding: 6px 14px; border-radius: var(--radius-full);">开始学习</span>'
            }
          </div>
        </div>
      `;
    }).join("");
  }

  openLessonModal(lessonId) {
    const lesson = LESSONS_DATA.find((l) => l.id === lessonId);
    if (!lesson) return;

    this.activeLesson = lesson;
    this.currentLessonStep = 1;
    this.lessonQuizAnswers = {};

    const modal = document.getElementById("modalLessonPlayer");
    const badge = document.getElementById("lmLessonBadge");
    const title = document.getElementById("lmLessonTitle");

    if (badge) badge.innerText = `第 ${lesson.lessonNumber} 课 · ${lesson.duration}`;
    if (title) title.innerText = `${lesson.icon} ${lesson.titleZh} (${lesson.titleVi})`;

    this.renderLessonStepContent();
    modal.classList.add("active");
  }

  closeLessonModal() {
    const modal = document.getElementById("modalLessonPlayer");
    if (modal) modal.classList.remove("active");
    this.renderLessonsView();
    this.renderHomeView();
  }

  renderLessonStepContent() {
    const body = document.getElementById("lmModalContentBody");
    const stepInd = document.getElementById("lmStepIndicator");
    const prevBtn = document.getElementById("btnLmPrevStep");
    const nextBtn = document.getElementById("btnLmNextStep");
    const lesson = this.activeLesson;

    const stepTitles = ["1. 生词精讲", "2. 核心句型", "3. 随堂小测", "4. 顺利通关"];
    if (stepInd) stepInd.innerText = `${stepTitles[this.currentLessonStep - 1]} (${this.currentLessonStep}/4)`;
    if (prevBtn) prevBtn.style.visibility = this.currentLessonStep === 1 ? "hidden" : "visible";

    if (nextBtn) {
      if (this.currentLessonStep === 4) nextBtn.innerText = "完成并返回 🏆";
      else if (this.currentLessonStep === 3) nextBtn.innerText = "完成测试 →";
      else nextBtn.innerText = "下一步 →";
    }

    
    if (this.currentLessonStep === 1) {
      body.innerHTML = `
        <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-bottom: 16px;">${lesson.summaryZh}</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${lesson.vocabularies.map((v) => `
            <div class="card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 1.2rem; font-weight: 900; color: var(--color-text-main);">${v.vi}</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-primary);">${v.zh}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-light); margin-top: 2px;">💡 ${v.noteZh}</div>
              </div>
              <button class="btn-speak" onclick="app.speakVietnamese('${v.vi.replace(/'/g, "\\'")}', null, null, this)" title="发音">🔊</button>
            </div>
          `).join("")}
        </div>
      `;
    }

    else if (this.currentLessonStep === 2) {
      body.innerHTML = `
        <p style="font-size: 0.92rem; color: var(--color-text-muted); margin-bottom: 16px;">仔细体会语调起伏，点击喇叭跟读模仿：</p>
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${lesson.sentences.map((s) => `
            <div class="card" style="padding: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="font-size: 1.15rem; font-weight: 900; color: var(--color-text-main);">${s.vi}</div>
                <button class="btn-speak" onclick="app.speakVietnamese('${s.vi.replace(/'/g, "\\'")}', null, null, this)" title="发音">🔊</button>
              </div>
              <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-primary); margin: 4px 0;">${s.zh}</div>
              <div style="font-size: 0.82rem; color: var(--color-text-muted); background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-sm);">
                拆解: ${s.breakdown}
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    else if (this.currentLessonStep === 3) {
      body.innerHTML = `
        <p style="font-size: 0.92rem; color: var(--color-text-muted); margin-bottom: 16px;">回答小测题检验掌握程度：</p>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${lesson.quizzes.map((q, qIdx) => `
            <div style="background: var(--color-bg-base); padding: 16px; border-radius: var(--radius-md);">
              <div style="font-weight: 800; margin-bottom: 10px;">${qIdx + 1}. ${q.question}</div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${q.options.map((opt, optIdx) => `
                  <button class="quiz-option-button" id="lq_btn_${qIdx}_${optIdx}" onclick="app.answerLessonQuiz(${qIdx}, ${optIdx})">
                    <span>${String.fromCharCode(65 + optIdx)}. ${opt}</span>
                  </button>
                `).join("")}
              </div>
              <div id="lq_exp_${qIdx}" style="display: none; margin-top: 12px; padding: 12px; border-radius: var(--radius-sm); font-size: 0.9rem;"></div>
            </div>
          `).join("")}
        </div>
      `;
    }

    else if (this.currentLessonStep === 4) {
      if (!this.completedLessons.includes(lesson.id)) {
        this.completedLessons.push(lesson.id);
        this.saveJSON(STORAGE_KEYS.COMPLETED_LESSONS, this.completedLessons);
      }

      body.innerHTML = `
        <div style="text-align: center; padding: 24px 0;">
          <div style="font-size: 4.5rem; line-height: 1; margin-bottom: 16px;">🌶️</div>
          <h2 style="font-size: 1.8rem; font-weight: 900; color: var(--color-primary); margin-bottom: 8px;">
            第 ${lesson.lessonNumber} 课顺利通关！
          </h2>
          <p style="font-size: 1rem; color: var(--color-text-muted); max-width: 440px; margin: 0 auto 20px;">
            越学越辣！你已经彻底掌握<strong>【${lesson.titleZh}】</strong>的所有高频词汇与实景表达。
          </p>
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: 12px; display: inline-block;">
            <span style="color: #166534; font-weight: 800;">🌟 累计已通关 ${this.completedLessons.length} / 10 课</span>
          </div>
        </div>
      `;
    }
  }

  answerLessonQuiz(qIdx, optIdx) {
    if (this.lessonQuizAnswers[qIdx] !== undefined) return;
    this.lessonQuizAnswers[qIdx] = optIdx;

    const q = this.activeLesson.quizzes[qIdx];
    const isCorrect = optIdx === q.answer;

    const btn = document.getElementById(`lq_btn_${qIdx}_${optIdx}`);
    if (btn) btn.classList.add(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      const correctBtn = document.getElementById(`lq_btn_${qIdx}_${q.answer}`);
      if (correctBtn) correctBtn.classList.add("correct");
    }

    const exp = document.getElementById(`lq_exp_${qIdx}`);
    if (exp) {
      exp.style.display = "block";
      exp.style.backgroundColor = isCorrect ? "var(--color-accent-green-light)" : "var(--color-danger-light)";
      exp.style.color = isCorrect ? "#065F46" : "#991B1B";
      exp.innerHTML = `<strong>${isCorrect ? "🎉 正确！" : "❌ 再试一次："}</strong> ${q.explanation}`;
    }
  }

  nextLessonStep() {
    if (this.currentLessonStep === 3) {
      const answered = Object.keys(this.lessonQuizAnswers).length;
      if (answered < this.activeLesson.quizzes.length) {
        this.showToast("请先做完随堂测试题目哦！");
        return;
      }
    }

    if (this.currentLessonStep < 4) {
      this.currentLessonStep++;
      this.renderLessonStepContent();
    } else {
      this.closeLessonModal();
    }
  }

  prevLessonStep() {
    if (this.currentLessonStep > 1) {
      this.currentLessonStep--;
      this.renderLessonStepContent();
    }
  }

  
  initVocabularyView() {
    this.renderVocabLevelPills();
    this.renderVocabCategoryPills();
    this.filterVocabList();
  }

  renderVocabLevelPills() {
    const container = document.getElementById("vocabLevelPills");
    if (!container) return;

    container.innerHTML = VIETNAMESE_LEVELS.map((lvl) => `
      <button class="level-pill-btn ${this.vocabLevelFilter === lvl.key ? "active" : ""}" onclick="app.setVocabLevelFilter('${lvl.key}')">
        ${lvl.nameZh}
      </button>
    `).join("");
  }

  setVocabLevelFilter(levelKey) {
    this.vocabLevelFilter = levelKey;
    this.vocabDisplayLimit = 36;
    this.renderVocabLevelPills();
    this.filterVocabList();
  }

  renderVocabCategoryPills() {
    const container = document.getElementById("vocabCategoryPills");
    if (!container) return;

    container.innerHTML = VOCAB_CATEGORIES.map((cat) => `
      <button class="level-pill-btn ${this.vocabCategoryFilter === cat.key ? "active" : ""}" onclick="app.setVocabCategoryFilter('${cat.key}')">
        ${cat.icon} ${cat.nameZh}
      </button>
    `).join("");
  }

  setVocabCategoryFilter(categoryKey) {
    this.vocabCategoryFilter = categoryKey;
    this.vocabDisplayLimit = 36;
    this.renderVocabCategoryPills();
    this.filterVocabList();
  }

  onVocabSearchChange() {
    const input = document.getElementById("vocabSearchInput");
    this.vocabSearchQuery = (input?.value || "").trim();
    this.vocabDisplayLimit = 36;
    this.filterVocabList();
  }

  filterVocabList() {
    const query = removeVietnameseDiacritics(this.vocabSearchQuery);

    this.filteredVocabList = VOCABULARY_DATA.filter((item) => {

      if (this.vocabLevelFilter !== "ALL" && item.level !== this.vocabLevelFilter) {
        return false;
      }

      if (this.vocabCategoryFilter !== "all" && item.category !== this.vocabCategoryFilter) {
        return false;
      }

      if (query) {
        const viClean = removeVietnameseDiacritics(item.vietnamese);
        const zhClean = item.chinese.toLowerCase();
        if (!viClean.includes(query) && !zhClean.includes(query)) {
          return false;
        }
      }
      return true;
    });

    if (this.currentFlashcardIdx >= this.filteredVocabList.length) {
      this.currentFlashcardIdx = 0;
    }

    this.renderFlashcard();
    this.renderVocabGrid();
  }

  renderFlashcard() {
    const cardEl = document.getElementById("flashcardCardElement");
    if (cardEl) cardEl.classList.remove("flipped");

    if (this.filteredVocabList.length === 0) {
      const vi = document.getElementById("fcWordVi");
      if (vi) vi.innerText = "无匹配词汇";
      return;
    }

    const cur = this.filteredVocabList[this.currentFlashcardIdx];
    if (!cur) return;

    const badge = document.getElementById("fcBadgeLevel");
    const vi = document.getElementById("fcWordVi");
    const zh = document.getElementById("fcWordZh");
    const exVi = document.getElementById("fcExampleVi");
    const exZh = document.getElementById("fcExampleZh");

    if (badge) badge.innerText = `${cur.level} · ${cur.category} (${this.currentFlashcardIdx + 1}/${this.filteredVocabList.length})`;
    if (vi) vi.innerText = cur.vietnamese;
    if (zh) zh.innerText = cur.chinese;
    if (exVi) exVi.innerText = cur.example;
    if (exZh) exZh.innerText = cur.exampleChinese;
  }

  flipFlashcard() {
    const cardEl = document.getElementById("flashcardCardElement");
    if (cardEl) cardEl.classList.toggle("flipped");
  }

  nextFlashcard() {
    if (this.filteredVocabList.length === 0) return;
    this.currentFlashcardIdx = (this.currentFlashcardIdx + 1) % this.filteredVocabList.length;
    this.renderFlashcard();
  }

  prevFlashcard() {
    if (this.filteredVocabList.length === 0) return;
    this.currentFlashcardIdx =
      (this.currentFlashcardIdx - 1 + this.filteredVocabList.length) % this.filteredVocabList.length;
    this.renderFlashcard();
  }

  markCurrentFlashcardLearned() {
    if (this.filteredVocabList.length === 0) return;
    const cur = this.filteredVocabList[this.currentFlashcardIdx];

    this.updateDailyStreak();
    const today = this.getLocalDateString();
    this.vocabularyStatus[cur.id] = {
      status: "known",
      lastDate: today,
      reviewCount: (this.vocabularyStatus[cur.id]?.reviewCount || 0) + 1
    };
    this.saveJSON(STORAGE_KEYS.VOCABULARY_STATUS, this.vocabularyStatus);

    this.showToast(`已掌握：${cur.vietnamese} ✓`);
    this.renderVocabGrid();
    this.nextFlashcard();
  }

  renderVocabGrid() {
    const grid = document.getElementById("vocabGridContainer");
    const matchedCount = document.getElementById("vocabMatchedCount");
    const knownCount = document.getElementById("vocabKnownCount");
    const loadMoreContainer = document.getElementById("vocabLoadMoreContainer");
    const statusText = document.getElementById("vocabPaginationStatus");

    const total = this.filteredVocabList.length;
    if (matchedCount) matchedCount.innerText = total;

    const totalKnown = Object.values(this.vocabularyStatus).filter((s) => s.status === "known").length;
    if (knownCount) knownCount.innerText = totalKnown;

    if (!grid) return;

    const visibleItems = this.filteredVocabList.slice(0, this.vocabDisplayLimit);
    grid.innerHTML = visibleItems.map((v) => {
      const isKnown = this.vocabularyStatus[v.id]?.status === "known";
      return `
        <div class="vocab-item-tile">
          <div class="vit-left">
            <div class="vit-vi">
              <span>${v.vietnamese}</span>
              <span class="vit-level-tag">${v.level}</span>
              ${isKnown ? '<span style="font-size: 0.7rem; font-weight: 800; background: var(--color-accent-green-light); color: #065F46; padding: 2px 6px; border-radius: 4px;">已掌握</span>' : ""}
            </div>
            <div class="vit-zh">${v.chinese}</div>
            <div class="vit-ex">${v.example}</div>
          </div>
          <button class="btn-speak" style="width: 36px; height: 36px; font-size: 1rem;" onclick="app.speakVietnamese('${v.vietnamese.replace(/'/g, "\\'")}', null, null, this)" title="朗读">
            🔊
          </button>
        </div>
      `;
    }).join("");

    if (loadMoreContainer) {
      loadMoreContainer.style.display = total > this.vocabDisplayLimit ? "flex" : "none";
    }
    if (statusText) {
      statusText.innerText = `已显示 ${Math.min(this.vocabDisplayLimit, total)} / ${total} 词`;
    }
  }

  loadMoreVocab() {
    this.vocabDisplayLimit += 36;
    this.renderVocabGrid();
  }

  
  renderConversations() {
    const selector = document.getElementById("scenarioSelectorRow");
    if (!selector) return;

    selector.innerHTML = CONVERSATIONS_DATA.map((c, idx) => `
      <button class="level-pill-btn ${this.currentScenarioIdx === idx ? "active" : ""}" onclick="app.selectScenario(${idx})">
        ${c.icon} ${c.titleZh}
      </button>
    `).join("");

    this.renderCurrentScenario();
  }

  selectScenario(index) {
    this.currentScenarioIdx = index;
    this.renderConversations();
  }

  nextScenario() {
    this.currentScenarioIdx = (this.currentScenarioIdx + 1) % CONVERSATIONS_DATA.length;
    this.renderConversations();
  }

  setConversationMode(mode) {
    this.conversationMode = mode;
    const btnLearn = document.getElementById("btnModeLearn");
    const btnPractice = document.getElementById("btnModePractice");

    if (btnLearn) btnLearn.classList.toggle("active", mode === "learn");
    if (btnPractice) btnPractice.classList.toggle("active", mode === "practice");

    document.querySelectorAll(".chat-zh-line").forEach((el) => {
      el.classList.toggle("blurred", mode === "practice");
    });
  }

  renderCurrentScenario() {
    const conv = CONVERSATIONS_DATA[this.currentScenarioIdx];
    if (!conv) return;

    const titleVi = document.getElementById("convTitleVi");
    const titleZh = document.getElementById("convTitleZh");
    const context = document.getElementById("convContextZh");
    const thread = document.getElementById("dialogueBubblesThread");

    if (titleVi) titleVi.innerText = `${conv.icon} ${conv.titleVi}`;
    if (titleZh) titleZh.innerText = `${conv.titleZh} · ${conv.badgeZh}`;
    if (context) context.innerText = conv.contextZh;

    if (!thread) return;

    thread.innerHTML = conv.dialogue.map((line, idx) => `
      <div class="chat-bubble-row ${line.isLearner ? "learner" : ""}" id="diag_row_${idx}">
        <div class="chat-avatar">${line.avatar}</div>
        <div class="chat-bubble-content">
          <span class="chat-speaker-name">${line.speakerZh} (${line.speakerVi})</span>
          <div class="chat-bubble-box">
            <div class="chat-vi-line">
              <span>${line.vi}</span>
              <button class="btn-speak" style="width: 34px; height: 34px; font-size: 0.95rem;" onclick="app.speakVietnamese('${line.vi.replace(/'/g, "\\'")}', null, null, this)" title="朗读">
                🔊
              </button>
            </div>
            <div class="chat-zh-line ${this.conversationMode === "practice" ? "blurred" : ""}" onclick="this.classList.remove('blurred')">
              ${line.zh}
            </div>
          </div>
        </div>
      </div>
    `).join("");
  }

  autoPlayDialogue() {
    const conv = CONVERSATIONS_DATA[this.currentScenarioIdx];
    if (!conv || !conv.dialogue || conv.dialogue.length === 0) return;

    let idx = 0;
    this.showToast("开始连续朗读整段对话...");

    const playNext = () => {
      if (idx >= conv.dialogue.length) {
        this.showToast("整段对话连读完毕！");
        return;
      }

      const row = document.getElementById(`diag_row_${idx}`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.style.transform = "scale(1.02)";
        setTimeout(() => (row.style.transform = "scale(1)"), 1200);
      }

      const line = conv.dialogue[idx];
      this.speakVietnamese(line.vi, 0.9, () => {
        idx++;
        setTimeout(playNext, 700);
      });
    };

    playNext();
  }

  
  initQuizSession() {
    const shuffled = [...QUIZ_BANK].sort(() => 0.5 - Math.random());
    this.quizQuestions = shuffled.slice(0, 10);
    this.currentQuizIdx = 0;
    this.quizScore = 0;
    this.quizAnswered = false;

    const playCard = document.getElementById("quizPlayCard");
    const resultCard = document.getElementById("quizResultCard");
    if (playCard) playCard.style.display = "block";
    if (resultCard) resultCard.style.display = "none";

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    this.quizAnswered = false;
    const q = this.quizQuestions[this.currentQuizIdx];
    if (!q) return;

    const progNum = document.getElementById("quizProgNum");
    const scoreNum = document.getElementById("quizScoreNum");
    const progFill = document.getElementById("quizProgFill");
    const qText = document.getElementById("quizQuestionText");
    const optionsWrap = document.getElementById("quizOptionsWrap");
    const expWrap = document.getElementById("quizExpWrap");
    const nextBtn = document.getElementById("btnNextQuizQ");

    const cur = this.currentQuizIdx + 1;
    const total = this.quizQuestions.length;

    if (progNum) progNum.innerText = `题目 ${cur} / ${total}`;
    if (scoreNum) scoreNum.innerText = `得分: ${this.quizScore} / ${this.currentQuizIdx}`;
    if (progFill) progFill.style.width = `${(cur / total) * 100}%`;
    if (qText) qText.innerText = q.questionZh;
    if (expWrap) expWrap.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";

    if (optionsWrap) {
      optionsWrap.innerHTML = q.options.map((opt, idx) => `
        <button class="quiz-option-button" id="qz_btn_${idx}" onclick="app.answerQuizOption(${idx})">
          <span>${String.fromCharCode(65 + idx)}. ${opt}</span>
        </button>
      `).join("");
    }
  }

  playCurrentQuizAudio() {
    const q = this.quizQuestions[this.currentQuizIdx];
    if (q && q.audioPrompt) {
      this.speakVietnamese(q.audioPrompt);
    }
  }

  answerQuizOption(selectedIdx) {
    if (this.quizAnswered) return;
    this.quizAnswered = true;

    const q = this.quizQuestions[this.currentQuizIdx];
    const isCorrect = selectedIdx === q.correctIndex;

    if (isCorrect) this.quizScore++;

    const chosenBtn = document.getElementById(`qz_btn_${selectedIdx}`);
    if (chosenBtn) chosenBtn.classList.add(isCorrect ? "correct" : "incorrect");

    if (!isCorrect) {
      const correctBtn = document.getElementById(`qz_btn_${q.correctIndex}`);
      if (correctBtn) correctBtn.classList.add("correct");
    }

    const exp = document.getElementById("quizExpWrap");
    const nextBtn = document.getElementById("btnNextQuizQ");

    if (exp) {
      exp.style.display = "block";
      exp.style.backgroundColor = isCorrect ? "var(--color-accent-green-light)" : "var(--color-danger-light)";
      exp.style.color = isCorrect ? "#065F46" : "#991B1B";
      exp.innerHTML = `<strong>${isCorrect ? "🎉 正确！" : "❌ 再试一次："}</strong> ${q.explanationZh}`;
    }

    if (nextBtn) {
      nextBtn.style.display = "block";
      nextBtn.innerText = this.currentQuizIdx === this.quizQuestions.length - 1 ? "查看综合成绩 🏆" : "下一题 →";
    }
  }

  nextQuizQuestion() {
    if (this.currentQuizIdx < this.quizQuestions.length - 1) {
      this.currentQuizIdx++;
      this.renderQuizQuestion();
    } else {
      this.showQuizResult();
    }
  }

  showQuizResult() {
    const playCard = document.getElementById("quizPlayCard");
    const resultCard = document.getElementById("quizResultCard");
    const finalScore = document.getElementById("quizFinalScoreText");
    const feedback = document.getElementById("quizFinalFeedback");

    if (playCard) playCard.style.display = "none";
    if (resultCard) resultCard.style.display = "block";

    const total = this.quizQuestions.length;
    const score = this.quizScore;
    if (finalScore) finalScore.innerText = `${score} / ${total}`;

    const pct = Math.round((score / total) * 100);
    let msg = "做得不错！继续加油！";
    if (pct === 100) msg = "🌶️ 满分超辣！你的越南语水平极其地道扎实！";
    else if (pct >= 80) msg = "🎉 优秀！越南日常交流已完全不在话下！";
    else if (pct >= 60) msg = "👍 合格啦！再多听几遍单词卡，一定会更棒！";
    else msg = "💪 别灰心，语言贵在多听多练，再挑战一次吧！";

    if (feedback) feedback.innerText = msg;
  }

  
  renderProfileView() {
    const lvlText = document.getElementById("profCurrentLevelText");
    const learnedWords = document.getElementById("profLearnedWordsCount");
    const streakEl = document.getElementById("profStreakCount");
    const compLessons = document.getElementById("profCompletedLessonsCount");
    const goalSelect = document.getElementById("selectDailyGoal");
    const rateSelect = document.getElementById("selectSpeechRate");

    if (lvlText) lvlText.innerText = this.currentLevel;
    const totalKnown = Object.values(this.vocabularyStatus).filter((s) => s.status === "known").length;
    if (learnedWords) learnedWords.innerText = `${totalKnown} / 5,000`;
    if (streakEl) streakEl.innerText = this.streak;
    if (compLessons) compLessons.innerText = `${this.completedLessons.length} / ${LESSONS_DATA.length}`;
    if (goalSelect) goalSelect.value = this.dailyGoal;
    if (rateSelect) rateSelect.value = this.speechRate;
  }

  setDailyGoal(goalVal) {
    this.dailyGoal = parseInt(goalVal, 10) || 10;
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, this.dailyGoal);
    this.showToast(`每日目标已设定为: ${this.dailyGoal} 词/天`);
  }

  openLevelModal() {
    const modal = document.getElementById("modalLevelSelect");
    const optionsContainer = document.getElementById("onboardingLevelOptions");

    if (optionsContainer) {
      optionsContainer.innerHTML = VIETNAMESE_LEVELS.filter((l) => l.key !== "ALL").map((lvl) => `
        <div class="level-choice-card ${this.currentLevel === lvl.key ? "selected" : ""}" onclick="app.selectOnboardingLevel('${lvl.key}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 1.1rem; font-weight: 900; color: var(--color-primary);">${lvl.nameZh}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-light);">${lvl.nameVi}</span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.4;">${lvl.descZh}</p>
        </div>
      `).join("");
    }

    if (modal) modal.classList.add("active");
  }

  selectOnboardingLevel(levelKey) {
    this.currentLevel = levelKey;
    localStorage.setItem(STORAGE_KEYS.LEVEL, levelKey);
    this.openLevelModal();
  }

  confirmLevelSelection() {
    this.closeLevelModal();
    this.showToast(`已成功切换至 ${this.currentLevel} 学习水平！`);
    this.renderHomeView();
    if (this.currentPage === "vocabulary") {
      this.vocabLevelFilter = this.currentLevel;
      this.renderVocabLevelPills();
      this.filterVocabList();
    }
  }

  closeLevelModal() {
    const modal = document.getElementById("modalLevelSelect");
    if (modal) modal.classList.remove("active");
  }

  
  exportProgressData() {
    const exportData = {
      app: "Vietninie",
      version: "2.0",
      exportDate: new Date().toISOString(),
      currentLevel: this.currentLevel,
      streak: this.streak,
      dailyGoal: this.dailyGoal,
      completedLessons: this.completedLessons,
      vocabularyStatus: this.vocabularyStatus
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vietninie-learning-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("已成功导出学习进度备份！");
  }

  importProgressData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.vocabularyStatus) {
          this.vocabularyStatus = parsed.vocabularyStatus;
          this.saveJSON(STORAGE_KEYS.VOCABULARY_STATUS, this.vocabularyStatus);
        }
        if (parsed.completedLessons) {
          this.completedLessons = parsed.completedLessons;
          this.saveJSON(STORAGE_KEYS.COMPLETED_LESSONS, this.completedLessons);
        }
        if (parsed.currentLevel) {
          this.currentLevel = parsed.currentLevel;
          localStorage.setItem(STORAGE_KEYS.LEVEL, this.currentLevel);
        }
        this.showToast("已成功导入进度数据！");
        this.renderHomeView();
        this.renderProfileView();
      } catch (err) {
        alert("导入失败：文件内容不是合法的 JSON 数据。");
      }
    };
    reader.readAsText(file);
  }

  confirmResetProgress() {
    if (confirm("确定要重置所有学习记录吗？已掌握的词汇与课程通关记录将被清空。")) {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      this.completedLessons = [];
      this.vocabularyStatus = {};
      this.streak = 1;
      this.currentLevel = "A1";
      this.currentLessonId = 1;

      this.showToast("已重置所有学习进度！");
      this.renderHomeView();
      this.renderProfileView();
    }
  }

  
  showToast(message) {
    const outlet = document.getElementById("toastOutlet");
    if (!outlet) return;

    const toast = document.createElement("div");
    toast.className = "toast-pill";
    toast.innerText = message;
    outlet.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  
  loadScriptSequential(urls) {
    return new Promise((resolve) => {
      let idx = 0;
      const next = () => {
        if (idx >= urls.length) {
          resolve(true);
          return;
        }
        const pair = urls[idx++];
        const s = document.createElement("script");
        s.src = pair.primary;
        s.onload = () => next();
        s.onerror = () => {
          const sFallback = document.createElement("script");
          sFallback.src = pair.fallback;
          sFallback.onload = () => next();
          sFallback.onerror = () => next();
          document.body.appendChild(sFallback);
        };
        document.body.appendChild(s);
      };
      next();
    });
  }

  async ensureDatasetsLoaded() {
    if (
      typeof VOCABULARY_DATA !== "undefined" &&
      typeof LESSONS_DATA !== "undefined" &&
      typeof CONVERSATIONS_DATA !== "undefined" &&
      typeof QUIZ_BANK !== "undefined"
    ) {
      return;
    }

    const files = [
      "vocabulary-a1.js",
      "vocabulary-a2.js",
      "vocabulary-b1.js",
      "vocabulary-b2.js",
      "vocabulary-c1.js",
      "vocabulary-c2.js",
      "vocabulary.js",
      "lessons.js",
      "conversations.js",
      "quizzes.js"
    ];

    const pairs = files.map((f) => ({
      primary: f,
      fallback: `data/${f}`
    }));

    await this.loadScriptSequential(pairs);
  }

  async init() {

    await this.ensureDatasetsLoaded();

    if (!localStorage.getItem(STORAGE_KEYS.LEVEL)) {
      setTimeout(() => this.openLevelModal(), 500);
    }

    this.renderHomeView();
    this.renderLessonsView();
    if (this.currentPage !== "home") {
      this.navigateTo(this.currentPage);
    }
    console.log("Vietninie (越学越辣) — 越南语自然习得平台已就绪！");
  }
}

let app;
window.addEventListener("DOMContentLoaded", () => {
  app = new VietninieApp();
  window.app = app;
});
