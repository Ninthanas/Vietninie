package com.vietninie.api.config;

import com.fasterxml.jackson.databind.*;
import com.vietninie.api.enums.*;
import com.vietninie.api.model.*;
import com.vietninie.api.repository.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements ApplicationRunner {
  private final ContentRepository content;
  private final UserRepository users;
  private final ObjectMapper mapper;
  private final PasswordEncoder passwords;
  private final boolean seed;
  private final String username, password;

  public DataInitializer(
      ContentRepository content,
      UserRepository users,
      ObjectMapper mapper,
      PasswordEncoder passwords,
      @Value("${app.seed-enabled}") boolean seed,
      @Value("${app.admin.username}") String username,
      @Value("${app.admin.password}") String password) {
    this.content = content;
    this.users = users;
    this.mapper = mapper;
    this.passwords = passwords;
    this.seed = seed;
    this.username = username;
    this.password = password;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) throws Exception {
    if (!username.isBlank()
        && !password.isBlank()
        && !users.existsByUsername(username.toLowerCase(Locale.ROOT))) {
      if (!username.matches("[A-Za-z0-9_]{3,32}")
          || password.length() < 12
          || password.getBytes(StandardCharsets.UTF_8).length > 72)
        throw new IllegalArgumentException(
            "Bootstrap admin needs valid username and password of 12+ characters, <=72 UTF-8"
                + " bytes");
      var user = new AppUser();
      user.setUsername(username.toLowerCase(Locale.ROOT));
      user.setDisplayName("Quản trị viên");
      user.setPasswordHash(passwords.encode(password));
      user.setRoles(Set.of(Role.USER, Role.ADMIN));
      users.save(user);
    }
    if (!seed) return;
    load("chinese-vocabulary.json", ContentType.VOCABULARY, LearningLanguage.zh);
    load("vietnamese-vocabulary.json", ContentType.VOCABULARY, LearningLanguage.vi);
    load("chinese-grammar.json", ContentType.GRAMMAR, LearningLanguage.zh);
    load("vietnamese-grammar.json", ContentType.GRAMMAR, LearningLanguage.vi);
    load("conversations.json", ContentType.CONVERSATION, LearningLanguage.zh);
    if (!content.existsByContentTypeAndLanguage(ContentType.SPECIALIZED, LearningLanguage.zh)) {
      JsonNode data =
          mapper.readTree(
              new ClassPathResource("seed/specialized-vocabulary.json").getInputStream());
      save(data, ContentType.SPECIALIZED, LearningLanguage.zh, "catalog", "Chuyên ngành");
    }
  }

  private void load(String filename, ContentType type, LearningLanguage language) throws Exception {
    if (content.existsByContentTypeAndLanguage(type, language)) return;
    JsonNode array = mapper.readTree(new ClassPathResource("seed/" + filename).getInputStream());
    for (JsonNode item : array)
      save(
          item,
          type,
          language,
          item.path("id").asText(),
          item.path("word")
              .asText(item.path("title").asText(item.path("title_vi").asText("Nội dung"))));
  }

  private void save(
      JsonNode payload,
      ContentType type,
      LearningLanguage language,
      String sourceId,
      String title) {
    var item = new LearningContent();
    item.setContentType(type);
    item.setLanguage(language);
    item.setSourceId(sourceId);
    item.setTitle(title);
    item.setLevel(payload.path("level").asText(null));
    item.setTopic(payload.path("topic").asText(null));
    item.setPayload(payload.toString());
    content.save(item);
  }
}
