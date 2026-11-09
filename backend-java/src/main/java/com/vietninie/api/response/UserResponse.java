package com.vietninie.api.response;

import com.vietninie.api.enums.Role;
import com.vietninie.api.model.AppUser;
import java.time.Instant;
import java.util.*;

public record UserResponse(
    UUID userId,
    String username,
    String displayName,
    Set<Role> roles,
    boolean enabled,
    Instant createdAt) {
  public static UserResponse from(AppUser user) {
    return new UserResponse(
        user.getId(),
        user.getUsername(),
        user.getDisplayName(),
        Set.copyOf(user.getRoles()),
        user.isEnabled(),
        user.getCreatedAt());
  }
}
