package com.vietninie.api.service;

import com.vietninie.api.request.ChatRequest;
import com.vietninie.api.response.ChatResponse;
import java.util.UUID;

public interface ChatService {
  ChatResponse ask(UUID userId, ChatRequest request);
}
