package com.vietninie.api.repository;

import com.vietninie.api.model.AppUser;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, UUID> {
  Optional<AppUser> findByUsername(String username);

  boolean existsByUsername(String username);
}
