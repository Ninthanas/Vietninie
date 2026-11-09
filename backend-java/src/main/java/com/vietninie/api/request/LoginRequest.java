package com.vietninie.api.request;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank @Size(max = 32) String username, @NotBlank @Size(max = 72) String password) {}
