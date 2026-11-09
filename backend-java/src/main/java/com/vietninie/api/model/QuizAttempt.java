package com.vietninie.api.model;

import com.vietninie.api.enums.LearningLanguage;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 5)
  private LearningLanguage language;

  @Column(nullable = false)
  private int score;

  @Column(nullable = false)
  private int total;

  @Column(nullable = false)
  private Instant takenAt = Instant.now();

  public Long getId() {
    return id;
  }

  public UUID getUserId() {
    return userId;
  }

  public void setUserId(UUID v) {
    userId = v;
  }

  public LearningLanguage getLanguage() {
    return language;
  }

  public void setLanguage(LearningLanguage v) {
    language = v;
  }

  public int getScore() {
    return score;
  }

  public void setScore(int v) {
    score = v;
  }

  public int getTotal() {
    return total;
  }

  public void setTotal(int v) {
    total = v;
  }

  public Instant getTakenAt() {
    return takenAt;
  }
}
