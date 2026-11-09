package com.vietninie.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.vietninie.api.repository.UserRepository;
import com.vietninie.api.response.ApiError;
import java.time.Instant;
import java.util.*;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  SecretKey jwtKey(@Value("${app.jwt.secret}") String value) {
    byte[] bytes;
    try {
      bytes = Base64.getDecoder().decode(value);
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("JWT_SECRET must be base64", e);
    }
    if (bytes.length < 32)
      throw new IllegalArgumentException("JWT_SECRET must contain at least 32 random bytes");
    return new SecretKeySpec(bytes, "HmacSHA256");
  }

  @Bean
  JwtEncoder jwtEncoder(SecretKey key) {
    return new NimbusJwtEncoder(new ImmutableSecret<>(key));
  }

  @Bean
  JwtDecoder jwtDecoder(
      SecretKey key,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.audience}") String audience) {
    var decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    OAuth2TokenValidator<Jwt> required =
        jwt -> {
          if (jwt.getExpiresAt() == null
              || jwt.getSubject() == null
              || !jwt.getAudience().contains(audience)
              || jwt.getClaim("version") == null)
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
          return OAuth2TokenValidatorResult.success();
        };
    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(issuer), required));
    return decoder;
  }

  @Bean
  SecurityFilterChain security(
      HttpSecurity http,
      UserRepository users,
      ObjectMapper mapper,
      AuthRateLimitFilter limiter,
      @org.springframework.beans.factory.annotation.Qualifier("cors")
          CorsConfigurationSource corsSource)
      throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsSource))
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .formLogin(f -> f.disable())
        .httpBasic(b -> b.disable());
    http.authorizeHttpRequests(
        auth ->
            auth.requestMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()
                .requestMatchers("/health", "/api/health")
                .permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register")
                .permitAll()
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/data/**",
                    "/api/vocabulary/**",
                    "/api/grammar/**",
                    "/api/conversations/**",
                    "/api/specialized")
                .permitAll()
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")
                .anyRequest()
                .hasAnyRole("USER", "ADMIN"));
    http.oauth2ResourceServer(
        oauth ->
            oauth
                .jwt(
                    jwt ->
                        jwt.jwtAuthenticationConverter(
                            token -> {
                              try {
                                var user =
                                    users
                                        .findById(UUID.fromString(token.getSubject()))
                                        .orElseThrow(
                                            () ->
                                                new OAuth2AuthenticationException("invalid_token"));
                                Number version = token.getClaim("version");
                                if (!user.isEnabled()
                                    || version == null
                                    || user.getTokenVersion() != version.longValue())
                                  throw new OAuth2AuthenticationException("invalid_token");
                                return new JwtAuthenticationToken(
                                    token,
                                    user.getRoles().stream()
                                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r.name()))
                                        .toList());
                              } catch (IllegalArgumentException e) {
                                throw new OAuth2AuthenticationException("invalid_token");
                              }
                            }))
                .authenticationEntryPoint(
                    (req, res, e) -> {
                      res.setStatus(401);
                      res.setContentType("application/json;charset=UTF-8");
                      mapper.writeValue(
                          res.getOutputStream(),
                          new ApiError(
                              401,
                              "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
                              req.getRequestURI(),
                              Instant.now()));
                    })
                .accessDeniedHandler(
                    (req, res, e) -> {
                      res.setStatus(403);
                      res.setContentType("application/json;charset=UTF-8");
                      mapper.writeValue(
                          res.getOutputStream(),
                          new ApiError(
                              403,
                              "Bạn không có quyền truy cập.",
                              req.getRequestURI(),
                              Instant.now()));
                    }));
    http.exceptionHandling(
        ex ->
            ex.authenticationEntryPoint(
                    (req, res, e) -> {
                      res.setStatus(401);
                      res.setContentType("application/json;charset=UTF-8");
                      mapper.writeValue(
                          res.getOutputStream(),
                          new ApiError(
                              401, "Vui lòng đăng nhập.", req.getRequestURI(), Instant.now()));
                    })
                .accessDeniedHandler(
                    (req, res, e) -> {
                      res.setStatus(403);
                      res.setContentType("application/json;charset=UTF-8");
                      mapper.writeValue(
                          res.getOutputStream(),
                          new ApiError(
                              403,
                              "Bạn không có quyền truy cập.",
                              req.getRequestURI(),
                              Instant.now()));
                    }));
    http.headers(
        headers ->
            headers.contentSecurityPolicy(
                csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'")));
    http.addFilterBefore(limiter, BearerTokenAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors-origins}") String origins) {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(
        Arrays.stream(origins.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList());
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(false);
    config.setMaxAge(3600L);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  @Bean
  FilterRegistrationBean<AuthRateLimitFilter> disableDuplicate(AuthRateLimitFilter filter) {
    var registration = new FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }
}
