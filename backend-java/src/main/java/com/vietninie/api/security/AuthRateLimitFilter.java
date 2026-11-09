package com.vietninie.api.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
  private record Window(long start, int count) {}

  private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !"POST".equals(request.getMethod())
        || !(request.getRequestURI().equals("/api/auth/login")
            || request.getRequestURI().equals("/api/auth/register"));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    long now = System.currentTimeMillis();
    windows.entrySet().removeIf(e -> now - e.getValue().start() > 60000);
    if (windows.size() > 10000) {
      reject(response);
      return;
    }
    var window =
        windows.compute(
            request.getRemoteAddr(),
            (key, old) ->
                old == null || now - old.start() > 60000
                    ? new Window(now, 1)
                    : new Window(old.start(), old.count() + 1));
    if (window.count() > 20) {
      reject(response);
      return;
    }
    chain.doFilter(request, response);
  }

  private void reject(HttpServletResponse response) throws IOException {
    response.setStatus(429);
    response.setHeader("Retry-After", "60");
    response.setContentType("application/json;charset=UTF-8");
    response
        .getWriter()
        .write("{\"error\":\"Quá nhiều yêu cầu đăng nhập. Vui lòng chờ một phút.\"}");
  }
}
