package com.vietninie.api.request;

import com.fasterxml.jackson.databind.JsonNode;
import com.vietninie.api.enums.*;
import jakarta.validation.constraints.*;

public record ContentRequest(
    @NotNull ContentType contentType,
    @NotNull LearningLanguage language,
    @NotBlank @Size(max = 100) String sourceId,
    @NotBlank @Size(max = 500) String title,
    @Size(max = 50) String level,
    @Size(max = 200) String topic,
    @NotNull JsonNode payload) {}
