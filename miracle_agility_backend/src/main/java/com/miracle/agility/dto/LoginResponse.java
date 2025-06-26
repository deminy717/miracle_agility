package com.miracle.agility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.miracle.agility.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 登录响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String accessToken; // 访问令牌
    
    private String refreshToken; // 刷新令牌
    
    private Long expiresIn; // 过期时间（秒）
    
    private UserInfo userInfo; // 用户信息
    
    private Boolean isNewUser; // 是否为新用户
    
    /**
     * 用户信息DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String openid;
        private String nickname;
        private String avatarUrl;
        private Integer gender;
        private String phone;
        private String email;
        private String realName;
        private String role;
        private String status;
        private String level;
        private Integer experiencePoints;
        private Integer totalStudyTime;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastLoginTime;
        
        // 新增个人信息字段
        private String province;
        private String city;
        private String district;
        private String bio;
        private String profession;
        private String specialties;
        private String experienceLevel;
        
        // 用户权限标识
        private Boolean isAdmin;
        private Boolean isDeveloper;
        
        /**
         * 从User实体转换为UserInfo DTO
         */
        public static UserInfo fromUser(User user) {
            return UserInfo.builder()
                    .id(user.getId())
                    .openid(user.getOpenid())
                    .nickname(user.getNickname())
                    .avatarUrl(user.getAvatarUrl())
                    .gender(user.getGender())
                    .phone(user.getPhone())
                    .email(user.getEmail())
                    .realName(user.getRealName())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .level(user.getLevel())
                    .experiencePoints(user.getExperiencePoints())
                    .totalStudyTime(user.getTotalStudyTime())
                    .lastLoginTime(user.getLastLoginTime())
                    // 新增个人信息字段
                    .province(user.getProvince())
                    .city(user.getCity())
                    .district(user.getDistrict())
                    .bio(user.getBio())
                    .profession(user.getProfession())
                    .specialties(user.getSpecialties())
                    .experienceLevel(user.getExperienceLevel())
                    // 权限标识
                    .isAdmin(user.isAdmin())
                    .isDeveloper("developer".equals(user.getRole())) // 开发者标识
                    .build();
        }
    }
} 