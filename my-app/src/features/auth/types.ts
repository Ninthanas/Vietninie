export interface User {
  roles?: ('USER' | 'ADMIN')[];
  expires_at?: string;
  access_token: string;
  user_id: string;
  username: string;
  display_name?: string;
}
export interface Credentials {
  username: string;
  password: string;
  display_name?: string;
}
