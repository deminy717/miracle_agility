package com.miracle.agility.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 课程响应DTO
 */
@Data
public class CourseResponse {

    /**
     * 课程ID
     */
    private Long id;

    /**
     * 课程标题
     */
    private String title;

    /**
     * 课程描述
     */
    private String description;

    /**
     * 封面图片URL
     */
    private String cover;

    /**
     * 教师ID
     */
    private Long teacherId;

    /**
     * 教师姓名
     */
    private String teacherName;

    /**
     * 课程分类
     */
    private String category;

    /**
     * 课程级别
     */
    private String level;

    /**
     * 级别显示名称
     */
    private String levelDisplayName;

    /**
     * 课程价格
     */
    private BigDecimal price;

    /**
     * 原价
     */
    private BigDecimal originalPrice;

    /**
     * 格式化价格
     */
    private String formattedPrice;

    /**
     * 总时长(分钟)
     */
    private Integer durationMinutes;

    /**
     * 章节数量
     */
    private Integer chapterCount;

    /**
     * 学生数量
     */
    private Integer studentCount;

    /**
     * 评分
     */
    private BigDecimal rating;

    /**
     * 评分人数
     */
    private Integer ratingCount;

    /**
     * 标签数组
     */
    private String tags;

    /**
     * 学习要求
     */
    private String requirements;

    /**
     * 学习目标
     */
    private String objectives;

    /**
     * 状态
     */
    private String status;

    /**
     * 状态显示名称
     */
    private String statusDisplayName;

    /**
     * 是否免费
     */
    private Boolean isFree;

    /**
     * 排序权重
     */
    private Integer sortOrder;

    /**
     * 创建者ID
     */
    private Long createdBy;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 发布时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;

    /**
     * 更新时间（前端兼容字段）
     */
    public String getUpdateTime() {
        if (updatedAt != null) {
            return updatedAt.toLocalDate().toString();
        }
        return "";
    }
} 