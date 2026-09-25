# 🌶️ Vietninie (越学越辣) — 越南语自然习得平台

> **Tagline**: 学一点越南语，走进真实的越南生活。  
> **English Tagline**: Learn Vietnamese naturally.  
> **Slogan**: 越学越辣 🌶️

Vietninie 是一个专为中文母语者量身打造的**完全免费、纯前端、轻量化、无需后端与数据库**的实用越南语自学工具。内建 **5,000 个真实生活词汇**、**A1 到 C2 进阶体系**、**真人语音跟读**、**六大声调辨析**与**沉浸式情境对话**。

---

## 🌟 核心特性 (Core Features)

1. **5,000 实战生活词汇**：覆盖 A1 (入门 ~800词)、A2 (基础 ~900词)、B1 (中级 ~1,000词)、B2 (中高级 ~900词)、C1 (高级 ~800词)、C2 (精通 ~600词)。
2. **纯前端架构 (100% Client-Side)**：仅使用 HTML5 + CSS3 + 原生 JavaScript，零依赖、无构建步骤、无数据库、无付费 API。
3. **智能发音引擎 (Web Speech API)**：调用浏览器原生 `vi-VN` 越南语真人语音，支持 0.75x/0.9x/1.0x 语速调节。
4. **六大声调图解 (6 Vietnamese Tones)**：平声 (Ngang)、锐声 (Sắc)、玄声 (Huyền)、问声 (Hỏi)、跌声 (Ngã)、重声 (Nặng) 声调曲线与汉语对照试听。
5. **人称代词全指南 (Vietnamese Pronouns)**：Anh, Chị, Em, Cô, Chú, Bác, Ông, Bà 深度文化解析。
6. **双模实景对话 (Conversation)**：学习模式（中越双语）与实战练习模式（隐藏中文自译），支持一键连续朗读整段对话。
7. **无调号模糊检索**：输入 `ca phe`、`cà phê` 或 `咖啡` 均可在 10 毫秒内迅速匹配结果。
8. **本地无感同步 (LocalStorage)**：自动记录学习打卡连续天数 (Streak 🔥)、今日学习目标、已掌握词汇、进度备份导出导入。
9. **移动端优先 (Mobile-First)**：优雅的底部导航栏、触摸热区均 ≥ 44px、适配手机、平板与桌面电脑。

---

## 📁 项目目录结构 (Folder Structure)

```text
vietnamese-learning/
│
├── index.html                  # 应用单页 HTML (语义化、无障碍支持)
├── style.css                   # Vietninie 暖珊瑚红 (Chili Red) 设计系统
├── app.js                      # 核心控制器 (状态机、5,000词分页、搜索、音频、测验)
├── README.md                   # 项目使用与部署说明文档
│
├── data/
│   ├── vocabulary-a1.js        # A1 级别基础词汇 (800 词)
│   ├── vocabulary-a2.js        # A2 级别生活词汇 (900 词)
│   ├── vocabulary-b1.js        # B1 级别进阶词汇 (1,000 词)
│   ├── vocabulary-b2.js        # B2 级别职场商贸 (900 词)
│   ├── vocabulary-c1.js        # C1 级别成语文化 (800 词)
│   ├── vocabulary-c2.js        # C2 级别高阶思辨 (600 词)
│   ├── vocabulary.js           # 5,000 词整合主入口与分类定义
│   ├── lessons.js              # 10 门新手系统核心课程 (6 步通关流)
│   ├── conversations.js        # 7+ 个高频地道生活对话剧本
│   └── quizzes.js              # 综合互动测验题库与深度解析
│
└── assets/
    ├── logo/
    │   ├── logo.svg            # 完整品牌横版 Logo
    │   ├── logo-mark.svg       # 辣椒字母 V 标志
    │   └── favicon.svg         # 32x32 矢量浏览器标头
    └── images/
        └── illustrations/
            └── home.svg        # 首页温馨编辑风插画 (滴漏咖啡、斗笠与小红椒)
```

---

## 🚀 本地运行方式 (How to Run Locally)

### 方法 1：直接双击打开 (极简推荐)
1. 打开 `vietnamese-learning` 文件夹。
2. 双击 **`index.html`** 文件。
3. 任何现代浏览器 (Chrome、Edge、Safari、Firefox) 均可直接运行全部功能。

### 方法 2：使用简易本地 Web 服务器
- **VS Code**: 安装 **Live Server** 插件，右键 `index.html` 选择 **Open with Live Server**。
- **Python**:
  ```bash
  cd vietnamese-learning
  python -m http.server 8000
  ```
  在浏览器访问 `http://localhost:8000` 即可。

---

## 🛠️ 如何扩展自定义内容 (How to Customize & Extend)

### 1. 添加或修改词汇 (Add Vocabulary)
在对应级别的 `data/vocabulary-*.js` 文件末尾追加新的词汇对象：
```javascript
{
  id: 5001,
  vietnamese: "Bún đậu mắm tôm",
  chinese: "炸豆腐虾酱米线",
  level: "A2",
  category: "food",
  example: "Bún đậu mắm tôm là món ăn đường phố rất nổi tiếng.",
  exampleChinese: "炸豆腐虾酱米线是一道极为著名的街头风味小吃。",
  icon: "🍲",
  image: "assets/images/vocabulary/food/bun-dau.webp",
  tags: ["food", "street_food"]
}
```

### 2. 添加新课程 (Add Lesson)
在 `data/lessons.js` 中新增课程对象，系统会自动读取并更新课程目录与进度统计：
```javascript
{
  id: 11,
  lessonNumber: "11",
  titleZh: "租房与看房",
  titleVi: "Thuê nhà & Xem phòng",
  icon: "🏠",
  duration: "8 分钟",
  level: "A2 · 进阶",
  summaryZh: "学会向房东询问房租、押金、家电配置与水电费用。",
  vocabularies: [...],
  sentences: [...],
  quizzes: [...]
}
```

### 3. 添加对话场景 (Add Conversation)
在 `data/conversations.js` 中追加情景对话：
```javascript
{
  id: "conv_travel",
  titleZh: "在下龙湾乘船游览",
  titleVi: "Đi tàu tham quan Vịnh Hạ Long",
  icon: "⛵",
  badgeZh: "旅游必会",
  contextZh: "在码头向导游询问登船时间与行程安排。",
  dialogue: [
    { speakerZh: "导游", speakerVi: "Hướng dẫn viên", avatar: "👨‍✈️", isLearner: false, vi: "Xin chào quý khách!", zh: "尊贵的客人们大家好！" },
    { speakerZh: "你", speakerVi: "Bạn", avatar: "🙋‍♂️", isLearner: true, vi: "Mấy giờ tàu xuất bến vậy bạn?", zh: "请问轮船几点起航出港？" }
  ]
}
```

---

## 💾 LocalStorage 数据存储机制 (Data Persistence)

所有状态均保存在用户浏览器的 `localStorage` 中，无需联网或数据库即可永久保存：

| 存储键名 (Key) | 格式 | 含义 |
| :--- | :--- | :--- |
| `vietmigo_current_level` | `"A1"` ~ `"C2"` | 用户当前选择的学习难度等级 |
| `vietmigo_current_lesson` | `1` ~ `10` | 当前正在学习的课程编号 |
| `vietmigo_completed_lessons` | `[1, 2, 3]` | 已经顺利通关的课程 ID 数组 |
| `vietmigo_vocabulary_status` | `{"1": {"status":"known", "lastDate":"2026-09-23"}}` | 词汇掌握状态（熟记/待复习） |
| `vietmigo_streak` | 数字 `3` | 连续打卡天数 |
| `vietmigo_daily_goal` | 数字 `10` | 每日新词目标数量 |
| `vietmigo_speech_rate` | 数字 `0.9` | 默认发音语速 |

在 **👤 我的 (Profile)** 页面中，用户可以随时一键**导出 JSON 备份**或在其他设备上**导入恢复进度**。

---

## 🌐 免费部署至 GitHub Pages (GitHub Pages Deployment)

1. 在 [GitHub.com](https://github.com) 创建一个名为 `vietninie` 的全新公开仓库 (Public Repository)。
2. 本地打开终端推送代码：
   ```bash
   cd vietnamese-learning
   git init
   git add .
   git commit -m "feat: launch Vietninie (越学越辣) language platform"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub账号>/vietninie.git
   git push -u origin main
   ```
3. 打开 GitHub 仓库页面 -> 点击 **Settings** -> 左侧导航选择 **Pages**。
4. 在 **Build and deployment** 下将 Branch 设置为 **`main`**，文件夹设为 **`/ (root)`**，点击 **Save**。
5. 约 1-2 分钟后即可获得公网访问链接：  
   👉 `https://<你的GitHub账号>.github.io/vietninie/`

---

## 🎙️ 语音支持说明 (Speech Synthesis Notes)

- **iOS / iPadOS / macOS**: Safari 与 Chrome 原生预装 Apple Linh / Siri 越南语语音，音质极高。
- **Android**: 预装 Google 语音合成 (Google TTS) 越南语语音包。
- **Windows 10/11**: 若点击喇叭提示缺少发音包，可前往 Windows **设置 -> 时间和语言 -> 语音 -> 添加语音**，勾选安装 **越南语 (Vietnam)** 即可畅享高质量发音。
