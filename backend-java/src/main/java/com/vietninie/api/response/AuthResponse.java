package com.vietninie.api.response;

import com.vietninie.api.enums.Role;
import java.time.Instant;
import java.util.*;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    Instant expiresAt,
    UUID userId,
    String username,
    String displayName,
    Set<Role> roles) {}
