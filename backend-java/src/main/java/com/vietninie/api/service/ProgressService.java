package com.vietninie.api.service;

import com.vietninie.api.enums.LearningLanguage;
import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import java.util.*;

public interface ProgressService {
  ProgressResponse get(UUID userId, LearningLanguage language);

  ProgressResponse.WordEntry update(
      UUID userId, LearningLanguage language, long wordId, WordProgressRequest request);

  QuizAttemptResponse record(UUID userId, QuizAttemptRequest request);

  List<QuizAttemptResponse> attempts(UUID userId);
}
