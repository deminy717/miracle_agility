package com.miracle.agility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 用户详细信息DTO，包含用户基本信息和课程列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {
    /**
     * 用户基本信息
     */
    private UserInfoDTO userInfo;
    
    /**
     * 用户关联的课程列表
     */
    private List<UserCourseInfoDTO> courses;
} 