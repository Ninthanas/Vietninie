import { PracticeSession } from '../features/practice';
import { useAppStore } from '../store';
export default function ListeningPage() {
  const language = useAppStore((s) => s.language);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">LẮNG NGHE ĐỂ KẾT NỐI</p>
        <h1>Luyện nghe</h1>
        <p>Làm quen âm thanh và nhận diện từ vựng theo trình độ.</p>
      </div>
      <PracticeSession key={language} listening />
    </>
  );
}
