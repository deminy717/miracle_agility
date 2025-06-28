package com.miracle.agility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户统计信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsDTO {
    /**
     * 总用户数
     */
    private Long totalUsers;
    
    /**
     * 总注册课程数
     */
    private Long totalRegistrations;
    
    /**
     * 已完成课程数
     */
    private Long completedCourses;
    
    /**
     * 完成率（百分比）
     */
    private Double completionRate;
} 