package com.vietninie.api.service.impl;

import com.vietninie.api.exception.ApiException;
import com.vietninie.api.model.AppUser;
import com.vietninie.api.repository.UserRepository;
import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {
  private final UserRepository users;
  private final PasswordEncoder passwords;
  private final TokenService tokens;
  private final String dummyHash;

  public AuthServiceImpl(UserRepository users, PasswordEncoder passwords, TokenService tokens) {
    this.users = users;
    this.passwords = passwords;
    this.tokens = tokens;
    dummyHash = passwords.encode(UUID.randomUUID().toString());
  }

  public AuthResponse register(RegisterRequest request) {
    if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu tối đa 72 byte UTF-8.");
    String username = request.username().toLowerCase(Locale.ROOT);
    if (users.existsByUsername(username))
      throw new ApiException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại.");
    AppUser user = new AppUser();
    user.setUsername(username);
    user.setPasswordHash(passwords.encode(request.password()));
    user.setDisplayName(
        request.displayName() == null || request.displayName().isBlank()
            ? username
            : request.displayName().trim());
    return tokens.issue(users.saveAndFlush(user));
  }

  public AuthResponse login(LoginRequest request) {
    AppUser user = users.findByUsername(request.username().toLowerCase(Locale.ROOT)).orElse(null);
    boolean valid =
        passwords.matches(request.password(), user == null ? dummyHash : user.getPasswordHash());
    if (user == null || !valid || !user.isEnabled())
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc mật khẩu không đúng.");
    return tokens.issue(user);
  }

  @Transactional(readOnly = true)
  public UserResponse me(UUID userId) {
    return UserResponse.from(find(userId));
  }

  public void logout(UUID userId) {
    find(userId).revokeTokens();
  }

  private AppUser find(UUID id) {
    return users
        .findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không khả dụng."));
  }
}
