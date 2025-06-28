package com.miracle.agility.config;

import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.exception.AuthorizationException;
import com.miracle.agility.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理认证异常 - 401 Unauthorized
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException e, HttpServletRequest request) {
        log.warn("认证异常: 请求URL={}, 异常消息={}", request.getRequestURL(), e.getMessage());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 401);
        result.put("message", e.getMessage());
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }

    /**
     * 处理授权异常 - 403 Forbidden
     */
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthorizationException(AuthorizationException e, HttpServletRequest request) {
        log.warn("授权异常: 请求URL={}, 异常消息={}", request.getRequestURL(), e.getMessage());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 403);
        result.put("message", e.getMessage());
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
    }

    /**
     * 处理业务异常 - 400 Bad Request
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.warn("业务异常: 请求URL={}, 异常消息={}", request.getRequestURL(), e.getMessage());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 400);
        result.put("message", e.getMessage());
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * 处理所有未捕获的异常 - 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e, HttpServletRequest request) {
        log.error("未处理异常:");
        log.error("请求URL: {}", request.getRequestURL());
        log.error("请求方法: {}", request.getMethod());
        log.error("请求参数: {}", request.getQueryString());
        log.error("异常类型: {}", e.getClass().getName());
        log.error("异常消息: {}", e.getMessage());
        log.error("异常堆栈:", e);

        Map<String, Object> result = new HashMap<>();
        result.put("code", 500);
        result.put("message", "服务器内部错误");
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }

    /**
     * 处理JSON解析异常 - 400 Bad Request
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleJsonParseException(HttpMessageNotReadableException e, HttpServletRequest request) {
        log.error("JSON解析异常: 请求URL={}, 异常消息={}", request.getRequestURL(), e.getMessage());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 400);
        result.put("message", "请求数据格式错误");
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * 处理参数验证异常 - 400 Bad Request
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException e, HttpServletRequest request) {
        log.error("参数验证异常: 请求URL={}", request.getRequestURL());

        String errorMessage = e.getBindingResult().getAllErrors().stream()
                .map(error -> ((FieldError) error).getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        Map<String, Object> result = new HashMap<>();
        result.put("code", 400);
        result.put("message", "参数验证失败: " + errorMessage);
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    /**
     * 处理方法不支持异常 - 405 Method Not Allowed
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        log.error("HTTP方法不支持异常: 请求URL={}, 请求方法={}", request.getRequestURL(), request.getMethod());

        Map<String, Object> result = new HashMap<>();
        result.put("code", 405);
        result.put("message", "HTTP方法不支持: " + request.getMethod());
        result.put("data", null);
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(result);
    }
} 