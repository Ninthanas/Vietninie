package com.vietninie.api.repository;

import com.vietninie.api.model.QuizAttempt;
import java.util.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
  List<QuizAttempt> findByUserIdOrderByTakenAtDesc(UUID userId, Pageable pageable);
}
