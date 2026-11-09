import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Flame,
  CheckCircle2,
  Target,
  Headphones,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';
import { useVocabulary, WordCard } from '../features/vocabulary';
import { useAppStore } from '../store';
import mascot from '../assets/images/mascot.svg';
export default function HomePage() {
  const { words } = useVocabulary();
  const { learned, daily } = useAppStore();
  const today = daily[new Date().toLocaleDateString('en-CA')] || 0;
  const paths = [
    {
      to: '/vocabulary',
      icon: BookOpen,
      title: 'Từ vựng & Flashcard',
      desc: 'Ghi nhớ qua ví dụ, ôn tập theo nhịp của bạn.',
      tag: 'TỪ NỀN TẢNG ĐẾN NÂNG CAO',
      color: 'peach',
    },
    {
      to: '/conversation',
      icon: Headphones,
      title: 'Nghe & Hội thoại',
      desc: 'Lắng nghe những câu chuyện gần gũi mỗi ngày.',
      tag: 'ĐỜI SỐNG THẬT, NGÔN NGỮ THẬT',
      color: 'green',
    },
    {
      to: '/specialized',
      icon: Briefcase,
      title: 'Tiếng Trung công việc',
      desc: 'Game, quản lý dự án, marketing và phỏng vấn.',
      tag: 'HỌC ĐỂ DÙNG NGAY',
      color: 'purple',
    },
  ];
  return (
    <>
      <div className="page-heading row spread">
        <div>
          <p className="eyebrow">MỘT NGÀY MỚI, MỘT ĐIỀU HAY</p>
          <h1>
            Chào bạn, cùng học nhé <span>☀</span>
          </h1>
          <p>Thêm một chút kiến thức. Gần hơn với thế giới.</p>
        </div>
        <span className="date-label">
          {new Intl.DateTimeFormat('vi', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date())}
        </span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-tag">
            <span /> Hành trình song ngữ Việt ⇄ Trung
          </span>
          <h2>
            Học tự nhiên.
            <br />
            Giao tiếp <em>tự tin.</em>
          </h2>
          <p>
            Từ những lời chào đầu tiên đến câu chuyện mỗi ngày.
            <br />
            Từng bước nhỏ, mở ra thật nhiều kết nối.
          </p>
          <Link className="primary-link" to="/vocabulary">
            Tiếp tục học hôm nay <ArrowRight size={18} />
          </Link>
          <div className="hero-foot">
            <span>✦</span> Từ vựng thực tế · Phát âm · Hội thoại
          </div>
        </div>
        <div className="hero-art">
          <span className="art-circle" />
          <span className="art-word word-ni">
            你好 <small>nǐ hǎo</small>
          </span>
          <img src={mascot} alt="Linh vật Vietninie" />
          <span className="art-word word-chao">
            Xin chào! <span>✺</span>
          </span>
          <span className="art-spark">✧</span>
        </div>
      </section>
      <section className="stats-grid">
        <div className="stat">
          <span className="stat-icon peach">
            <BookOpen />
          </span>
          <div>
            <small>Từ vựng đã khám phá</small>
            <strong>
              {learned.length} <span>/ {words.length}</span>
            </strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon green">
            <CheckCircle2 />
          </span>
          <div>
            <small>Đã học hôm nay</small>
            <strong>
              {today} <span>từ mới</span>
            </strong>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon amber">
            <Flame />
          </span>
          <div>
            <small>Ngày có hoạt động</small>
            <strong>
              {Object.keys(daily).length} <span>ngày</span>
            </strong>
          </div>
        </div>
      </section>
      <div className="section-heading row spread">
        <div>
          <h2>Hôm nay bạn muốn học gì?</h2>
          <p>Chọn một cách học phù hợp với bạn.</p>
        </div>
        <Link to="/progress">
          Xem hành trình <ArrowUpRight size={16} />
        </Link>
      </div>
      <section className="path-grid">
        {paths.map((item) => (
          <Link className="card path-card" to={item.to} key={item.to}>
            <span className={'path-icon ' + item.color}>
              <item.icon size={24} />
            </span>
            <ArrowUpRight className="path-arrow" size={19} />
            <small>{item.tag}</small>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </Link>
        ))}
      </section>
      <div className="lower-grid">
        <section>
          <div className="section-heading row spread">
            <h2>Một từ mới, một kết nối mới</h2>
            <Link to="/vocabulary">
              Khám phá thêm <ArrowRight size={16} />
            </Link>
          </div>
          <div className="word-grid home-words">
            {words.slice(0, 2).map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </section>
        <section className="daily-goal card">
          <span className="goal-icon">
            <Target size={26} />
          </span>
          <h3>Mục tiêu nhỏ, niềm vui lớn</h3>
          <p>
            10 từ mới mỗi ngày.
            <br />
            Từng bước nhỏ đều đáng ghi nhận.
          </p>
          <div className="row spread">
            <strong>{Math.min(today, 10)}/10 từ</strong>
            <small>{Math.min(today * 10, 100)}%</small>
          </div>
          <progress
            aria-label="Mục tiêu 10 từ hôm nay"
            max={10}
            value={today}
          />
        </section>
      </div>
    </>
  );
}
