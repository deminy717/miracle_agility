package com.miracle.agility.exception;

/**
 * 业务异常 - 用于业务逻辑错误
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
} 