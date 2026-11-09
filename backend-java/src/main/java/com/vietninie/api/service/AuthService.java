package com.vietninie.api.service;

import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import java.util.UUID;

public interface AuthService {
  AuthResponse register(RegisterRequest request);

  AuthResponse login(LoginRequest request);

  UserResponse me(UUID userId);

  void logout(UUID userId);
}
