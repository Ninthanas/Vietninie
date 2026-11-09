package com.vietninie.api.service;

import com.vietninie.api.request.RoleRequest;
import com.vietninie.api.response.*;
import java.util.UUID;

public interface UserService {
  PageResponse<UserResponse> list(int page, int size);

  UserResponse roles(UUID actingUserId, UUID targetId, RoleRequest request);
}
