package com.vietninie.api.repository;

import com.vietninie.api.enums.LearningLanguage;
import com.vietninie.api.model.WordProgress;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgressRepository extends JpaRepository<WordProgress, Long> {
  List<WordProgress> findByUserIdAndLanguage(UUID userId, LearningLanguage language);

  Optional<WordProgress> findByUserIdAndLanguageAndWordId(
      UUID userId, LearningLanguage language, long wordId);
}
