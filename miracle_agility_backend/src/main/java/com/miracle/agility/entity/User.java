package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 用户实体类
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("users")
public class User {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("openid")
    private String openid;
    
    @TableField("unionid")
    private String unionid;
    
    @TableField("nickname")
    private String nickname;
    
    @TableField("avatar_url")
    private String avatarUrl;
    
    @TableField("gender")
    private Integer gender = 0; // 0-未知, 1-男, 2-女
    
    @TableField("phone")
    private String phone;
    
    @TableField("email")
    private String email;
    
    @TableField("real_name")
    private String realName;
    
    @TableField("province")
    private String province;
    
    @TableField("city")
    private String city;
    
    @TableField("district")
    private String district;
    
    @TableField("bio")
    private String bio;
    
    @TableField("profession")
    private String profession;
    
    @TableField("specialties")
    private String specialties;
    
    @TableField("experience_level")
    private String experienceLevel;
    
    @TableField("role")
    private String role = "user"; // user, admin, super_admin
    
    @TableField("status")
    private String status = "active"; // active, inactive, banned
    
    @TableField("level")
    private String level = "新手";
    
    @TableField("experience_points")
    private Integer experiencePoints = 0;
    
    @TableField("total_study_time")
    private Integer totalStudyTime = 0;
    
    @TableField("last_login_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLoginTime;
    
    @TableField("last_login_ip")
    private String lastLoginIp;
    
    @TableField("registration_source")
    private String registrationSource = "wechat";
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // 注释掉@TableLogic注解，改用手动处理软删除
    // @TableLogic
    @TableField("deleted_at")
    @JsonIgnore
    private LocalDateTime deletedAt;
    
    /**
     * 判断是否为管理员
     */
    public boolean isAdmin() {
        return "admin".equals(this.role) || "super_admin".equals(this.role);
    }
    
    /**
     * 判断是否为超级管理员
     */
    public boolean isSuperAdmin() {
        return "super_admin".equals(this.role);
    }
    
    /**
     * 判断账号是否可用
     */
    public boolean isActive() {
        return "active".equals(this.status);
    }
} 