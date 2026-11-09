package com.vietninie.api.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank @Pattern(regexp = "[a-zA-Z0-9_]{3,32}") String username,
    @NotBlank @Size(min = 10, max = 72) String password,
    @Size(max = 100) String displayName) {}
