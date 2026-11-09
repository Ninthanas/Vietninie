package com.vietninie.api.controller;

import com.vietninie.api.request.ChatRequest;
import com.vietninie.api.response.ChatResponse;
import com.vietninie.api.service.ChatService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
  private final ChatService service;

  public ChatController(ChatService service) {
    this.service = service;
  }

  @PostMapping
  public ChatResponse chat(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChatRequest request) {
    return service.ask(UUID.fromString(jwt.getSubject()), request);
  }
}
