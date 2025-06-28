package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * 用户课程关联实体类
 */
@Data
@Accessors(chain = true)
@TableName("user_courses")
public class UserCourse {

    /**
     * ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 课程ID
     */
    @TableField("course_id")
    private Long courseId;

    /**
     * 注册方式: direct-直接注册, code-授权码注册, gift-赠送
     */
    @TableField("registration_type")
    private String registrationType;

    /**
     * 注册来源：授权码ID（如果是通过授权码注册）
     */
    @TableField("source_code_id")
    private Long sourceCodeId;

    /**
     * 学习进度（百分比，0-100）
     */
    @TableField("progress")
    private Integer progress = 0;

    /**
     * 最后学习时间
     */
    @TableField("last_study_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastStudyTime;

    /**
     * 总学习时间（分钟）
     */
    @TableField("total_study_minutes")
    private Integer totalStudyMinutes = 0;

    /**
     * 是否完成
     */
    @TableField("is_completed")
    private Boolean isCompleted = false;

    /**
     * 完成时间
     */
    @TableField("completed_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;

    /**
     * 评分
     */
    @TableField("rating")
    private Integer rating;

    /**
     * 评价内容
     */
    @TableField("review")
    private String review;

    /**
     * 状态: active-正常, suspended-暂停, cancelled-取消
     */
    @TableField("status")
    private String status = "active";

    /**
     * 注册时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // 非数据库字段，用于关联查询
    @TableField(exist = false)
    private Course course;

    @TableField(exist = false)
    private User user;

    /**
     * 业务方法 - 更新学习进度
     */
    public void updateProgress(int newProgress) {
        this.progress = Math.max(0, Math.min(100, newProgress));
        this.lastStudyTime = LocalDateTime.now();
        
        if (this.progress >= 100 && !Boolean.TRUE.equals(this.isCompleted)) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();
        }
    }

    /**
     * 业务方法 - 增加学习时间
     */
    public void addStudyTime(int minutes) {
        this.totalStudyMinutes = (this.totalStudyMinutes == null ? 0 : this.totalStudyMinutes) + minutes;
        this.lastStudyTime = LocalDateTime.now();
    }

    /**
     * 判断是否为活跃状态
     */
    public boolean isActive() {
        return "active".equals(this.status);
    }
} 