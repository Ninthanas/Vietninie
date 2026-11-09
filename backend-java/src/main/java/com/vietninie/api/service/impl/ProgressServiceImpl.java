package com.vietninie.api.service.impl;

import com.vietninie.api.enums.*;
import com.vietninie.api.exception.ApiException;
import com.vietninie.api.model.*;
import com.vietninie.api.repository.*;
import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.ProgressService;
import java.util.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProgressServiceImpl implements ProgressService {
  private final ProgressRepository progress;
  private final QuizAttemptRepository quizzes;
  private final ContentRepository content;

  public ProgressServiceImpl(
      ProgressRepository progress, QuizAttemptRepository quizzes, ContentRepository content) {
    this.progress = progress;
    this.quizzes = quizzes;
    this.content = content;
  }

  private ProgressResponse.WordEntry entry(WordProgress p) {
    return new ProgressResponse.WordEntry(
        p.getWordId(), p.isLearned(), p.isFavorite(), p.getUpdatedAt());
  }

  @Transactional(readOnly = true)
  public ProgressResponse get(UUID user, LearningLanguage language) {
    return new ProgressResponse(
        language,
        progress.findByUserIdAndLanguage(user, language).stream().map(this::entry).toList());
  }

  public ProgressResponse.WordEntry update(
      UUID user, LearningLanguage language, long wordId, WordProgressRequest request) {
    if (content
        .findByContentTypeAndLanguageAndSourceId(
            ContentType.VOCABULARY, language, Long.toString(wordId))
        .isEmpty()) throw new ApiException(HttpStatus.NOT_FOUND, "Từ vựng không tồn tại.");
    var item =
        progress
            .findByUserIdAndLanguageAndWordId(user, language, wordId)
            .orElseGet(
                () -> {
                  var value = new WordProgress();
                  value.setUserId(user);
                  value.setLanguage(language);
                  value.setWordId(wordId);
                  return value;
                });
    item.setLearned(request.learned());
    item.setFavorite(request.favorite());
    item.touch();
    return entry(progress.saveAndFlush(item));
  }

  public QuizAttemptResponse record(UUID user, QuizAttemptRequest request) {
    var item = new QuizAttempt();
    item.setUserId(user);
    item.setLanguage(request.language());
    item.setScore(request.score());
    item.setTotal(request.total());
    return quiz(quizzes.saveAndFlush(item));
  }

  private QuizAttemptResponse quiz(QuizAttempt item) {
    return new QuizAttemptResponse(
        item.getId(), item.getLanguage(), item.getScore(), item.getTotal(), item.getTakenAt());
  }

  @Transactional(readOnly = true)
  public List<QuizAttemptResponse> attempts(UUID user) {
    return quizzes.findByUserIdOrderByTakenAtDesc(user, PageRequest.of(0, 50)).stream()
        .map(this::quiz)
        .toList();
  }
}
