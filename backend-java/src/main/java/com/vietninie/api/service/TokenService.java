package com.vietninie.api.service;

import com.vietninie.api.model.AppUser;
import com.vietninie.api.response.AuthResponse;

public interface TokenService {
  AuthResponse issue(AppUser user);
}
