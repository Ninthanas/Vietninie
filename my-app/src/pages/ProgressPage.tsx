import { ProgressOverview } from '../features/progress';
import { useAuth } from '../features/auth';
import { env } from '../config/env';
export default function ProgressPage() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">MỖI BƯỚC NHỎ ĐỀU ĐÁNG GHI NHẬN</p>
        <h1>Hành trình của bạn</h1>
        <p>
          {env.apiUrl && user
            ? 'Tiến độ được đồng bộ với tài khoản của bạn.'
            : 'Tiến độ được lưu trên thiết bị bạn đang sử dụng.'}
        </p>
      </div>
      <div className="stack">
        <ProgressOverview />
      </div>
    </>
  );
}
