package com.vietninie.api.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.vietninie.api.enums.*;

public record ContentResponse(
    Long id,
    ContentType contentType,
    LearningLanguage language,
    String sourceId,
    String title,
    String level,
    String topic,
    JsonNode payload) {}
