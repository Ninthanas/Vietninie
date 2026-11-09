import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { authenticate } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
export function LoginForm() {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      setUser(
        await authenticate(
          {
            username: String(data.get('username')),
            password: String(data.get('password')),
          },
          register,
        ),
      );
      navigate('/progress');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể đăng nhập');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="card auth-form" onSubmit={submit}>
      <h2>{register ? 'Tạo tài khoản' : 'Chào mừng bạn trở lại'}</h2>
      <label>
        Tên đăng nhập
        <input name="username" autoComplete="username" minLength={3} required />
      </label>
      <label>
        Mật khẩu
        <input
          name="password"
          type="password"
          autoComplete={register ? 'new-password' : 'current-password'}
          minLength={register ? 10 : 6}
          required
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Button disabled={busy}>
        {busy ? 'Đang xử lý…' : register ? 'Đăng ký' : 'Đăng nhập'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setRegister(!register);
          setError('');
        }}
      >
        {register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
      </Button>
    </form>
  );
}
