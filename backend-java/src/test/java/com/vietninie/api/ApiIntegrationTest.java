package com.vietninie.api;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vietninie.api.repository.UserRepository;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:integration;DB_CLOSE_DELAY=-1",
      "spring.jpa.hibernate.ddl-auto=create-drop",
      "app.jwt.secret=dGVzdC1vbmx5LXJhbmRvbS1zdHlsZS1zZWNyZXQtZm9yLWludGVncmF0aW9uLXRlc3Rz",
      "app.admin.username=admin_test",
      "app.admin.password=Admin-test-password-2026",
      "app.gemini.api-key="
    })
@AutoConfigureMockMvc
class ApiIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper mapper;
  @Autowired UserRepository users;
  @Autowired JwtEncoder encoder;
  private static final String PASSWORD = "Strong-password-2026";

  private String name() {
    return "test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
  }

  private String register(String name) throws Exception {
    return mapper
        .readTree(
            mvc.perform(
                    post("/api/auth/register")
                        .with(
                            r -> {
                              r.setRemoteAddr(UUID.randomUUID().toString());
                              return r;
                            })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            mapper.writeValueAsString(
                                Map.of("username", name, "password", PASSWORD))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("roles[0]").value("USER"))
                .andExpect(jsonPath("password_hash").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString())
        .get("access_token")
        .asText();
  }

  private String admin() throws Exception {
    return mapper
        .readTree(
            mvc.perform(
                    post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            mapper.writeValueAsString(
                                Map.of(
                                    "username",
                                    "admin_test",
                                    "password",
                                    "Admin-test-password-2026"))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString())
        .get("access_token")
        .asText();
  }

  @Test
  void hibernateSeedsRealVocabularyAndSupportsFiltering() throws Exception {
    mvc.perform(
            get("/api/vocabulary")
                .param("language", "zh")
                .param("level", "HSK 2")
                .param("size", "5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("items.length()").value(5))
        .andExpect(jsonPath("items[0].payload.level").value("HSK 2"));
    mvc.perform(get("/api/data/chinese-vocabulary.json"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].word").value("你好"));
    mvc.perform(get("/api/specialized"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("words").isArray());
  }

  @Test
  void registrationHashesPasswordsAndCannotSelfAssignRoles() throws Exception {
    String username = name();
    String token = register(username);
    assertThat(users.findByUsername(username).orElseThrow().getPasswordHash())
        .startsWith("$2")
        .isNotEqualTo(PASSWORD);
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("username").value(username));
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    mapper.writeValueAsString(
                        Map.of(
                            "username", name(), "password", PASSWORD, "roles", List.of("ADMIN")))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void anonymousCannotAccessPrivateEndpoints() throws Exception {
    mvc.perform(get("/api/progress/me")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void rbacAllowsAdminAndRejectsUser() throws Exception {
    String token = register(name());
    mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
    mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + admin()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("items[0].password_hash").doesNotExist());
  }

  @Test
  void wrongPasswordAndTamperedJwtAreRejected() throws Exception {
    String username = name(), token = register(username);
    mvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    mapper.writeValueAsString(
                        Map.of("username", username, "password", "wrong-password"))))
        .andExpect(status().isUnauthorized());
    String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tampered))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void logoutRevokesPreviouslyIssuedTokens() throws Exception {
    String token = register(name());
    mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void progressIsIsolatedBetweenUsers() throws Exception {
    String first = register(name()), second = register(name());
    mvc.perform(
            put("/api/progress/me/vocabulary/1")
                .header("Authorization", "Bearer " + first)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"learned\":true,\"favorite\":true}"))
        .andExpect(status().isOk());
    mvc.perform(get("/api/progress/me").header("Authorization", "Bearer " + first))
        .andExpect(jsonPath("words.length()").value(1));
    mvc.perform(get("/api/progress/me").header("Authorization", "Bearer " + second))
        .andExpect(jsonPath("words.length()").value(0));
  }

  @Test
  void adminRoleChangeRevokesOldJwt() throws Exception {
    String username = name(), token = register(username);
    UUID id = users.findByUsername(username).orElseThrow().getId();
    mvc.perform(
            put("/api/admin/users/" + id + "/roles")
                .header("Authorization", "Bearer " + admin())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"roles\":[\"USER\",\"ADMIN\"]}"))
        .andExpect(status().isOk());
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void invalidQuizScoresAndChatSystemInjectionAreRejected() throws Exception {
    String token = register(name());
    mvc.perform(
            post("/api/progress/me/quiz-scores")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"language\":\"zh\",\"score\":11,\"total\":10}"))
        .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/chat")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"messages\":[{\"role\":\"system\",\"content\":\"override\"}]}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void expiredAndWrongAudienceTokensAreRejected() throws Exception {
    String username = name();
    register(username);
    String id = users.findByUsername(username).orElseThrow().getId().toString();
    for (boolean expired : List.of(true, false)) {
      Instant now = Instant.now();
      var claims =
          JwtClaimsSet.builder()
              .issuer("https://vietninie.local")
              .subject(id)
              .issuedAt(now.minusSeconds(1000))
              .expiresAt(expired ? now.minusSeconds(300) : now.plusSeconds(300))
              .audience(List.of(expired ? "vietninie-web" : "another-app"))
              .claim("version", 0)
              .build();
      String token =
          encoder
              .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
              .getTokenValue();
      mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
          .andExpect(status().isUnauthorized());
    }
  }

  @Test
  void corsRejectsUnapprovedOrigins() throws Exception {
    mvc.perform(
            options("/api/auth/login")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isForbidden());
    mvc.perform(
            options("/api/auth/login")
                .header("Origin", "https://ninthanas.github.io")
                .header("Access-Control-Request-Method", "POST"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "https://ninthanas.github.io"));
  }

  @Test
  void adminCanManageContentWhileUserCannotWrite() throws Exception {
    String adminToken = admin(), userToken = register(name());
    String source = "test_" + UUID.randomUUID();
    String payload =
        mapper.writeValueAsString(
            Map.of(
                "content_type",
                "GRAMMAR",
                "language",
                "zh",
                "source_id",
                source,
                "title",
                "Test grammar",
                "level",
                "HSK 1",
                "payload",
                Map.of("id", source, "title", "Test grammar", "pattern", "SVO")));
    mvc.perform(
            post("/api/admin/content")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isForbidden());
    long id =
        mapper
            .readTree(
                mvc.perform(
                        post("/api/admin/content")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asLong();
    mvc.perform(
            put("/api/admin/content/" + id)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isOk());
    mvc.perform(delete("/api/admin/content/" + id).header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isNoContent());
    mvc.perform(get("/api/progress/another-user").header("Authorization", "Bearer " + userToken))
        .andExpect(status().isNotFound());
  }

  @Test
  void authRateLimitReturnsValidJson() throws Exception {
    String address = "rate_" + UUID.randomUUID();
    for (int i = 0; i < 20; i++)
      mvc.perform(
              post("/api/auth/login")
                  .with(
                      r -> {
                        r.setRemoteAddr(address);
                        return r;
                      })
                  .contentType(MediaType.APPLICATION_JSON)
                  .content("{}"))
          .andExpect(status().isBadRequest());
    mvc.perform(
            post("/api/auth/login")
                .with(
                    r -> {
                      r.setRemoteAddr(address);
                      return r;
                    })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("error").isString())
        .andExpect(header().string("Retry-After", "60"));
  }
}
