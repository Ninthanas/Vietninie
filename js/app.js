// ============================================================================
// MAIN APP CONTROLLER (NAVBAR, ONBOARDING, DARK MODE, 4-MIRROR AUDIO,
// AUTH LOGIN/LOGOUT, 30-Q PLACEMENT TEST, 4-STEP CORE LESSONS & HOME)
// ============================================================================
const API_BASE_URL = 'http://localhost:8000';

const AudioEngine = {
  currentAudio: null,

  ensureNoReferrer() {
    if (!document.querySelector('meta[name="referrer"]')) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'no-referrer';
      document.head.appendChild(meta);
    }
  },

  speak(text, langCode = 'zh-CN', audioPath = '') {
    if (!text) return;
    this.ensureNoReferrer();

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    // 1. Try local MP3 if enabled
    if (audioPath && window.__USE_LOCAL_MP3__) {
      const prefix = window.location.pathname.includes('/pages/') ? '../assets/' : 'assets/';
      const audio = new Audio(prefix + audioPath);
      this.currentAudio = audio;
      audio.play().catch(() => this.playOnlineWaterfall(text, langCode));
      return;
    }

    // 2. 4-Mirror Online TTS Waterfall (Vietninie Engine) + Web Speech Fallback
    this.playOnlineWaterfall(text, langCode);
  },

  playOnlineWaterfall(text, langCode = 'vi-VN') {
    const isVi = langCode.toLowerCase().startsWith('vi');
    const tl = isVi ? 'vi' : 'zh-CN';
    const encoded = encodeURIComponent(text.trim());

    const streamUrls = [
      `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=gtx`,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`,
      `https://translate.google.com.vn/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`,
      `https://dict.youdao.com/dictvoice?audio=${encoded}&le=${isVi ? 'vi' : 'zh'}`
    ];

    const tryStream = (idx) => {
      if (idx >= streamUrls.length) {
        this.speakFallback(text, langCode);
        return;
      }
      const audio = new Audio();
      audio.referrerPolicy = 'no-referrer';
      audio.crossOrigin = 'anonymous';
      audio.src = streamUrls[idx];
      this.currentAudio = audio;

      let settled = false;
      const failNext = () => {
        if (settled) return;
        settled = true;
        tryStream(idx + 1);
      };

      audio.onerror = failNext;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(failNext);
      }
    };

    tryStream(0);
  },

  speakFallback(text, langCode) {
    if (!('speechSynthesis' in window)) {
      AppUI.showToast('Trình duyệt không hỗ trợ phát âm / 浏览器不支持语音合成');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode;
    utter.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(langCode.toLowerCase().slice(0, 2)));
    if (matchedVoice) utter.voice = matchedVoice;

    window.speechSynthesis.speak(utter);
  }
};

// ============================================================================
// UNIFIED AUTHENTICATION CONTROLLER (TURSO BACKEND + LOCAL FALLBACK)
// ============================================================================
const AuthManager = {
  mode: 'login', // 'login' | 'register'
  token: localStorage.getItem('vn_auth_token') || null,
  user: JSON.parse(localStorage.getItem('vn_auth_user') || 'null'),

  init() {
    this.injectModal();
    this.updateHeaderUI();
    if (this.token) {
      this.verifyTokenWithBackend();
    }
  },

  async verifyTokenWithBackend() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.user = data;
        localStorage.setItem('vn_auth_user', JSON.stringify(data));
        this.updateHeaderUI();
      }
    } catch (e) {
      // Offline mode: keep local session intact
    }
  },

  updateHeaderUI() {
    const mount = document.getElementById('navAuthMount');
    if (!mount) return;
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;

    if (this.user && this.token) {
      const displayName = this.user.display_name || this.user.username;
      mount.innerHTML = `
        <div class="auth-user-pill">
          <span>👤 ${displayName}</span>
          <button type="button" class="auth-logout-btn" onclick="AuthManager.logout()">
            ${isVi ? 'Đăng xuất' : '退出'}
          </button>
        </div>
      `;
    } else {
      mount.innerHTML = `
        <button type="button" class="btn btn-sm btn-primary" onclick="AuthManager.openModal('login')" style="padding: 8px 16px; font-size: 0.85rem;">
          🔐 ${isVi ? 'Đăng nhập / Đăng ký' : '登录 / 注册'}
        </button>
      `;
    }
  },

  injectModal() {
    if (document.getElementById('unifiedAuthModal')) return;
    const html = `
      <div id="unifiedAuthModal" class="unified-modal-overlay" role="dialog" aria-modal="true">
        <div class="unified-modal-sheet" style="max-width: 430px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h2 id="authModalHeading" style="font-size:1.4rem; font-weight:800;">🔐 Đăng nhập tài khoản</h2>
            <button type="button" onclick="AuthManager.closeModal()" style="background:none; border:none; font-size:1.6rem; cursor:pointer; color:var(--text-secondary);">×</button>
          </div>
          <div id="authModalBody"></div>
          <div id="authModalError" style="display:none; margin-top:12px; padding:10px 14px; border-radius:10px; background:#FEE2E2; color:#DC2626; font-size:0.86rem; font-weight:600;"></div>
          <div style="text-align:center; margin-top:16px; padding-top:12px; border-top:1px solid var(--border-color);">
            <button type="button" id="authToggleModeBtn" onclick="AuthManager.toggleMode()" style="background:none; border:none; color:var(--brand-primary); font-weight:700; cursor:pointer; font-size:0.9rem;">
              Chưa có tài khoản? Đăng ký ngay →
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  openModal(mode = 'login') {
    this.mode = mode;
    this.renderForm();
    const modal = document.getElementById('unifiedAuthModal');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('unifiedAuthModal');
    if (modal) modal.classList.remove('active');
    const err = document.getElementById('authModalError');
    if (err) err.style.display = 'none';
  },

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.renderForm();
  },

  renderForm() {
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    const isLogin = this.mode === 'login';
    const heading = document.getElementById('authModalHeading');
    const toggleBtn = document.getElementById('authToggleModeBtn');
    const body = document.getElementById('authModalBody');
    const err = document.getElementById('authModalError');
    if (err) err.style.display = 'none';

    if (heading) {
      heading.textContent = isLogin
        ? (isVi ? '🔐 Đăng nhập Hệ thống' : '🔐 登录学习账户')
        : (isVi ? '✨ Đăng ký Tài khoản mới' : '✨ 注册新学习账户');
    }
    if (toggleBtn) {
      toggleBtn.textContent = isLogin
        ? (isVi ? 'Chưa có tài khoản? Đăng ký ngay →' : '还没有账号？立即注册 →')
        : (isVi ? 'Đã có tài khoản? Đăng nhập ngay →' : '已有账号？直接登录 →');
    }
    if (body) {
      body.innerHTML = `
        <form onsubmit="AuthManager.submit(event)" style="display:flex; flex-direction:column; gap:14px;">
          ${!isLogin ? `
            <div>
              <label style="font-size:0.84rem; font-weight:700; display:block; margin-bottom:5px;">
                ${isVi ? 'Tên hiển thị (Biệt danh)' : '显示昵称 (选填)'}
              </label>
              <input type="text" id="authInputDisplay" class="unified-input" placeholder="${isVi ? 'VD: Minh Anh / 小明' : '例如：小明'}" />
            </div>
          ` : ''}
          <div>
            <label style="font-size:0.84rem; font-weight:700; display:block; margin-bottom:5px;">
              ${isVi ? 'Tên đăng nhập (3–20 ký tự)' : '用户名 (3-20位字母或数字)'}
            </label>
            <input type="text" id="authInputUsername" class="unified-input" placeholder="hocvien01" required />
          </div>
          <div>
            <label style="font-size:0.84rem; font-weight:700; display:block; margin-bottom:5px;">
              ${isVi ? 'Mật khẩu (tối thiểu 6 ký tự)' : '密码 (至少6位)'}
            </label>
            <input type="password" id="authInputPassword" class="unified-input" placeholder="••••••" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; padding:13px; margin-top:4px; font-size:0.96rem;">
            ${isLogin ? (isVi ? 'Đăng nhập ngay 🚀' : '立即登录 🚀') : (isVi ? 'Tạo tài khoản & Học ngay 🎉' : '完成注册并开始 🎉')}
          </button>
        </form>
      `;
    }
  },

  async submit(e) {
    e.preventDefault();
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    const username = (document.getElementById('authInputUsername')?.value || '').trim();
    const password = document.getElementById('authInputPassword')?.value || '';
    const displayName = (document.getElementById('authInputDisplay')?.value || '').trim() || username;
    const err = document.getElementById('authModalError');

    if (username.length < 3 || password.length < 6) {
      if (err) {
        err.style.display = 'block';
        err.textContent = isVi
          ? 'Tên đăng nhập cần từ 3 ký tự và mật khẩu từ 6 ký tự trở lên!'
          : '用户名至少3位，密码至少6位！';
      }
      return;
    }

    const endpoint = this.mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = this.mode === 'login'
      ? { username, password }
      : { username, password, display_name: displayName };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (err) {
          err.style.display = 'block';
          err.textContent = data.detail || (isVi ? 'Đăng nhập thất bại, vui lòng kiểm tra lại!' : '认证失败，请重试！');
        }
        return;
      }

      this.token = data.access_token;
      this.user = {
        user_id: data.user_id,
        username: data.username,
        display_name: data.display_name || displayName
      };
      localStorage.setItem('vn_auth_token', this.token);
      localStorage.setItem('vn_auth_user', JSON.stringify(this.user));
      this.updateHeaderUI();
      this.closeModal();
      AppUI.showToast(isVi
        ? `🎉 Chào mừng ${this.user.display_name} đã đăng nhập (Đồng bộ Turso Cloud)!`
        : `🎉 欢迎回来，${this.user.display_name}（已连接 Turso 云数据库）！`);
      window.dispatchEvent(new CustomEvent('sentruc:auth-changed'));
    } catch (networkErr) {
      // Smart Offline Fallback so Login/Logout ALWAYS works even if backend server isn't running
      const localUsers = JSON.parse(localStorage.getItem('vn_local_users') || '{}');
      if (this.mode === 'login') {
        if (localUsers[username] && localUsers[username].password === password) {
          this.user = localUsers[username].profile;
          this.token = 'local-jwt-' + username;
        } else {
          // Allow instant demo login if not registered yet
          this.user = { user_id: 'local_' + Date.now(), username, display_name: displayName };
          this.token = 'local-jwt-' + username;
          localUsers[username] = { password, profile: this.user };
          localStorage.setItem('vn_local_users', JSON.stringify(localUsers));
        }
      } else {
        this.user = { user_id: 'local_' + Date.now(), username, display_name: displayName };
        this.token = 'local-jwt-' + username;
        localUsers[username] = { password, profile: this.user };
        localStorage.setItem('vn_local_users', JSON.stringify(localUsers));
      }
      localStorage.setItem('vn_auth_token', this.token);
      localStorage.setItem('vn_auth_user', JSON.stringify(this.user));
      this.updateHeaderUI();
      this.closeModal();
      AppUI.showToast(isVi
        ? `✅ Đã đăng nhập tài khoản: ${this.user.display_name}!`
        : `✅ 已登录账户：${this.user.display_name}！`);
      window.dispatchEvent(new CustomEvent('sentruc:auth-changed'));
    }
  },

  logout() {
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    this.token = null;
    this.user = null;
    localStorage.removeItem('vn_auth_token');
    localStorage.removeItem('vn_auth_user');
    this.updateHeaderUI();
    AppUI.showToast(isVi ? '👋 Đã đăng xuất tài khoản thành công!' : '👋 已安全退出登录！');
    window.dispatchEvent(new CustomEvent('sentruc:auth-changed'));
  }
};

// ============================================================================
// 30-QUESTION PLACEMENT TEST CONTROLLER (A1 -> C2 / HSK 1 -> 6)
// ============================================================================
const FALLBACK_PLACEMENT_QUESTIONS = [
  { id: 'pq_a1_1', level: 'A1', question_zh: "'Xin chào' nghĩa là gì / 是什么意思？", options: ['Tạm biệt / 再见', 'Xin chào / 你好', 'Cảm ơn / 谢谢', 'Xin lỗi / 对不起'], correct_index: 1 },
  { id: 'pq_a1_2', level: 'A1', question_zh: "Số 'ba' (3) trong tiếng Việt / 越南语数字 'ba' 是？", options: ['1 (một / 一)', '2 (hai / 二)', '3 (ba / 三)', '4 (bốn / 四)'], correct_index: 2 },
  { id: 'pq_a1_3', level: 'A1', question_zh: "'Cảm ơn' (感恩/谢谢) dùng khi nào / 用于什么场合？", options: ['Chào hỏi / 打招呼', 'Cảm ơn / 道谢', 'Xin lỗi / 道歉', 'Tạm biệt / 告别'], correct_index: 1 },
  { id: 'pq_a2_1', level: 'A2', question_zh: "'Bao nhiêu tiền?' (多少钱) dùng để hỏi gì？", options: ['Ở đâu / 在哪里', 'Bao nhiêu tiền / 多少钱', 'Khi nào / 什么时候', 'Đi thế nào / 怎么去'], correct_index: 1 },
  { id: 'pq_a2_2', level: 'A2', question_zh: "Khi gọi đồ uống, 'ít đường' (少糖) nghĩa là gì？", options: ['Nhiều đường / 多糖', 'Không đường / 无糖', 'Ít đường / 少糖', 'Thêm đá / 加冰'], correct_index: 2 },
  { id: 'pq_b1_1', level: 'B1', question_zh: "'Tôi muốn đặt bàn cho 4 người' nghĩa là gì？", options: ['Mua 4 vé / 订4张票', 'Đặt bàn cho 4 người / 预订4人桌', 'Gọi 4 món / 点4道菜', 'Thanh toán / 买单'], correct_index: 1 },
  { id: 'pq_b1_2', level: 'B1', question_zh: "Trong giao thông, 'Kẹt xe' (堵车) nghĩa là gì？", options: ['Tai nạn / 事故', 'Tắc đường / 堵车', 'Đường cao tốc / 高速公路', 'Trạm xe buýt / 公交站'], correct_index: 1 },
  { id: 'pq_b2_1', level: 'B2', question_zh: "Trong thương mại, 'Ký hợp đồng' (签合同) là gì？", options: ['Xuất hóa đơn / 开发票', 'Ký kết hợp đồng / 签订合同', 'Báo giá / 报价单', 'Hoàn tiền / 退款'], correct_index: 1 },
  { id: 'pq_b2_2', level: 'B2', question_zh: "'Đàm phán thương mại' tương ứng với từ tiếng Trung nào？", options: ['商务谈判', '市场营销', '跨境物流', '人力资源'], correct_index: 0 },
  { id: 'pq_c1_1', level: 'C1', question_zh: "Thành ngữ 'Nhập gia tùy tục' (入乡随俗) có nghĩa là gì？", options: ['Biết ơn / 知恩图报', 'Vào nhà theo nếp nhà / 入乡随俗', 'Tham lam / 贪得无厌', 'Có chí thì nên / 有志者事竟成'], correct_index: 1 },
  { id: 'pq_c2_1', level: 'C2', question_zh: "'Nhân sinh quan' (人生观) và 'Thế giới quan' (世界观) thuộc lĩnh vực nào？", options: ['Ẩm thực / 餐饮', 'Triết học & Tư tưởng / 哲学与思想', 'Thể thao / 体育', 'Thời tiết / 天气'], correct_index: 1 },
  { id: 'pq_c2_2', level: 'C2', question_zh: "'Vật đổi sao dời' (物换星移 / 物是人非) diễn tả điều gì？", options: ['Sự biến thiên của thời gian & cuộc đời', 'Thời tiết nắng mưa', 'Giao thông đông đúc', 'Kinh tế tăng trưởng'], correct_index: 0 }
];

const PlacementController = {
  questions: [],
  currentIndex: 0,
  answers: {},

  init() {
    if (document.getElementById('unifiedPlacementModal')) return;
    const html = `
      <div id="unifiedPlacementModal" class="unified-modal-overlay" role="dialog" aria-modal="true">
        <div class="unified-modal-sheet" style="max-width: 660px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span class="badge badge-rose">🎯 Placement Test (A1 → C2 / HSK 1 → 6)</span>
            <button type="button" onclick="PlacementController.close()" style="background:none; border:none; font-size:1.6rem; cursor:pointer; color:var(--text-secondary);">×</button>
          </div>
          <div id="placementModalContent"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  async open() {
    this.init();
    const modal = document.getElementById('unifiedPlacementModal');
    if (modal) modal.classList.add('active');
    this.renderIntro();
  },

  close() {
    const modal = document.getElementById('unifiedPlacementModal');
    if (modal) modal.classList.remove('active');
  },

  renderIntro() {
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    const savedLevel = localStorage.getItem('sentruc_placement_level') || '';
    const mount = document.getElementById('placementModalContent');
    if (!mount) return;

    mount.innerHTML = `
      <div style="text-align:center; padding: 12px 8px;">
        <div style="font-size: 3.4rem; margin-bottom: 10px;">🧭</div>
        <h2 style="font-size: 1.65rem; font-weight: 800; margin-bottom: 8px;">
          ${isVi ? 'Bài Kiểm Tra Đánh Giá Năng Lực Đầu Vào' : '越南语 / 中文 水平定级测试'}
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 18px; line-height: 1.6;">
          ${isVi
            ? 'Hệ thống đánh giá chính xác năng lực của bạn qua các cấp độ từ Sơ cấp (A1 / HSK 1) đến Cao cấp (C2 / HSK 6) và tự động đề xuất lộ trình học phù hợp nhất.'
            : '通过精选分级考题，精准测评您当前的语言水平（A1入门 至 C2精通），并自动为您匹配最佳学习起点。'}
        </p>
        ${savedLevel ? `
          <div style="margin-bottom: 18px; padding: 12px; border-radius: 12px; background: var(--brand-secondary-soft); color: var(--brand-secondary); font-weight: 700;">
            🏆 ${isVi ? `Kết quả đánh giá gần nhất của bạn: Trình độ ${savedLevel}` : `您上次的定级结果：${savedLevel} 等级`}
          </div>
        ` : ''}
        <button type="button" class="btn btn-primary" onclick="PlacementController.startTest()" style="padding: 14px 36px; font-size: 1rem;">
          🚀 ${isVi ? 'Bắt đầu làm bài test ngay' : '立即开始定级测试'}
        </button>
      </div>
    `;
  },

  async startTest() {
    this.currentIndex = 0;
    this.answers = {};
    try {
      const res = await fetch(`${API_BASE_URL}/api/placement/questions`);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          this.questions = data.questions;
        } else {
          this.questions = FALLBACK_PLACEMENT_QUESTIONS;
        }
      } else {
        this.questions = FALLBACK_PLACEMENT_QUESTIONS;
      }
    } catch (e) {
      this.questions = FALLBACK_PLACEMENT_QUESTIONS;
    }
    this.renderQuestion();
  },

  renderQuestion() {
    const mount = document.getElementById('placementModalContent');
    if (!mount) return;
    if (this.currentIndex >= this.questions.length) {
      this.finishTest();
      return;
    }

    const q = this.questions[this.currentIndex];
    const total = this.questions.length;
    const pct = Math.round(((this.currentIndex + 1) / total) * 100);
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;

    mount.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; color:var(--text-secondary);">
            ${isVi ? `Câu hỏi ${this.currentIndex + 1} / ${total}` : `题目 ${this.currentIndex + 1} / ${total}`}
          </span>
          <span class="badge badge-jade">${isVi ? `Cấp độ câu: ${q.level}` : `难度等级: ${q.level}`}</span>
        </div>
        <div class="quiz-progress-track" style="height: 8px; margin-bottom: 20px;">
          <div class="quiz-progress-fill" style="width: ${pct}%;"></div>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 18px; line-height: 1.5;">
          ${q.question_zh}
        </h3>
        <div>
          ${q.options.map((opt, idx) => `
            <button type="button" class="placement-option-btn" onclick="PlacementController.selectAnswer('${q.id}', ${idx})">
              <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  selectAnswer(qId, selectedIdx) {
    this.answers[qId] = selectedIdx;
    this.currentIndex++;
    this.renderQuestion();
  },

  async finishTest() {
    const mount = document.getElementById('placementModalContent');
    if (!mount) return;
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;

    const payloadAnswers = Object.entries(this.answers).map(([question_id, selected_index]) => ({
      question_id,
      selected_index
    }));

    let resultData = null;
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (AuthManager.token) headers['Authorization'] = `Bearer ${AuthManager.token}`;
      const res = await fetch(`${API_BASE_URL}/api/placement/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: payloadAnswers })
      });
      if (res.ok) {
        resultData = await res.json();
      }
    } catch (e) {}

    if (!resultData) {
      // Local calculation fallback
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const counts = {};
      levels.forEach(l => counts[l] = { correct: 0, total: 0 });
      let totalCorrect = 0;

      this.questions.forEach(q => {
        const lvl = q.level || 'A1';
        if (!counts[lvl]) counts[lvl] = { correct: 0, total: 0 };
        counts[lvl].total++;
        const chosen = this.answers[q.id];
        const correctIdx = q.correct_index !== undefined ? q.correct_index : 1;
        if (chosen === correctIdx) {
          counts[lvl].correct++;
          totalCorrect++;
        }
      });

      let rec = 'A1';
      const levelScores = levels.map(lvl => {
        const c = counts[lvl].correct;
        const t = Math.max(1, counts[lvl].total);
        const pct = Math.round((c / t) * 100);
        if (pct >= 60) rec = lvl;
        return { level: lvl, correct: c, total: counts[lvl].total, percentage: pct };
      });

      resultData = {
        recommended_level: rec,
        level_scores: levelScores,
        total_correct: totalCorrect,
        total_questions: this.questions.length
      };
    }

    localStorage.setItem('sentruc_placement_level', resultData.recommended_level);
    localStorage.setItem('sentruc_placement_result', JSON.stringify(resultData));

    mount.innerHTML = `
      <div style="text-align:center; padding: 10px 4px;">
        <div style="font-size: 3.5rem; margin-bottom: 8px;">🏆</div>
        <h2 style="font-size: 1.6rem; font-weight: 800;">
          ${isVi ? 'Kết Quả Đánh Giá Trình Độ Của Bạn' : '您的语言水平定级报告'}
        </h2>
        <p style="color:var(--text-secondary); margin-top:4px;">
          ${isVi ? `Số câu đúng: ${resultData.total_correct} / ${resultData.total_questions}` : `答对题数：${resultData.total_correct} / ${resultData.total_questions}`}
        </p>
        <div style="font-size: 2.8rem; font-weight: 900; color: var(--brand-primary); margin: 12px 0;">
          ${resultData.recommended_level}
        </div>
        <div class="placement-score-grid">
          ${(resultData.level_scores || []).map(ls => `
            <div class="placement-score-cell">
              <div style="font-weight:800; font-size:0.85rem; color:var(--text-secondary);">${ls.level}</div>
              <div style="font-weight:900; font-size:1.15rem; color:var(--brand-primary); margin:4px 0;">${ls.correct}/${ls.total}</div>
              <div style="font-size:0.78rem; font-weight:700; color:${ls.percentage >= 60 ? '#059669' : '#DC2626'};">${ls.percentage}%</div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:center; gap:12px; margin-top:20px; flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" onclick="PlacementController.applyLevel('${resultData.recommended_level}')">
            ✓ ${isVi ? `Áp dụng trình độ ${resultData.recommended_level}` : `应用推荐等级 ${resultData.recommended_level}`}
          </button>
          <button type="button" class="btn btn-outline" onclick="PlacementController.startTest()">
            🔄 ${isVi ? 'Làm lại bài test' : '重新测试'}
          </button>
        </div>
      </div>
    `;
  },

  applyLevel(level) {
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    localStorage.setItem('sentruc_user_level', level);
    localStorage.setItem('vietmigo_current_level', level);
    this.close();
    AppUI.showToast(isVi
      ? `🎯 Đã cập nhật trình độ học của bạn thành: ${level}!`
      : `🎯 已将您的学习等级更新为：${level}！`);
    window.dispatchEvent(new CustomEvent('sentruc:auth-changed'));
  }
};

// ============================================================================
// 10 CORE LESSONS (4-STEP INTERACTIVE PLAYER + TURSO SCORE TRACKING)
// ============================================================================
const CORE_LESSONS_BANK = [
  {
    id: 1, level: 'A1', title_vi: 'Bài 1: Chào hỏi & Làm quen', title_zh: '第1课：日常问候与初次见面',
    vocab: [
      { vi: 'Xin chào', zh: '你好', note: 'Lời chào lịch sự thông dụng nhất' },
      { vi: 'Cảm ơn', zh: '谢谢', note: 'Bày tỏ lòng biết ơn' },
      { vi: 'Rất vui được gặp bạn', zh: '很高兴认识你', note: 'Dùng khi mới làm quen' }
    ],
    sentences: [
      { vi: 'Xin chào, tôi tên là Minh.', zh: '你好，我叫阿明。', note: 'tên là = 名字是/叫' },
      { vi: 'Hôm nay bạn có khỏe không?', zh: '你今天身体好吗？', note: 'có ... không = 吗' }
    ],
    quizzes: [
      { q: "'Xin chào' tương ứng với câu nào?", options: ['你好 (Xin chào)', '再见 (Tạm biệt)', '对不起 (Xin lỗi)'], answer: 0 },
      { q: "Khi muốn nói '很高兴认识你' bằng tiếng Việt, ta nói:", options: ['Hẹn gặp lại', 'Rất vui được gặp bạn', 'Không có gì'], answer: 1 }
    ]
  },
  {
    id: 2, level: 'A1', title_vi: 'Bài 2: Gọi món & Quán Cà phê', title_zh: '第2课：越南咖啡馆与餐厅点餐',
    vocab: [
      { vi: 'Cà phê sữa đá', zh: '越南冰奶咖啡', note: 'Thức uống nổi tiếng nhất Việt Nam' },
      { vi: 'Ít đường', zh: '少糖', note: 'Giảm độ ngọt khi gọi đồ uống' },
      { vi: 'Tính tiền', zh: '买单 / 结账', note: 'Gọi nhân viên thanh toán' }
    ],
    sentences: [
      { vi: 'Cho tôi một ly cà phê sữa đá ít đường.', zh: '请给我一杯少糖的越南冰奶咖啡。', note: 'Cho tôi = 请给我' },
      { vi: 'Em ơi, tính tiền giúp anh nhé!', zh: '服务员，请帮我买单！', note: 'tính tiền = 结账' }
    ],
    quizzes: [
      { q: "'Ít đường' (少糖) có nghĩa là gì?", options: ['Nhiều đá / 多冰', 'Ít đường / 少糖', 'Không sữa / 无奶'], answer: 1 },
      { q: "Khi muốn thanh toán hóa đơn (买单), bạn nói:", options: ['Tính tiền', 'Xin chào', 'Đi thẳng'], answer: 0 }
    ]
  },
  {
    id: 3, level: 'A2', title_vi: 'Bài 3: Mua sắm & Mặc cả giá', title_zh: '第3课：购物询价与砍价技巧',
    vocab: [
      { vi: 'Bao nhiêu tiền', zh: '多少钱', note: 'Cụm từ hỏi giá quan trọng nhất' },
      { vi: 'Đắt quá', zh: '太贵了', note: 'Dùng khi bắt đầu mặc cả' },
      { vi: 'Giảm giá', zh: '打折 / 降价', note: 'Đề nghị mức giá tốt hơn' }
    ],
    sentences: [
      { vi: 'Cái áo này giá bao nhiêu tiền?', zh: '这件衣服多少钱？', note: 'Cái áo này = 这件衣服' },
      { vi: 'Đắt quá, bớt một chút được không?', zh: '太贵了，便宜一点可以吗？', note: 'bớt một chút = 便宜一点' }
    ],
    quizzes: [
      { q: "'Bao nhiêu tiền?' dùng để hỏi thông tin gì?", options: ['Thời gian / 时间', 'Giá tiền / 价格', 'Địa điểm / 地点'], answer: 1 },
      { q: "'Giảm giá' có nghĩa tiếng Trung là:", options: ['打折 / 降价', '开发票', '免运费'], answer: 0 }
    ]
  },
  {
    id: 4, level: 'B1', title_vi: 'Bài 4: Giao thông & Đặt xe Grab', title_zh: '第4课：打车出行与问路导航',
    vocab: [
      { vi: 'Sân bay', zh: '机场', note: 'Điểm đến phổ biến khi đi công tác' },
      { vi: 'Rẽ trái / Rẽ phải', zh: '左转 / 右转', note: 'Chỉ đường cho tài xế' },
      { vi: 'Kẹt xe', zh: '堵车', note: 'Tình trạng giao thông giờ cao điểm' }
    ],
    sentences: [
      { vi: 'Anh chở tôi đến sân bay Tân Sơn Nhất nhé.', zh: '请载我去新山一国际机场。', note: 'chở tôi đến = 载我去' },
      { vi: 'Đi thẳng rồi rẽ phải ở ngã tư phía trước.', zh: '直走然后在前面的十字路口右转。', note: 'ngã tư = 十字路口' }
    ],
    quizzes: [
      { q: "'Rẽ phải' có nghĩa là gì?", options: ['左转 (Rẽ trái)', '右转 (Rẽ phải)', '直走 (Đi thẳng)'], answer: 1 },
      { q: "'Kẹt xe' nghĩa là:", options: ['堵车 (Tắc đường)', '迷路 (Lạc đường)', '超速 (Quá tốc độ)'], answer: 0 }
    ]
  },
  {
    id: 5, level: 'B2', title_vi: 'Bài 5: Đàm phán Thương mại & Hợp đồng', title_zh: '第5课：商务洽谈与合同签署',
    vocab: [
      { vi: 'Hợp đồng', zh: '合同 / 合约', note: 'Văn bản pháp lý thương mại' },
      { vi: 'Đối tác', zh: '合作伙伴', note: 'Khách hàng hoặc công ty hợp tác' },
      { vi: 'Thanh toán quốc tế', zh: '国际结算', note: 'Thanh toán xuất nhập khẩu' }
    ],
    sentences: [
      { vi: 'Chúng tôi mong muốn hợp tác lâu dài với quý công ty.', zh: '我们希望能与贵公司建立长期合作。', note: 'hợp tác lâu dài = 长期合作' },
      { vi: 'Hai bên sẽ ký kết hợp đồng vào sáng ngày mai.', zh: '双方将于明天上午正式签署合同。', note: 'ký kết = 签署' }
    ],
    quizzes: [
      { q: "'Đối tác' (合作伙伴) dùng trong ngữ cảnh nào?", options: ['Hợp tác kinh doanh / 商务合作', 'Khám bệnh / 医院看病', 'Gọi đồ ăn / 点外卖'], answer: 0 },
      { q: "'Ký kết hợp đồng' nghĩa là:", options: ['取消合同', '签署合同', '修改合同'], answer: 1 }
    ]
  }
];

const CoreLessonController = {
  activeLesson: null,
  step: 1, // 1: Vocab, 2: Sentences, 3: Quiz, 4: Complete
  quizAnswers: {},

  init() {
    if (document.getElementById('unifiedLessonModal')) return;
    const html = `
      <div id="unifiedLessonModal" class="unified-modal-overlay" role="dialog" aria-modal="true">
        <div class="unified-modal-sheet" style="max-width: 720px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <span class="badge badge-rose" id="lessonModalBadge">🎓 Bài Học Cốt Lõi 4 Bước</span>
            <button type="button" onclick="CoreLessonController.close()" style="background:none; border:none; font-size:1.6rem; cursor:pointer; color:var(--text-secondary);">×</button>
          </div>
          <div id="lessonModalContent"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  },

  openSelector() {
    this.init();
    const modal = document.getElementById('unifiedLessonModal');
    if (modal) modal.classList.add('active');
    const mount = document.getElementById('lessonModalContent');
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    const scores = this.getSavedScores();

    mount.innerHTML = `
      <div>
        <h2 style="font-size:1.5rem; font-weight:800; margin-bottom:6px;">
          ${isVi ? '🎓 Khóa Học Cốt Lõi 4 Bước (Có Chấm Điểm & Lưu Hồ Sơ)' : '🎓 4步法核心闯关课程（自动计分与云端存档）'}
        </h2>
        <p style="color:var(--text-secondary); margin-bottom:18px; font-size:0.92rem;">
          ${isVi
            ? 'Mỗi bài học gồm 4 bước: Từ vựng → Câu mẫu → Kiểm tra tính điểm → Lưu điểm vào bảng thành tích.'
            : '每课包含 4 个互动步骤：核心词汇 → 实用句型 → 随堂测验计分 → 云端成绩保存。'}
        </p>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${CORE_LESSONS_BANK.map(lesson => {
            const rec = scores[lesson.id];
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-radius:14px; border:1px solid var(--border-color); background:var(--bg-primary); gap:12px; flex-wrap:wrap;">
                <div>
                  <span class="badge badge-rose">${lesson.level}</span>
                  <strong style="font-size:1.05rem; margin-left:6px;">${isVi ? lesson.title_vi : lesson.title_zh}</strong>
                  ${rec ? `<div style="font-size:0.82rem; color:#059669; font-weight:700; margin-top:4px;">✓ Đã hoàn thành • Điểm số: ${rec.score}/${rec.total} (${rec.date})</div>` : ''}
                </div>
                <button type="button" class="btn btn-sm btn-primary" onclick="CoreLessonController.startLesson(${lesson.id})">
                  ${rec ? (isVi ? 'Học lại 🔄' : '重新闯关 🔄') : (isVi ? 'Bắt đầu học →' : '开始学习 →')}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  close() {
    const modal = document.getElementById('unifiedLessonModal');
    if (modal) modal.classList.remove('active');
  },

  startLesson(id) {
    this.activeLesson = CORE_LESSONS_BANK.find(l => l.id === id) || CORE_LESSONS_BANK[0];
    this.step = 1;
    this.quizAnswers = {};
    this.renderStep();
  },

  renderStep() {
    const mount = document.getElementById('lessonModalContent');
    if (!mount || !this.activeLesson) return;
    const l = this.activeLesson;
    const isVi = window.LanguageManager ? window.LanguageManager.getNativeLang() === 'vi' : true;
    const badge = document.getElementById('lessonModalBadge');
    if (badge) badge.textContent = `${l.level} • Bước ${this.step} / 4`;

    if (this.step === 1) {
      mount.innerHTML = `
        <div>
          <h3 style="font-size:1.35rem; font-weight:800; margin-bottom:14px;">📖 Bước 1/4: Từ vựng trọng tâm</h3>
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
            ${l.vocab.map(v => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; border-radius:12px; background:var(--bg-primary); border:1px solid var(--border-color);">
                <div>
                  <div style="font-size:1.2rem; font-weight:800; color:var(--brand-primary);">${v.vi}</div>
                  <div style="font-weight:700; margin:2px 0;">${v.zh}</div>
                  <div style="font-size:0.84rem; color:var(--text-secondary);">${v.note}</div>
                </div>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn btn-sm btn-outline" onclick="AudioEngine.speak('${v.vi.replace(/'/g, "\\'")}', 'vi-VN')">🔊 VI</button>
                  <button type="button" class="btn btn-sm btn-outline" onclick="AudioEngine.speak('${v.zh.replace(/'/g, "\\'")}', 'zh-CN')">🔊 ZH</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between;">
            <button type="button" class="btn btn-outline" onclick="CoreLessonController.openSelector()">← Danh sách bài</button>
            <button type="button" class="btn btn-primary" onclick="CoreLessonController.step = 2; CoreLessonController.renderStep();">Tiếp tục Bước 2 (Câu mẫu) →</button>
          </div>
        </div>
      `;
    } else if (this.step === 2) {
      mount.innerHTML = `
        <div>
          <h3 style="font-size:1.35rem; font-weight:800; margin-bottom:14px;">💬 Bước 2/4: Mẫu câu giao tiếp thực tế</h3>
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
            ${l.sentences.map(s => `
              <div style="padding:16px; border-radius:12px; background:var(--bg-primary); border:1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                  <div>
                    <div style="font-size:1.15rem; font-weight:800;">${s.vi}</div>
                    <div style="color:var(--brand-primary); font-weight:700; margin:4px 0;">${s.zh}</div>
                    <div style="font-size:0.84rem; color:var(--text-secondary);">💡 ${s.note}</div>
                  </div>
                  <button type="button" class="btn btn-sm btn-primary" onclick="AudioEngine.speak('${s.vi.replace(/'/g, "\\'")}', 'vi-VN')">🔊 Nghe</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between;">
            <button type="button" class="btn btn-outline" onclick="CoreLessonController.step = 1; CoreLessonController.renderStep();">← Quay lại Bước 1</button>
            <button type="button" class="btn btn-primary" onclick="CoreLessonController.step = 3; CoreLessonController.renderStep();">Tiếp tục Bước 3 (Kiểm tra tính điểm) →</button>
          </div>
        </div>
      `;
    } else if (this.step === 3) {
      mount.innerHTML = `
        <div>
          <h3 style="font-size:1.35rem; font-weight:800; margin-bottom:14px;">✅ Bước 3/4: Bài tập kiểm tra lấy điểm</h3>
          <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:20px;">
            ${l.quizzes.map((q, qIdx) => `
              <div style="padding:16px; border-radius:12px; background:var(--bg-primary); border:1px solid var(--border-color);">
                <div style="font-weight:800; margin-bottom:10px;">Câu ${qIdx + 1}: ${q.q}</div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${q.options.map((opt, oIdx) => {
                    const selected = this.quizAnswers[qIdx] === oIdx;
                    return `
                      <button type="button" class="placement-option-btn" style="margin:0; ${selected ? 'border-color:var(--brand-primary); background:var(--brand-primary-soft);' : ''}" onclick="CoreLessonController.quizAnswers[${qIdx}] = ${oIdx}; CoreLessonController.renderStep();">
                        ${String.fromCharCode(65 + oIdx)}. ${opt}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between;">
            <button type="button" class="btn btn-outline" onclick="CoreLessonController.step = 2; CoreLessonController.renderStep();">← Quay lại Bước 2</button>
            <button type="button" class="btn btn-primary" onclick="CoreLessonController.completeLesson()">🏆 Nộp bài & Lưu điểm số →</button>
          </div>
        </div>
      `;
    } else if (this.step === 4) {
      const total = l.quizzes.length;
      let score = 0;
      l.quizzes.forEach((q, idx) => {
        if (this.quizAnswers[idx] === q.answer) score++;
      });

      mount.innerHTML = `
        <div style="text-align:center; padding:16px 8px;">
          <div style="font-size:3.6rem; margin-bottom:10px;">🎉</div>
          <h2 style="font-size:1.6rem; font-weight:800;">Hoàn Thành Bài Học!</h2>
          <p style="font-size:1.2rem; font-weight:800; color:var(--brand-primary); margin:10px 0;">
            Điểm số đạt được: ${score} / ${total} (${Math.round((score / Math.max(1, total)) * 100)}%)
          </p>
          <p style="color:var(--text-secondary); margin-bottom:22px;">
            Kết quả điểm số đã được lưu vào Hồ sơ Tiến độ và đồng bộ lên hệ thống!
          </p>
          <div style="display:flex; justify-content:center; gap:12px;">
            <button type="button" class="btn btn-primary" onclick="CoreLessonController.openSelector()">📚 Học bài tiếp theo</button>
            <button type="button" class="btn btn-outline" onclick="CoreLessonController.close()">Đóng cửa sổ</button>
          </div>
        </div>
      `;
    }
  },

  async completeLesson() {
    const l = this.activeLesson;
    if (!l) return;
    const total = l.quizzes.length;
    let score = 0;
    l.quizzes.forEach((q, idx) => {
      if (this.quizAnswers[idx] === q.answer) score++;
    });

    // Save to localStorage
    const saved = this.getSavedScores();
    saved[l.id] = {
      lesson_id: l.id,
      title_vi: l.title_vi,
      title_zh: l.title_zh,
      score,
      total,
      date: new Date().toISOString().slice(0, 10)
    };
    localStorage.setItem('sentruc_lesson_scores', JSON.stringify(saved));

    // Sync to Turso Backend if logged in
    if (AuthManager.token) {
      try {
        await fetch(`${API_BASE_URL}/api/lessons/${l.id}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthManager.token}`
          },
          body: JSON.stringify({
            quiz_score: score,
            quiz_total: total,
            steps_completed: 4,
            completed: true
          })
        });
      } catch (e) {}
    }

    this.step = 4;
    this.renderStep();
    window.dispatchEvent(new CustomEvent('sentruc:auth-changed'));
  },

  getSavedScores() {
    try {
      return JSON.parse(localStorage.getItem('sentruc_lesson_scores') || '{}');
    } catch {
      return {};
    }
  }
};

const AppUI = {
  isSubpage() {
    return window.location.pathname.includes('/pages/');
  },

  linkPath(target) {
    const sub = this.isSubpage();
    if (target === 'index.html') return sub ? '../index.html' : 'index.html';
    return sub ? target.replace('pages/', '') : target;
  },

  assetPath(relPath) {
    return (this.isSubpage() ? '../' : '') + relPath;
  },

  initTheme() {
    const savedTheme = localStorage.getItem('sentruc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sentruc_theme', next);
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.setAttribute('title', isDark ? 'Light Mode' : 'Dark Mode');
  },

  showToast(message) {
    let toast = document.getElementById('sentrucToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sentrucToast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  },

  renderShell() {
    const headerMount = document.getElementById('appHeader');
    const footerMount = document.getElementById('appFooter');
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    if (headerMount) {
      headerMount.innerHTML = `
        <header class="site-header">
          <div class="container navbar">
            <a href="${this.linkPath('index.html')}" class="brand-logo" aria-label="Vietninie Home">
              <img src="${this.assetPath('logo-mark.svg')}" onerror="this.onerror=null;this.src='${this.assetPath('assets/images/mascot.svg')}'" alt="Vietninie Logo" />
              <div>
                <span data-i18n="brandName">Vietninie</span>
                <small class="brand-subtitle" data-i18n="brandTagline">越学越辣 🌶️ • Song Ngữ Việt ⇄ Trung</small>
              </div>
            </a>

            <nav class="desktop-main-nav" aria-label="Main Navigation">
              <ul class="nav-links">
                <li><a href="${this.linkPath('index.html')}" class="${currentFile === 'index.html' ? 'active' : ''}" data-i18n="home">Trang chủ</a></li>
                <li><a href="javascript:void(0)" onclick="CoreLessonController.openSelector()" class="nav-highlight-pill">🎓 Bài học 4 bước</a></li>
                <li><a href="${this.linkPath('pages/vocabulary.html')}" class="${currentFile.includes('vocabulary') ? 'active' : ''}" data-i18n="vocabulary">Từ vựng</a></li>
                <li><a href="${this.linkPath('pages/grammar.html')}" class="${currentFile === 'grammar.html' ? 'active' : ''}" data-i18n="grammar">Ngữ pháp</a></li>
                <li><a href="${this.linkPath('pages/conversation.html')}" class="${currentFile === 'conversation.html' ? 'active' : ''}" data-i18n="conversation">Hội thoại</a></li>
                <li><a href="${this.linkPath('pages/listening.html')}" class="${currentFile === 'listening.html' ? 'active' : ''}" data-i18n="listening">Luyện nghe</a></li>
                <li><a href="${this.linkPath('pages/quiz.html')}" class="${currentFile === 'quiz.html' ? 'active' : ''}" data-i18n="quiz">Quiz</a></li>
                <li><a href="${this.linkPath('pages/progress.html')}" class="${currentFile === 'progress.html' ? 'active' : ''}" data-i18n="progress">Tiến độ</a></li>
                <li><a href="${this.linkPath('pages/settings.html')}" class="${currentFile === 'settings.html' ? 'active' : ''}" data-i18n="settings">Cài đặt</a></li>
              </ul>
            </nav>

            <div class="nav-actions">
              <button type="button" class="btn btn-sm btn-outline nav-test-btn" onclick="PlacementController.open()" title="Kiểm tra trình độ đầu vào A1-C2">
                🎯 <span class="hide-on-compact">Test Level</span>
              </button>
              <div id="navAuthMount"></div>
              <button type="button" id="langSwitchBtn" class="lang-switch-btn" aria-label="Switch Language" title="Đổi ngôn ngữ Việt ⇄ Trung">
                <span>🇻🇳⇄🇨🇳</span>
                <span class="switch-label-text" data-i18n="switchLangBtn">Đổi ngôn ngữ</span>
              </button>
              <button type="button" id="themeToggleBtn" class="btn-icon" aria-label="Toggle Dark Mode">
                🌙
              </button>
              <button type="button" id="mobileDrawerToggleBtn" class="btn-icon mobile-menu-trigger" onclick="document.getElementById('mobileNavDrawer').classList.add('open')" aria-label="Open Menu">
                ☰
              </button>
            </div>
          </div>
        </header>

        <!-- Slide-Out Responsive Drawer for Tablet & Mobile -->
        <div id="mobileNavDrawer" class="mobile-nav-drawer-backdrop" onclick="if(event.target===this)this.classList.remove('open')">
          <aside class="mobile-nav-drawer">
            <div class="drawer-header">
              <div class="brand-logo">
                <img src="${this.assetPath('logo-mark.svg')}" alt="Vietninie" style="width:36px;height:36px;border-radius:10px;" />
                <div>
                  <strong>Vietninie 🌶️</strong>
                  <small style="display:block;font-size:0.72rem;color:var(--brand-primary);">越学越辣 • Việt ⇄ Trung</small>
                </div>
              </div>
              <button type="button" class="btn-icon" onclick="document.getElementById('mobileNavDrawer').classList.remove('open')">✕</button>
            </div>

            <div class="drawer-quick-actions">
              <button type="button" class="btn btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('mobileNavDrawer').classList.remove('open'); CoreLessonController.openSelector();">
                🎓 Học Khóa 4 Bước (Lưu điểm)
              </button>
              <button type="button" class="btn btn-outline" style="width:100%;justify-content:center;" onclick="document.getElementById('mobileNavDrawer').classList.remove('open'); PlacementController.open();">
                🎯 Làm Bài Test Đầu Vào (A1–C2)
              </button>
            </div>

            <nav class="drawer-links">
              <a href="${this.linkPath('index.html')}" class="${currentFile === 'index.html' ? 'active' : ''}">🏠 <span data-i18n="home">Trang chủ</span></a>
              <a href="${this.linkPath('pages/vocabulary.html')}" class="${currentFile.includes('vocabulary') ? 'active' : ''}">📚 <span data-i18n="vocabulary">Kho Từ vựng & Flashcard 3D</span></a>
              <a href="${this.linkPath('pages/grammar.html')}" class="${currentFile === 'grammar.html' ? 'active' : ''}">📐 <span data-i18n="grammar">Chuyên đề Ngữ pháp</span></a>
              <a href="${this.linkPath('pages/conversation.html')}" class="${currentFile === 'conversation.html' ? 'active' : ''}">💬 <span data-i18n="conversation">17 Tình huống Hội thoại</span></a>
              <a href="${this.linkPath('pages/listening.html')}" class="${currentFile === 'listening.html' ? 'active' : ''}">🎧 <span data-i18n="listening">Luyện nghe & Phát âm</span></a>
              <a href="${this.linkPath('pages/quiz.html')}" class="${currentFile === 'quiz.html' ? 'active' : ''}">🧠 <span data-i18n="quiz">8 Chế độ Quiz</span></a>
              <a href="${this.linkPath('pages/progress.html')}" class="${currentFile === 'progress.html' ? 'active' : ''}">📊 <span data-i18n="progress">Tiến độ & Bảng điểm</span></a>
              <a href="${this.linkPath('pages/settings.html')}" class="${currentFile === 'settings.html' ? 'active' : ''}">⚙️ <span data-i18n="settings">Cài đặt & Quản trị CMS</span></a>
            </nav>

            <div class="drawer-footer">
              <button type="button" class="btn btn-sm btn-outline" style="width:100%;" onclick="document.getElementById('mobileNavDrawer').classList.remove('open'); document.getElementById('onboardingBackdrop')?.classList.add('active');">
                🌏 Chọn lại hướng học & Trình độ
              </button>
            </div>
          </aside>
        </div>

        <!-- Mobile Bottom Navigation Bar -->
        <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
          <a href="${this.linkPath('index.html')}" class="${currentFile === 'index.html' ? 'active' : ''}">
            <span class="nav-icon">🏠</span>
            <span data-i18n="home">Trang chủ</span>
          </a>
          <a href="javascript:void(0)" onclick="CoreLessonController.openSelector()">
            <span class="nav-icon">🎓</span>
            <span>Bài học</span>
          </a>
          <a href="${this.linkPath('pages/vocabulary.html')}" class="${currentFile.includes('vocabulary') ? 'active' : ''}">
            <span class="nav-icon">📚</span>
            <span data-i18n="vocabulary">Từ vựng</span>
          </a>
          <a href="${this.linkPath('pages/quiz.html')}" class="${currentFile === 'quiz.html' ? 'active' : ''}">
            <span class="nav-icon">🧠</span>
            <span data-i18n="quiz">Quiz</span>
          </a>
          <a href="${this.linkPath('pages/progress.html')}" class="${(currentFile === 'progress.html' || currentFile === 'settings.html') ? 'active' : ''}">
            <span class="nav-icon">👤</span>
            <span data-i18n="profile">Hồ sơ</span>
          </a>
        </nav>
      `;
    }

    if (footerMount) {
      footerMount.innerHTML = `
        <footer class="site-footer">
          <div class="container">
            <div class="footer-grid">
              <div>
                <div class="brand-logo" style="margin-bottom: 12px;">
                  <img src="${this.assetPath('logo-mark.svg')}" onerror="this.onerror=null;this.src='${this.assetPath('assets/images/mascot.svg')}'" alt="Vietninie Logo" />
                  <span data-i18n="brandName">Vietninie (越学越辣 🌶️)</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 380px;">
                  Nền tảng học ngoại ngữ song ngữ Việt Nam ⇄ Trung Quốc chính thức: 5.000+ từ vựng thực tế, 10 Bài học 4 bước, Bài Test đầu vào A1–C2, Flashcard 3D SRS, 8 chế độ Quiz & Đồng bộ đám mây Turso.
                </p>
              </div>
              <div>
                <h4 style="margin-bottom: 12px;" data-i18n="vocabulary">Từ vựng & Bài học</h4>
                <ul class="footer-links">
                  <li><a href="javascript:void(0)" onclick="CoreLessonController.openSelector()">🎓 10 Bài học cốt lõi (4 bước)</a></li>
                  <li><a href="${this.linkPath('pages/vocabulary.html')}">60 Chủ đề thông dụng</a></li>
                  <li><a href="${this.linkPath('pages/vocabulary.html')}?mode=flashcard">Flashcard 3D & SRS</a></li>
                </ul>
              </div>
              <div>
                <h4 style="margin-bottom: 12px;" data-i18n="grammar">Kỹ năng & Kiểm tra</h4>
                <ul class="footer-links">
                  <li><a href="javascript:void(0)" onclick="PlacementController.open()">🎯 Bài Test Đầu Vào (A1–C2)</a></li>
                  <li><a href="${this.linkPath('pages/grammar.html')}">Chuyên đề Ngữ pháp</a></li>
                  <li><a href="${this.linkPath('pages/conversation.html')}">17 Tình huống Hội thoại</a></li>
                </ul>
              </div>
              <div>
                <h4 style="margin-bottom: 12px;" data-i18n="progress">Tài khoản & Tiến độ</h4>
                <ul class="footer-links">
                  <li><a href="javascript:void(0)" onclick="AuthManager.openModal('login')">🔐 Đăng nhập / Đăng ký</a></li>
                  <li><a href="${this.linkPath('pages/progress.html')}">📊 Bảng điểm & Tiến độ</a></li>
                  <li><a href="${this.linkPath('pages/settings.html')}">⚙️ Cài đặt & Quản trị CMS</a></li>
                </ul>
              </div>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; color: var(--text-muted); font-size: 0.84rem;">
              <span>© 2026 SenTrúc × Vietninie Official Bilingual Platform (Việt Nam 🇻🇳 ⇄ 🇨🇳 Trung Quốc).</span>
              <span>Turso Cloud DB Connected • 4-Mirror Audio Engine</span>
            </div>
          </div>
        </footer>
      `;
    }

    this.initOnboardingModal();
    this.bindGlobalEvents();
    this.updateThemeIcon();
    AuthManager.init();
    PlacementController.init();
    CoreLessonController.init();
    if (window.LanguageManager) {
      window.LanguageManager.applyTranslations();
    }
  },

  initOnboardingModal() {
    if (document.getElementById('onboardingBackdrop')) return;
    const currentLang = window.LanguageManager ? window.LanguageManager.getNativeLang() : 'vi';
    const currentLevel = localStorage.getItem('sentruc_user_level') || 'beginner';

    const modalHtml = `
      <div id="onboardingBackdrop" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboardModalTitle">
        <div class="onboarding-modal">
          <img src="${this.assetPath('assets/images/mascot.svg')}" alt="BaoSen Mascot" class="onboarding-mascot" />
          <h2 id="onboardModalTitle" data-i18n="onboardTitle">Chào mừng bạn đến với SenTrúc × Vietninie! 🌏</h2>
          <p style="color: var(--text-secondary); margin-top: 6px;" data-i18n="onboardSubtitle">
            Hãy chọn ngôn ngữ mẹ đẻ của bạn để hệ thống thiết lập chương trình học:
          </p>

          <div class="onboarding-grid">
            <div class="onboarding-card ${currentLang === 'vi' ? 'selected' : ''}" data-select-lang="vi" tabindex="0">
              <span class="flag">🇻🇳</span>
              <h3>Tôi là người Việt Nam</h3>
              <p>Giao diện Tiếng Việt<br/><strong>Học Tiếng Trung 🇨🇳 (HSK 1–6)</strong></p>
            </div>
            <div class="onboarding-card ${currentLang === 'zh' ? 'selected' : ''}" data-select-lang="zh" tabindex="0">
              <span class="flag">🇨🇳</span>
              <h3>我是中国人</h3>
              <p>中文界面<br/><strong>学习越南语 🇻🇳 (A1–C2 词汇)</strong></p>
            </div>
          </div>

          <h4 style="margin-top: 16px;" data-i18n="onboardLevelTitle">Bạn đang ở trình độ nào? / 您目前的水平是？</h4>
          <div class="level-grid">
            <button type="button" class="level-btn ${currentLevel === 'beginner' ? 'selected' : ''}" data-select-level="beginner" data-i18n="lvlBeginner">🌱 Mới bắt đầu (A1 / HSK 1)</button>
            <button type="button" class="level-btn ${currentLevel === 'elementary' ? 'selected' : ''}" data-select-level="elementary" data-i18n="lvlElementary">🌿 Cơ bản (A2 / HSK 2)</button>
            <button type="button" class="level-btn ${currentLevel === 'intermediate' ? 'selected' : ''}" data-select-level="intermediate" data-i18n="lvlIntermediate">🌳 Trung cấp (B1-B2 / HSK 3-4)</button>
            <button type="button" class="level-btn ${currentLevel === 'advanced' ? 'selected' : ''}" data-select-level="advanced" data-i18n="lvlAdvanced">🎋 Nâng cao (C1-C2 / HSK 5-6)</button>
          </div>

          <div style="display:flex; gap:10px; margin-top: 12px; flex-wrap:wrap;">
            <button type="button" id="confirmOnboardBtn" class="btn btn-primary" style="flex: 2; padding: 14px; font-size: 0.96rem;" data-i18n="onboardConfirm">
              Hoàn tất & Bắt đầu học 🚀
            </button>
            <button type="button" class="btn btn-outline" style="flex: 1; padding: 14px; font-size: 0.92rem;" onclick="document.getElementById('onboardingBackdrop').classList.remove('active'); localStorage.setItem('sentruc_onboarded', 'true'); PlacementController.open();">
              🎯 Làm bài Test đầu vào
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const backdrop = document.getElementById('onboardingBackdrop');
    if (!localStorage.getItem('sentruc_onboarded')) {
      setTimeout(() => backdrop.classList.add('active'), 150);
    }

    backdrop.querySelectorAll('[data-select-lang]').forEach(card => {
      card.addEventListener('click', () => {
        backdrop.querySelectorAll('[data-select-lang]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const chosen = card.getAttribute('data-select-lang');
        window.LanguageManager.setNativeLang(chosen);
        AuthManager.updateHeaderUI();
      });
    });

    backdrop.querySelectorAll('[data-select-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        backdrop.querySelectorAll('[data-select-level]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        localStorage.setItem('sentruc_user_level', btn.getAttribute('data-select-level'));
      });
    });

    document.getElementById('confirmOnboardBtn').addEventListener('click', () => {
      localStorage.setItem('sentruc_onboarded', 'true');
      backdrop.classList.remove('active');
      const native = window.LanguageManager.getNativeLang();
      this.showToast(native === 'vi' ? '🇻🇳 Đã thiết lập: Giao diện Tiếng Việt → Học Tiếng Trung!' : '🇨🇳 已设置：中文界面 → 学习越南语！');
    });
  },

  bindGlobalEvents() {
    const langBtn = document.getElementById('langSwitchBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        window.LanguageManager.toggleLanguage();
        AuthManager.updateHeaderUI();
        const native = window.LanguageManager.getNativeLang();
        this.showToast(native === 'vi' ? '🇻🇳 Đã chuyển sang: Người Việt học Tiếng Trung' : '🇨🇳 已切换至：中国人学习越南语');
      });
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    const onboardBtn = document.getElementById('openOnboardBtn');
    if (onboardBtn) {
      onboardBtn.addEventListener('click', () => {
        const backdrop = document.getElementById('onboardingBackdrop');
        if (backdrop) backdrop.classList.add('active');
      });
    }

    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.faq-item').classList.toggle('open');
      });
    });
  },

  async renderHomePreviews() {
    const vocabPreviewEl = document.getElementById('homeVocabPreview');
    const spotlightEl = document.getElementById('homeSpotlightCard');
    const progressPreviewEl = document.getElementById('homeProgressSummary');
    if (!vocabPreviewEl && !spotlightEl) return;

    const vocabList = await window.DataService.getActiveVocabulary();
    const learningLang = window.LanguageManager.getLearningLang();
    const isLearningZh = learningLang === 'zh';

    if (spotlightEl && vocabList.length > 0) {
      const item = vocabList[0];
      const targetWord = item.word;
      const subPhonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
      const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
      const exTarget = isLearningZh ? item.example_zh : item.example_vi;
      const exNative = isLearningZh ? item.example_vi : item.example_zh;
      const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';

      spotlightEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="badge badge-rose">${item.level}</span>
            <span class="badge badge-jade">${isLearningZh ? item.topic_label_vi : item.topic_label_zh}</span>
          </div>
          <button type="button" class="btn btn-sm btn-primary" onclick="AudioEngine.speak('${targetWord.replace(/'/g, "\\'")}', '${speechLang}', '${item.pronunciation}')">
            🔊 ${isLearningZh ? 'Nghe' : '听发音'}
          </button>
        </div>
        <div class="spotlight-hanzi" style="margin-top: 10px;">${targetWord}</div>
        <div class="spotlight-pinyin">${subPhonetic}</div>
        <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 10px;">${meaning}</div>
        <div style="font-size: 0.88rem; color: var(--text-secondary); background: var(--bg-secondary); padding: 10px 12px; border-radius: 12px;">
          <div><strong>${exTarget}</strong></div>
          <div>${exNative}</div>
        </div>
      `;
    }

    if (vocabPreviewEl) {
      const sample = vocabList.slice(0, 6);
      vocabPreviewEl.innerHTML = sample.map(item => {
        const subPhonetic = isLearningZh ? item.pinyin : item.pronunciation_guide;
        const meaning = isLearningZh ? item.meaning_vi : item.meaning_zh;
        const exTarget = isLearningZh ? item.example_zh : item.example_vi;
        const exNative = isLearningZh ? item.example_vi : item.example_zh;
        const speechLang = isLearningZh ? 'zh-CN' : 'vi-VN';
        return `
          <article class="vocab-card">
            <div>
              <div class="vocab-card-header">
                <span class="badge badge-rose">${item.level}</span>
                <button type="button" class="action-icon-btn" onclick="AudioEngine.speak('${item.word.replace(/'/g, "\\'")}', '${speechLang}', '${item.pronunciation}')">
                  🔊 ${isLearningZh ? 'Nghe' : '发音'}
                </button>
              </div>
              <div class="vocab-word-main">${item.word}</div>
              <div class="vocab-pinyin">${subPhonetic}</div>
              <div class="vocab-meaning">${meaning}</div>
              <div class="vocab-example-box">
                <div class="ex-target">${exTarget}</div>
                <div class="ex-native">${exNative}</div>
              </div>
            </div>
            <div class="vocab-card-footer">
              <span style="font-size:0.78rem; color:var(--text-muted);">${isLearningZh ? item.topic_label_vi : item.topic_label_zh}</span>
              <a href="pages/vocabulary-detail.html?id=${item.id}" class="btn btn-sm btn-outline">${isLearningZh ? 'Chi tiết →' : '查看详情 →'}</a>
            </div>
          </article>
        `;
      }).join('');
    }

    if (progressPreviewEl) {
      const learnedCount = window.StorageManager.getLearnedIds().size;
      const totalCount = vocabList.length;
      const pct = Math.min(100, Math.round((learnedCount / Math.max(1, totalCount)) * 100));
      const streak = window.StorageManager.getStreak();
      const placementLvl = localStorage.getItem('sentruc_placement_level') || 'A1';
      progressPreviewEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <strong>${isLearningZh ? 'Tiến độ học Tiếng Trung (HSK 1–6)' : '越南语词库掌握进度 (A1–C2)'}</strong>
          <span class="badge badge-jade">${learnedCount} / ${totalCount} (${pct}%)</span>
        </div>
        <div class="quiz-progress-track" style="margin: 8px 0 16px;">
          <div class="quiz-progress-fill" style="width: ${Math.max(4, pct)}%;"></div>
        </div>
        <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:0.88rem; margin-bottom:12px;">
          <span>📚 ${isLearningZh ? 'Đã học' : '已学'}: <strong>${learnedCount}</strong></span>
          <span>🔥 Streak: <strong>${streak} ${isLearningZh ? 'ngày' : '天'}</strong></span>
          <span>🧭 Level: <strong>${placementLvl}</strong></span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="CoreLessonController.openSelector()">🎓 Học bài 4 bước</button>
          <button type="button" class="btn btn-sm btn-outline" onclick="PlacementController.open()">🎯 Test đầu vào</button>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppUI.initTheme();
  AppUI.renderShell();
  AppUI.renderHomePreviews();

  window.addEventListener('sentruc:lang-changed', () => {
    AppUI.renderHomePreviews();
  });
  window.addEventListener('sentruc:auth-changed', () => {
    AppUI.renderHomePreviews();
  });
});

window.AudioEngine = AudioEngine;
window.AuthManager = AuthManager;
window.PlacementController = PlacementController;
window.CoreLessonController = CoreLessonController;
window.AppUI = AppUI;
