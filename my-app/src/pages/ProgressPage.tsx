import { ProgressOverview } from '../features/progress';
export default function ProgressPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">MỖI BƯỚC NHỎ ĐỀU ĐÁNG GHI NHẬN</p>
        <h1>Hành trình của bạn</h1>
        <p>Tiến độ được lưu trên thiết bị bạn đang sử dụng.</p>
      </div>
      <div className="stack">
        <ProgressOverview />
      </div>
    </>
  );
}
