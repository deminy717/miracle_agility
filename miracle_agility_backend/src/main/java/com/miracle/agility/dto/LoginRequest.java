package com.miracle.agility.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 微信小程序登录请求DTO
 */
@Data
public class LoginRequest {
    
    @NotBlank(message = "微信登录凭证不能为空")
    private String code; // 微信登录凭证
    
    private String encryptedData; // 加密数据
    
    private String iv; // 初始向量
    
    private String signature; // 数据签名
    
    private String rawData; // 原始数据
    
    // 用户信息（来自微信授权）
    private String nickname;
    private String avatarUrl;
    private Integer gender;
    
    // 设备信息
    private String deviceModel;
    private String deviceSystem;
    private String deviceVersion;
    private String clientVersion;
} 