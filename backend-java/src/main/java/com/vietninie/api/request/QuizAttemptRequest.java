package com.vietninie.api.request;

import com.vietninie.api.enums.LearningLanguage;
import jakarta.validation.constraints.*;

public record QuizAttemptRequest(
    @NotNull LearningLanguage language, @Min(0) int score, @Min(1) @Max(100) int total) {
  @AssertTrue(message = "score must not exceed total")
  public boolean isScoreValid() {
    return score <= total;
  }
}
