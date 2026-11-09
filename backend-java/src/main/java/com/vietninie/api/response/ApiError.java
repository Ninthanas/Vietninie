package com.vietninie.api.response;

import java.time.Instant;

public record ApiError(int status, String error, String path, Instant timestamp) {}
