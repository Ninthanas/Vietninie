package com.vietninie.api.controller;

import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminController {
  private final UserService users;
  private final ContentService content;

  public AdminController(UserService users, ContentService content) {
    this.users = users;
    this.content = content;
  }

  @GetMapping("/users")
  public PageResponse<UserResponse> users(
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
    return users.list(page, size);
  }

  @PutMapping("/users/{id}/roles")
  public UserResponse roles(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable UUID id,
      @Valid @RequestBody RoleRequest request) {
    return users.roles(UUID.fromString(jwt.getSubject()), id, request);
  }

  @PostMapping("/content")
  @ResponseStatus(HttpStatus.CREATED)
  public ContentResponse create(@Valid @RequestBody ContentRequest request) {
    return content.create(request);
  }

  @PutMapping("/content/{id}")
  public ContentResponse update(@PathVariable long id, @Valid @RequestBody ContentRequest request) {
    return content.update(id, request);
  }

  @DeleteMapping("/content/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    content.delete(id);
  }
}
