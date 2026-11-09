package com.vietninie.api.service.impl;

import com.vietninie.api.model.AppUser;
import com.vietninie.api.response.AuthResponse;
import com.vietninie.api.service.TokenService;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class TokenServiceImpl implements TokenService {
  private final JwtEncoder encoder;
  private final String issuer, audience;
  private final long ttl;

  public TokenServiceImpl(
      JwtEncoder encoder,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.audience}") String audience,
      @Value("${app.jwt.ttl-minutes}") long ttl) {
    this.encoder = encoder;
    this.issuer = issuer;
    this.audience = audience;
    if (ttl < 1 || ttl > 60) throw new IllegalArgumentException("JWT TTL must be 1-60 minutes");
    this.ttl = ttl;
  }

  public AuthResponse issue(AppUser user) {
    Instant now = Instant.now(), expires = now.plusSeconds(ttl * 60);
    JwtClaimsSet claims =
        JwtClaimsSet.builder()
            .issuer(issuer)
            .audience(List.of(audience))
            .issuedAt(now)
            .notBefore(now)
            .expiresAt(expires)
            .subject(user.getId().toString())
            .id(UUID.randomUUID().toString())
            .claim("roles", user.getRoles().stream().map(Enum::name).toList())
            .claim("version", user.getTokenVersion())
            .build();
    String token =
        encoder
            .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
            .getTokenValue();
    return new AuthResponse(
        token,
        "bearer",
        ttl * 60,
        expires,
        user.getId(),
        user.getUsername(),
        user.getDisplayName(),
        Set.copyOf(user.getRoles()));
  }
}
