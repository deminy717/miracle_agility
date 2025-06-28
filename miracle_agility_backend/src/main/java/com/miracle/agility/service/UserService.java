package com.miracle.agility.service;

import com.miracle.agility.dto.LoginRequest;
import com.miracle.agility.dto.LoginResponse;
import com.miracle.agility.entity.User;

/**
 * 用户服务接口
 */
public interface UserService {
    
    /**
     * 微信小程序登录
     * 
     * @param loginRequest 登录请求
     * @param clientIp 客户端IP
     * @param userAgent 用户代理
     * @return 登录响应
     */
    LoginResponse wxLogin(LoginRequest loginRequest, String clientIp, String userAgent);
    
    /**
     * 根据访问令牌获取用户信息
     * 
     * @param accessToken 访问令牌
     * @return 用户信息
     */
    User getUserByAccessToken(String accessToken);
    
    /**
     * 刷新访问令牌
     * 
     * @param refreshToken 刷新令牌
     * @param clientIp 客户端IP
     * @param userAgent 用户代理
     * @return 新的登录响应
     */
    LoginResponse refreshToken(String refreshToken, String clientIp, String userAgent);
    
    /**
     * 用户登出
     * 
     * @param accessToken 访问令牌
     */
    void logout(String accessToken);
    
    /**
     * 根据ID获取用户信息
     * 
     * @param userId 用户ID
     * @return 用户信息
     */
    User getUserById(Long userId);
    
    /**
     * 更新用户信息
     * 
     * @param user 用户信息
     * @return 更新后的用户信息
     */
    User updateUser(User user);
    
    /**
     * 检查用户权限
     * 
     * @param userId 用户ID
     * @param permission 权限
     * @return 是否有权限
     */
    boolean hasPermission(Long userId, String permission);
} 