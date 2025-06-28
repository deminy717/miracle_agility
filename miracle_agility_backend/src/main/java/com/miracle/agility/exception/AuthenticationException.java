package com.miracle.agility.exception;

/**
 * 认证异常 - 用于token过期、无效等情况
 */
public class AuthenticationException extends RuntimeException {
    
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
} 