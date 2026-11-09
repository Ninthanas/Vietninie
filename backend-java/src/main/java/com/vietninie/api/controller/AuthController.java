package com.vietninie.api.controller;

import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.AuthService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService service;

  public AuthController(AuthService service) {
    this.service = service;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return service.register(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return service.login(request);
  }

  @GetMapping("/me")
  public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
    return service.me(UUID.fromString(jwt.getSubject()));
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(@AuthenticationPrincipal Jwt jwt) {
    service.logout(UUID.fromString(jwt.getSubject()));
  }
}
