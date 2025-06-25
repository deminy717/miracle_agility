package com.miracle.agility.common;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 统一API响应格式
 */
public class ApiResponse<T> {
    
    @JsonProperty("error")
    private int error;
    
    @JsonProperty("body")
    private T body;
    
    @JsonProperty("message")
    private String message;
    
    public ApiResponse() {
    }
    
    public ApiResponse(int error, T body, String message) {
        this.error = error;
        this.body = body;
        this.message = message;
    }
    
    /**
     * 成功响应
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, data, "");
    }
    
    /**
     * 成功响应（无数据）
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(0, null, "");
    }
    
    /**
     * 业务异常响应
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(400, null, message);
    }
    
    /**
     * 系统异常响应
     */
    public static <T> ApiResponse<T> systemError() {
        return new ApiResponse<>(500, null, "系统异常");
    }
    
    /**
     * 需要登录响应
     */
    public static <T> ApiResponse<T> unauthorized() {
        return new ApiResponse<>(401, null, "需要登录");
    }
    
    /**
     * 自定义错误码响应
     */
    public static <T> ApiResponse<T> error(int errorCode, String message) {
        return new ApiResponse<>(errorCode, null, message);
    }
    
    // Getters and Setters
    public int getError() {
        return error;
    }
    
    public void setError(int error) {
        this.error = error;
    }
    
    public T getBody() {
        return body;
    }
    
    public void setBody(T body) {
        this.body = body;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
} 