package com.miracle.agility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 用户列表项DTO，用于用户管理列表展示
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemDTO {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 用户昵称
     */
    private String nickname;
    
    /**
     * 用户头像
     */
    private String avatarUrl;
    
    /**
     * 联系电话
     */
    private String phone;
    
    /**
     * 电子邮箱
     */
    private String email;
    
    /**
     * 注册课程数量
     */
    private Integer courseCount;
    
    /**
     * 用户关联的课程列表
     */
    private List<UserCourseInfoDTO> courses;
} 