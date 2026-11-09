package com.vietninie.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.vietninie.api.enums.*;
import com.vietninie.api.request.ContentRequest;
import com.vietninie.api.response.*;
import java.util.List;

public interface ContentService {
  PageResponse<ContentResponse> list(
      ContentType type,
      LearningLanguage language,
      String level,
      String topic,
      String search,
      int page,
      int size);

  JsonNode detail(ContentType type, LearningLanguage language, String sourceId);

  ContentResponse create(ContentRequest request);

  ContentResponse update(long id, ContentRequest request);

  void delete(long id);

  List<JsonNode> data(String filename);
}
