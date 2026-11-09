package com.vietninie.api.service.impl;

import com.fasterxml.jackson.databind.*;
import com.vietninie.api.enums.*;
import com.vietninie.api.exception.ApiException;
import com.vietninie.api.model.LearningContent;
import com.vietninie.api.repository.ContentRepository;
import com.vietninie.api.request.ContentRequest;
import com.vietninie.api.response.*;
import com.vietninie.api.service.ContentService;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {
  private final ContentRepository repository;
  private final ObjectMapper mapper;

  public ContentServiceImpl(ContentRepository repository, ObjectMapper mapper) {
    this.repository = repository;
    this.mapper = mapper;
  }

  @Transactional(readOnly = true)
  public PageResponse<ContentResponse> list(
      ContentType type,
      LearningLanguage language,
      String level,
      String topic,
      String search,
      int page,
      int size) {
    Specification<LearningContent> spec =
        (root, q, cb) -> {
          var filters = new ArrayList<jakarta.persistence.criteria.Predicate>();
          filters.add(cb.equal(root.get("contentType"), type));
          filters.add(cb.equal(root.get("language"), language));
          if (level != null && !level.isBlank()) filters.add(cb.equal(root.get("level"), level));
          if (topic != null && !topic.isBlank()) filters.add(cb.equal(root.get("topic"), topic));
          if (search != null && !search.isBlank()) {
            String term =
                "%"
                    + search
                        .toLowerCase(Locale.ROOT)
                        .replace("!", "!!")
                        .replace("%", "!%")
                        .replace("_", "!_")
                    + "%";
            filters.add(
                cb.or(
                    cb.like(cb.lower(root.get("title")), term, '!'),
                    cb.like(cb.lower(root.get("payload")), term, '!')));
          }
          return cb.and(filters.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    var result = repository.findAll(spec, PageRequest.of(page, size, Sort.by("id")));
    return new PageResponse<>(
        result.map(this::response).getContent(), result.getTotalElements(), page, size);
  }

  @Transactional(readOnly = true)
  public JsonNode detail(ContentType type, LearningLanguage language, String id) {
    return json(
        repository
            .findByContentTypeAndLanguageAndSourceId(type, language, id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nội dung.")));
  }

  public ContentResponse create(ContentRequest request) {
    var entity = new LearningContent();
    apply(entity, request);
    return response(repository.saveAndFlush(entity));
  }

  public ContentResponse update(long id, ContentRequest request) {
    var entity =
        repository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nội dung."));
    apply(entity, request);
    return response(repository.saveAndFlush(entity));
  }

  public void delete(long id) {
    var entity =
        repository
            .findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nội dung."));
    repository.delete(entity);
  }

  private void apply(LearningContent entity, ContentRequest request) {
    if (!request.payload().isObject() || request.payload().toString().length() > 100000)
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Nội dung phải là JSON object tối đa 100000 ký tự.");
    entity.setContentType(request.contentType());
    entity.setLanguage(request.language());
    entity.setSourceId(request.sourceId());
    entity.setTitle(request.title());
    entity.setLevel(request.level());
    entity.setTopic(request.topic());
    entity.setPayload(request.payload().toString());
  }

  private JsonNode json(LearningContent entity) {
    try {
      return mapper.readTree(entity.getPayload());
    } catch (Exception e) {
      throw new IllegalStateException("Stored content is invalid", e);
    }
  }

  private ContentResponse response(LearningContent e) {
    return new ContentResponse(
        e.getId(),
        e.getContentType(),
        e.getLanguage(),
        e.getSourceId(),
        e.getTitle(),
        e.getLevel(),
        e.getTopic(),
        json(e));
  }

  @Transactional(readOnly = true)
  public List<JsonNode> data(String filename) {
    ContentType type;
    LearningLanguage language;
    switch (filename) {
      case "chinese-vocabulary.json":
        type = ContentType.VOCABULARY;
        language = LearningLanguage.zh;
        break;
      case "vietnamese-vocabulary.json":
        type = ContentType.VOCABULARY;
        language = LearningLanguage.vi;
        break;
      case "chinese-grammar.json":
        type = ContentType.GRAMMAR;
        language = LearningLanguage.zh;
        break;
      case "vietnamese-grammar.json":
        type = ContentType.GRAMMAR;
        language = LearningLanguage.vi;
        break;
      case "conversations.json":
        type = ContentType.CONVERSATION;
        language = LearningLanguage.zh;
        break;
      default:
        throw new ApiException(HttpStatus.NOT_FOUND, "Không có bộ dữ liệu này.");
    }
    return repository
        .findAll(
            (Specification<LearningContent>)
                (r, q, cb) ->
                    cb.and(
                        cb.equal(r.get("contentType"), type),
                        cb.equal(r.get("language"), language)),
            Sort.by("id"))
        .stream()
        .map(this::json)
        .toList();
  }
}
