package com.vietninie.api.model;

import com.vietninie.api.enums.*;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "word_progress",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_user_word",
            columnNames = {"user_id", "language", "word_id"}))
public class WordProgress {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 5)
  private LearningLanguage language;

  @Column(name = "word_id", nullable = false)
  private long wordId;

  @Column(nullable = false)
  private boolean learned;

  @Column(nullable = false)
  private boolean favorite;

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  @Version private long version;

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

  public long getWordId() {
    return wordId;
  }

  public void setWordId(long v) {
    wordId = v;
  }

  public boolean isLearned() {
    return learned;
  }

  public void setLearned(boolean v) {
    learned = v;
  }

  public boolean isFavorite() {
    return favorite;
  }

  public void setFavorite(boolean v) {
    favorite = v;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void touch() {
    updatedAt = Instant.now();
  }
}
