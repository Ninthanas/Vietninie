package com.vietninie.api.request;

import com.vietninie.api.enums.Role;
import jakarta.validation.constraints.*;
import java.util.Set;

public record RoleRequest(@NotEmpty @Size(max = 2) Set<@NotNull Role> roles) {}
