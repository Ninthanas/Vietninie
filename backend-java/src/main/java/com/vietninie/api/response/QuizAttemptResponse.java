package com.vietninie.api.response;

import com.vietninie.api.enums.LearningLanguage;
import java.time.Instant;

public record QuizAttemptResponse(
    Long id, LearningLanguage language, int score, int total, Instant takenAt) {}
