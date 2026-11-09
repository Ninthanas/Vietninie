package com.vietninie.api.response;

import com.vietninie.api.enums.LearningLanguage;
import java.time.Instant;
import java.util.List;

public record ProgressResponse(LearningLanguage language, List<WordEntry> words) {
  public record WordEntry(long wordId, boolean learned, boolean favorite, Instant updatedAt) {}
}
