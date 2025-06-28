package com.miracle.agility.exception;

/**
 * 授权异常 - 用于权限不足等情况
 */
public class AuthorizationException extends RuntimeException {
    
    public AuthorizationException(String message) {
        super(message);
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
} 