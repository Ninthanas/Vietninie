package com.vietninie.api.exception;

import com.vietninie.api.response.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private ResponseEntity<ApiError> error(
      HttpStatus status, String message, HttpServletRequest request) {
    return ResponseEntity.status(status)
        .body(new ApiError(status.value(), message, request.getRequestURI(), Instant.now()));
  }

  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiError> api(ApiException e, HttpServletRequest r) {
    return error(e.getStatus(), e.getMessage(), r);
  }

  @ExceptionHandler({
    MethodArgumentNotValidException.class,
    ConstraintViolationException.class,
    HttpMessageNotReadableException.class,
    IllegalArgumentException.class
  })
  ResponseEntity<ApiError> validation(Exception e, HttpServletRequest r) {
    return error(HttpStatus.BAD_REQUEST, "Dữ liệu yêu cầu không hợp lệ.", r);
  }

  @ExceptionHandler({
    DataIntegrityViolationException.class,
    OptimisticLockingFailureException.class
  })
  ResponseEntity<ApiError> conflict(Exception e, HttpServletRequest r) {
    return error(HttpStatus.CONFLICT, "Dữ liệu trùng hoặc đã được thay đổi. Hãy tải lại.", r);
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiError> denied(Exception e, HttpServletRequest r) {
    return error(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này.", r);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> unknown(Exception e, HttpServletRequest r) {
    return error(HttpStatus.INTERNAL_SERVER_ERROR, "Máy chủ chưa thể xử lý yêu cầu.", r);
  }

  @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
  ResponseEntity<ApiError> notFound(Exception e, HttpServletRequest r) {
    return error(HttpStatus.NOT_FOUND, "Không tìm thấy API.", r);
  }

  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  ResponseEntity<ApiError> method(Exception e, HttpServletRequest r) {
    return error(HttpStatus.METHOD_NOT_ALLOWED, "Phương thức HTTP không được hỗ trợ.", r);
  }
}
