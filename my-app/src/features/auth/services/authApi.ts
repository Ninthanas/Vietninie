import { env } from '../../../config/env';
import { apiClient } from '../../../services/apiClient';
import { endpoints } from '../../../services/endpoints';
import type { User, Credentials } from '../types';
export function authenticate(credentials: Credentials, register = false) {
  if (!env.apiUrl)
    throw new Error(
      'Dịch vụ tài khoản chưa được cấu hình cho bản React. Bạn vẫn có thể học và lưu tiến độ trên thiết bị.',
    );
  return apiClient<User>(register ? endpoints.register : endpoints.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
