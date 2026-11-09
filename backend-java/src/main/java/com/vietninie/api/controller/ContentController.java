package com.vietninie.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.vietninie.api.enums.*;
import com.vietninie.api.response.*;
import com.vietninie.api.service.ContentService;
import jakarta.validation.constraints.*;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Validated
public class ContentController {
  private final ContentService service;

  public ContentController(ContentService service) {
    this.service = service;
  }

  @GetMapping("/vocabulary")
  public PageResponse<ContentResponse> vocabulary(
      @RequestParam(defaultValue = "zh") LearningLanguage language,
      @RequestParam(required = false) String level,
      @RequestParam(required = false) String topic,
      @RequestParam(required = false) @Size(max = 100) String search,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "36") @Min(1) @Max(200) int size) {
    return service.list(ContentType.VOCABULARY, language, level, topic, search, page, size);
  }

  @GetMapping("/vocabulary/{id}")
  public JsonNode word(
      @PathVariable String id, @RequestParam(defaultValue = "zh") LearningLanguage language) {
    return service.detail(ContentType.VOCABULARY, language, id);
  }

  @GetMapping("/grammar")
  public PageResponse<ContentResponse> grammar(
      @RequestParam(defaultValue = "zh") LearningLanguage language,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "100") @Min(1) @Max(200) int size) {
    return service.list(ContentType.GRAMMAR, language, null, null, null, page, size);
  }

  @GetMapping("/conversations")
  public List<JsonNode> conversations() {
    return service.data("conversations.json");
  }

  @GetMapping("/conversations/{id}")
  public JsonNode conversation(@PathVariable String id) {
    return service.detail(ContentType.CONVERSATION, LearningLanguage.zh, id);
  }

  @GetMapping("/specialized")
  public JsonNode specialized() {
    return service.detail(ContentType.SPECIALIZED, LearningLanguage.zh, "catalog");
  }

  @GetMapping("/data/{filename}")
  public Object dataset(@PathVariable String filename) {
    return "specialized-vocabulary.json".equals(filename) ? specialized() : service.data(filename);
  }
}
