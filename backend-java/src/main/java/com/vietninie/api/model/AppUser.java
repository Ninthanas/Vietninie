package com.vietninie.api.model;

import com.vietninie.api.enums.Role;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(
    name = "app_users",
    uniqueConstraints = @UniqueConstraint(name = "uk_username", columnNames = "username"))
public class AppUser {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 32)
  private String username;

  @Column(nullable = false, length = 100)
  private String passwordHash;

  @Column(nullable = false, length = 100)
  private String displayName;

  @Column(nullable = false)
  private boolean enabled = true;

  @Column(nullable = false)
  private long tokenVersion = 0;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private Set<Role> roles = new HashSet<>(Set.of(Role.USER));

  @Version private long version;

  public UUID getId() {
    return id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String value) {
    username = value;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String value) {
    passwordHash = value;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String value) {
    displayName = value;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean value) {
    enabled = value;
  }

  public long getTokenVersion() {
    return tokenVersion;
  }

  public void revokeTokens() {
    tokenVersion++;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Set<Role> getRoles() {
    return roles;
  }

  public void setRoles(Set<Role> value) {
    roles = new HashSet<>(value);
  }
}
