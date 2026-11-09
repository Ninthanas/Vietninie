import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1>Trang này chưa có trong hành trình</h1>
      <p>Đường dẫn có thể đã thay đổi.</p>
      <Link className="primary-link" to="/">
        Trở về trang chủ
      </Link>
    </div>
  );
}
