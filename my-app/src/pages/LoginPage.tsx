import { useState } from 'react';
import { LoginForm, useAuth } from '../features/auth';
import { logout } from '../features/auth/services/authApi';
import { Button } from '../components/ui/Button';
export default function LoginPage() {
  const { user, setUser } = useAuth();
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await logout();
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chưa thể đăng xuất');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">CÙNG ĐI XA HƠN</p>
        <h1>Tài khoản của bạn</h1>
        <p>
          Bạn có thể học mà không cần đăng nhập. Chat trên backend Java cần tài
          khoản.
        </p>
      </div>
      {user ? (
        <section className="card">
          <h2>Chào {user.display_name || user.username}</h2>
          <p>Vai trò: {user.roles?.join(', ') || 'USER'}</p>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button disabled={busy} onClick={signOut}>
            {busy ? 'Đang đăng xuất…' : 'Đăng xuất'}
          </Button>
        </section>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
