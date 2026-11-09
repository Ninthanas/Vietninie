package com.vietninie.api.service.impl;

import com.vietninie.api.exception.ApiException;
import com.vietninie.api.repository.UserRepository;
import com.vietninie.api.request.RoleRequest;
import com.vietninie.api.response.*;
import com.vietninie.api.service.UserService;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {
  private final UserRepository users;

  public UserServiceImpl(UserRepository users) {
    this.users = users;
  }

  @Transactional(readOnly = true)
  public PageResponse<UserResponse> list(int page, int size) {
    var result = users.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    return new PageResponse<>(
        result.map(UserResponse::from).getContent(), result.getTotalElements(), page, size);
  }

  public UserResponse roles(UUID actor, UUID target, RoleRequest request) {
    if (actor.equals(target))
      throw new ApiException(HttpStatus.BAD_REQUEST, "Không thể tự thay đổi quyền của chính mình.");
    var user =
        users
            .findById(target)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));
    user.setRoles(request.roles());
    user.revokeTokens();
    return UserResponse.from(users.saveAndFlush(user));
  }
}
