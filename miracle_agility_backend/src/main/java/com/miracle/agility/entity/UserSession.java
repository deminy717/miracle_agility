package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户会话实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("user_sessions")
public class UserSession {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("session_key")
    private String sessionKey;
    
    @TableField("access_token")
    private String accessToken;
    
    @TableField("refresh_token")
    private String refreshToken;
    
    @TableField("expires_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;
    
    @TableField("client_ip")
    private String clientIp;
    
    @TableField("user_agent")
    private String userAgent;
    
    @TableField("device_info")
    private String deviceInfo; // JSON格式的设备信息
    
    @TableField("status")
    private String status = "active"; // active, expired, revoked
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    /**
     * 判断会话是否有效
     */
    public boolean isValid() {
        return "active".equals(this.status) && 
               this.expiresAt != null && 
               this.expiresAt.isAfter(LocalDateTime.now());
    }
    
    /**
     * 判断会话是否过期
     */
    public boolean isExpired() {
        return this.expiresAt != null && this.expiresAt.isBefore(LocalDateTime.now());
    }
} 