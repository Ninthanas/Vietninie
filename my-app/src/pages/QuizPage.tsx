import { PracticeSession } from '../features/practice';
import { useAppStore } from '../store';
export default function QuizPage() {
  const language = useAppStore((s) => s.language);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">NHỚ LÂU HƠN QUA LUYỆN TẬP</p>
        <h1>Thử thách hôm nay</h1>
        <p>Không cần hoàn hảo, chỉ cần tiến bộ mỗi ngày.</p>
      </div>
      <PracticeSession key={language} />
    </>
  );
}
