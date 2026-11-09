import { Component, type ReactNode } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppRoutes } from './routes';
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="empty-state">
        <h1>Có lỗi khi mở trang</h1>
        <button onClick={() => window.location.reload()}>Tải lại</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <a
          href="#main-content"
          className="skip-link"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById('main-content')?.focus();
          }}
        >
          Đến nội dung chính
        </a>
        <AppRoutes />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
