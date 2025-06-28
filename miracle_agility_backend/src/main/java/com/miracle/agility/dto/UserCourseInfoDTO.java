package com.miracle.agility.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户课程信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCourseInfoDTO {
    /**
     * 课程ID
     */
    private Long courseId;
    
    /**
     * 课程标题
     */
    private String courseTitle;
    
    /**
     * 课程封面
     */
    private String courseCover;
    
    /**
     * 学习进度
     */
    private Integer progress;
    
    /**
     * 总学习时间（分钟）
     */
    private Integer totalStudyMinutes;
    
    /**
     * 注册类型
     */
    private String registrationType;
    
    /**
     * 是否已完成
     */
    private Boolean isCompleted;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 最后学习时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastStudyTime;
} 