package com.vietninie.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record ChatRequest(@NotEmpty @Size(max = 12) List<@NotNull @Valid Message> messages) {
  public record Message(
      @NotBlank @Pattern(regexp = "user|assistant") String role,
      @NotBlank @Size(max = 6000) String content) {}

  @AssertTrue(message = "Last message must be a user question of at most 2000 characters")
  public boolean isLastUser() {
    return messages != null
        && !messages.isEmpty()
        && messages.getLast() != null
        && "user".equals(messages.getLast().role())
        && messages.getLast().content() != null
        && messages.getLast().content().length() <= 2000;
  }
}
