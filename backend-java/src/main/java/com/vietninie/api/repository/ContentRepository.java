package com.vietninie.api.repository;

import com.vietninie.api.enums.*;
import com.vietninie.api.model.LearningContent;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface ContentRepository
    extends JpaRepository<LearningContent, Long>, JpaSpecificationExecutor<LearningContent> {
  Optional<LearningContent> findByContentTypeAndLanguageAndSourceId(
      ContentType type, LearningLanguage language, String sourceId);

  boolean existsByContentTypeAndLanguage(ContentType type, LearningLanguage language);
}
