import { useRef, useState } from 'react';
import { useAppStore } from '../store';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { exportProgress, importProgress } from '../features/progress/backup';
export default function SettingsPage() {
  const { language, setLanguage, reload } = useAppStore();
  const { dark, toggle } = useTheme();
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  function backup() {
    const url = URL.createObjectURL(
      new Blob([exportProgress()], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vietninie-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      importProgress(await file.text());
      reload();
      setMessage('Đã khôi phục tiến độ.');
    } catch {
      setMessage(
        'Không thể nhập bản sao lưu. Hãy kiểm tra tệp và dung lượng lưu trữ.',
      );
    }
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">KHÔNG GIAN CỦA RIÊNG BẠN</p>
        <h1>Cài đặt học tập</h1>
      </div>
      <div className="stack">
        <section className="card">
          <h2>Ngôn ngữ & giao diện</h2>
          <div className="setting-row">
            <span>Ngôn ngữ đang học</span>
            <select
              aria-label="Ngôn ngữ đang học"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'zh' | 'vi')}
            >
              <option value="zh">Tiếng Trung</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
          <div className="setting-row">
            <span>Giao diện {dark ? 'tối' : 'sáng'}</span>
            <Button variant="secondary" onClick={toggle}>
              Chuyển giao diện
            </Button>
          </div>
        </section>
        <section className="card">
          <h2>Sao lưu hành trình</h2>
          <p>
            Xuất tiến độ và từ đã lưu để giữ lại hoặc chuyển sang thiết bị khác.
          </p>
          <div className="row">
            <Button onClick={backup}>Tải bản sao lưu</Button>
            <Button variant="secondary" onClick={() => input.current?.click()}>
              Nhập bản sao lưu
            </Button>
            <input
              className="sr-only"
              aria-label="Tệp sao lưu tiến độ"
              type="file"
              accept="application/json"
              ref={input}
              onChange={(e) => restore(e.target.files?.[0])}
            />
          </div>
          {message && <p role="status">{message}</p>}
        </section>
      </div>
    </>
  );
}
