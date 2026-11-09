import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Layers,
  MessageCircle,
  Headphones,
  Sparkles,
  Briefcase,
  ChartNoAxesCombined,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  ArrowUpRight,
  Globe,
} from 'lucide-react';
import { navigation } from '../../constants/routes';
import { useAppStore } from '../../store';
import { useTheme } from '../../context/ThemeContext';
import { ChatWidget } from '../../features/chat';
import { useServerProgress } from '../../features/progress/useServerProgress';
import logo from '../../assets/images/logo.jpg';
const icons = {
  home: Home,
  book: BookOpen,
  layers: Layers,
  message: MessageCircle,
  headphones: Headphones,
  sparkles: Sparkles,
  briefcase: Briefcase,
  chart: ChartNoAxesCombined,
};
export function MainLayout() {
  const syncError = useServerProgress();
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { language, setLanguage } = useAppStore();
  const { dark, toggle } = useTheme();
  useEffect(() => {
    setExpanded(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="app-shell">
      <aside className={'sidebar ' + (expanded ? 'is-open' : '')}>
        <Link to="/" className="brand">
          <img src={logo} alt="" />
          <span>
            Vietninie<small>越学越辣 · Học mỗi ngày</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          onClick={() => setExpanded(false)}
          aria-label="Đóng menu"
        >
          <X />
        </button>
        <p className="nav-caption">KHÔNG GIAN HỌC TẬP</p>
        <nav aria-label="Điều hướng chính">
          {navigation.map((item) => {
            const Icon = icons[item.icon];
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                <Icon size={20} />
                <span>{item.label}</span>
                {item.to === '/specialized' && (
                  <span className="nav-new">MỚI</span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/login">
            <Globe size={19} /> Tài khoản
          </NavLink>
          <div className="sidebar-tip">
            <Sparkles size={23} />
            <strong>
              Mỗi ngày một chút,
              <br />
              tiến xa hơn một bước.
            </strong>
            <span>Dành 10 phút cho ngôn ngữ mới.</span>
            <Link to="/quiz">
              Bắt đầu luyện tập <ArrowUpRight size={16} />
            </Link>
          </div>
          <NavLink to="/settings">
            <Settings size={19} /> Cài đặt
          </NavLink>
          <small>Được tạo nên cho hành trình của bạn.</small>
        </div>
      </aside>
      {expanded && (
        <button
          className="menu-scrim"
          aria-label="Đóng menu"
          onClick={() => setExpanded(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="row">
            <button
              className="mobile-menu icon-button"
              aria-label="Mở menu"
              onClick={() => setExpanded(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Không gian học tập <span>/</span>{' '}
              <b>
                {navigation.find((n) => n.to === pathname)?.label ||
                  'Vietninie'}
              </b>
            </span>
          </div>
          <div className="row">
            <button
              className="language-switch"
              onClick={() => setLanguage(language === 'zh' ? 'vi' : 'zh')}
            >
              <Globe size={16} />
              {language === 'zh' ? 'Tiếng Trung' : 'Tiếng Việt'}
              <span>⇄</span>
            </button>
            <button
              className="icon-button"
              aria-label="Đổi giao diện sáng tối"
              onClick={toggle}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="avatar" aria-label="Tài khoản">
              V
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {syncError && (
            <p role="alert" className="error">
              Chưa đồng bộ lên máy chủ: {syncError}
            </p>
          )}
          <Outlet />
        </main>
        <footer className="footer">
          © {new Date().getFullYear()} Vietninie{' '}
          <span>Học ngôn ngữ, kết nối những câu chuyện.</span>
        </footer>
      </div>
      <ChatWidget />
    </div>
  );
}
