package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.experimental.Accessors;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 课程实体类
 */
@Data
@Accessors(chain = true)
@TableName("courses")
public class Course {

    /**
     * 课程ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 课程标题
     */
    @TableField("title")
    private String title;

    /**
     * 课程描述
     */
    @TableField("description")
    private String description;

    /**
     * 封面图片URL
     */
    @TableField("cover")
    private String cover;

    /**
     * 教师ID
     */
    @TableField("teacher_id")
    private Long teacherId;

    /**
     * 教师姓名
     */
    @TableField("teacher_name")
    private String teacherName;

    /**
     * 课程分类
     */
    @TableField("category")
    private String category;

    /**
     * 课程级别: beginner-初级, intermediate-中级, advanced-高级
     */
    @TableField("level")
    private String level;

    /**
     * 课程价格
     */
    @TableField("price")
    private BigDecimal price;

    /**
     * 原价
     */
    @TableField("original_price")
    private BigDecimal originalPrice;

    /**
     * 总时长(分钟)
     */
    @TableField("duration_minutes")
    private Integer durationMinutes;

    /**
     * 章节数量
     */
    @TableField("chapter_count")
    private Integer chapterCount;

    /**
     * 学生数量
     */
    @TableField("student_count")
    private Integer studentCount;

    /**
     * 评分
     */
    @TableField("rating")
    private BigDecimal rating;

    /**
     * 评分人数
     */
    @TableField("rating_count")
    private Integer ratingCount;

    /**
     * 标签数组(JSON)
     */
    @TableField("tags")
    private String tags;

    /**
     * 学习要求(JSON)
     */
    @TableField("requirements")
    private String requirements;

    /**
     * 学习目标(JSON)
     */
    @TableField("objectives")
    private String objectives;

    /**
     * 状态: draft-草稿, pending-待审核, published-已发布, rejected-被拒绝, archived-已归档
     */
    @TableField("status")
    private String status;

    /**
     * 是否免费
     */
    @TableField("is_free")
    private Boolean isFree;

    /**
     * 排序权重
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 创建者ID
     */
    @TableField("created_by")
    private Long createdBy;

    /**
     * 创建时间
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

    /**
     * 发布时间
     */
    @TableField("published_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishedAt;



    // 业务方法

    /**
     * 是否已发布
     */
    public boolean isPublished() {
        return "published".equals(this.status);
    }

    /**
     * 是否为草稿
     */
    public boolean isDraft() {
        return "draft".equals(this.status);
    }

    /**
     * 获取格式化的价格
     */
    public String getFormattedPrice() {
        if (isFree != null && isFree) {
            return "免费";
        }
        if (price == null) {
            return "未定价";
        }
        return "¥" + price.toString();
    }

    /**
     * 获取级别显示名称
     */
    public String getLevelDisplayName() {
        if (level == null) return "未知";
        switch (level) {
            case "beginner":
                return "初级";
            case "intermediate":
                return "中级";
            case "advanced":
                return "高级";
            default:
                return "未知";
        }
    }

    /**
     * 获取状态显示名称
     */
    public String getStatusDisplayName() {
        if (status == null) return "未知";
        switch (status) {
            case "draft":
                return "草稿";
            case "pending":
                return "待审核";
            case "published":
                return "已发布";
            case "rejected":
                return "被拒绝";
            case "archived":
                return "已归档";
            default:
                return "未知";
        }
    }

    /**
     * 增加学生数量
     */
    public void incrementStudentCount() {
        this.studentCount = (this.studentCount == null ? 0 : this.studentCount) + 1;
    }

    /**
     * 更新章节数量
     */
    public void updateChapterCount(int count) {
        this.chapterCount = count;
    }

    /**
     * 发布课程
     */
    public void publish() {
        this.status = "published";
        this.publishedAt = LocalDateTime.now();
    }

    /**
     * 归档课程
     */
    public void archive() {
        this.status = "archived";
    }

    /**
     * 设置为草稿
     */
    public void setAsDraft() {
        this.status = "draft";
        this.publishedAt = null;
    }
} 