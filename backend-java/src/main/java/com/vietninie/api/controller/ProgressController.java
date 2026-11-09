package com.vietninie.api.controller;

import com.vietninie.api.enums.LearningLanguage;
import com.vietninie.api.request.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.ProgressService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
  private final ProgressService service;

  public ProgressController(ProgressService service) {
    this.service = service;
  }

  @GetMapping("/me")
  public ProgressResponse me(
      @AuthenticationPrincipal Jwt jwt,
      @RequestParam(defaultValue = "zh") LearningLanguage language) {
    return service.get(UUID.fromString(jwt.getSubject()), language);
  }

  @PutMapping("/me/vocabulary/{id}")
  public ProgressResponse.WordEntry update(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable long id,
      @RequestParam(defaultValue = "zh") LearningLanguage language,
      @Valid @RequestBody WordProgressRequest request) {
    return service.update(UUID.fromString(jwt.getSubject()), language, id, request);
  }

  @PostMapping("/me/quiz-scores")
  @ResponseStatus(HttpStatus.CREATED)
  public QuizAttemptResponse quiz(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody QuizAttemptRequest request) {
    return service.record(UUID.fromString(jwt.getSubject()), request);
  }

  @GetMapping("/me/quiz-scores")
  public List<QuizAttemptResponse> history(@AuthenticationPrincipal Jwt jwt) {
    return service.attempts(UUID.fromString(jwt.getSubject()));
  }
}
