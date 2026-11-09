package com.vietninie.api.service.impl;

import com.fasterxml.jackson.databind.*;
import com.vietninie.api.exception.ApiException;
import com.vietninie.api.request.ChatRequest;
import com.vietninie.api.response.ChatResponse;
import com.vietninie.api.service.ChatService;
import java.net.http.HttpClient;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;

@Service
public class ChatServiceImpl implements ChatService {
  private static final String PROMPT =
      "Bạn là trợ lý học tiếng Trung và tiếng Việt của Vietninie. Trả lời bằng ngôn ngữ người dùng,"
          + " ngắn gọn và chính xác. Với tiếng Trung hãy có chữ Hán, pinyin và nghĩa tiếng Việt khi"
          + " phù hợp. Không bịa tiến độ, tính năng hoặc dữ liệu tài khoản. Khi không chắc, nói"
          + " rõ.";
  private final RestClient client;
  private final String key, model;
  private final Semaphore active = new Semaphore(3);
  private final ConcurrentHashMap<UUID, Window> limits = new ConcurrentHashMap<>();

  private record Window(long start, int count) {}

  public ChatServiceImpl(
      @Value("${app.gemini.api-key}") String key, @Value("${app.gemini.model}") String model) {
    this.key = key;
    this.model = model;
    if (!model.matches("[a-zA-Z0-9._-]+")) throw new IllegalArgumentException("Invalid model");
    var factory =
        new JdkClientHttpRequestFactory(
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build());
    factory.setReadTimeout(Duration.ofSeconds(35));
    client =
        RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .requestFactory(factory)
            .build();
  }

  public ChatResponse ask(UUID user, ChatRequest request) {
    if (key.isBlank())
      throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini chưa được cấu hình.");
    long now = System.currentTimeMillis();
    limits.entrySet().removeIf(e -> now - e.getValue().start() > 60000);
    Window bucket =
        limits.compute(
            user,
            (id, old) ->
                old == null || now - old.start() > 60000
                    ? new Window(now, 1)
                    : new Window(old.start(), old.count() + 1));
    if (bucket.count() > 20 || !active.tryAcquire())
      throw new ApiException(
          HttpStatus.TOO_MANY_REQUESTS, "Trợ lý đang bận. Vui lòng chờ một phút.");
    try {
      var contents =
          request.messages().stream()
              .map(
                  m ->
                      Map.of(
                          "role",
                          m.role().equals("assistant") ? "model" : "user",
                          "parts",
                          List.of(Map.of("text", m.content()))))
              .toList();
      JsonNode response =
          client
              .post()
              .uri("/models/" + model + ":generateContent")
              .header("x-goog-api-key", key)
              .contentType(MediaType.APPLICATION_JSON)
              .body(
                  Map.of(
                      "systemInstruction",
                      Map.of("parts", List.of(Map.of("text", PROMPT))),
                      "contents",
                      contents,
                      "generationConfig",
                      Map.of("maxOutputTokens", 2048)))
              .retrieve()
              .body(JsonNode.class);
      StringBuilder answer = new StringBuilder();
      if (response != null)
        for (JsonNode part : response.path("candidates").path(0).path("content").path("parts")) {
          if (!part.path("thought").asBoolean(false) && part.hasNonNull("text"))
            answer.append(part.path("text").asText());
        }
      if (answer.isEmpty())
        throw new ApiException(
            HttpStatus.BAD_GATEWAY, "Gemini chưa trả về câu trả lời. Hãy thử lại.");
      return new ChatResponse(answer.toString());
    } catch (RestClientResponseException e) {
      if (e.getStatusCode().value() == 429)
        throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Gemini đang hết lượt hoặc quá tải.");
      throw new ApiException(
          HttpStatus.BAD_GATEWAY, "Gemini tạm thời không khả dụng. Hãy thử lại sau.");
    } catch (ResourceAccessException e) {
      throw new ApiException(HttpStatus.GATEWAY_TIMEOUT, "Kết nối Gemini quá lâu. Hãy thử lại.");
    } finally {
      active.release();
    }
  }
}
