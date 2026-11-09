import { LoginForm, useAuth } from '../features/auth';
import { Button } from '../components/ui/Button';
export default function LoginPage() {
  const { user, setUser } = useAuth();
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">CÙNG ĐI XA HƠN</p>
        <h1>Tài khoản của bạn</h1>
        <p>Bạn có thể học mà không cần đăng nhập.</p>
      </div>
      {user ? (
        <section className="card">
          <h2>Chào {user.display_name || user.username}</h2>
          <Button onClick={() => setUser(null)}>Đăng xuất</Button>
        </section>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
