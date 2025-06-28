package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 课时实体类（简化版）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("lessons")
public class Lesson {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("chapter_id")
    private Long chapterId;
    
    @TableField("course_id")
    private Long courseId;
    
    @TableField("title")
    private String title;
    
    @TableField("sort_order")
    private Integer sortOrder;
    
    @TableField("status")
    private String status; // draft, published
    
    @TableField("duration_minutes")
    private Integer durationMinutes;
    
    @TableField("lesson_card_count")
    private Integer lessonCardCount;
    
    @TableField("video_url")
    private String videoUrl;
    
    @TableField("video_duration")
    private String videoDuration;
    
    @TableField("thumbnail_url")
    private String thumbnailUrl;
    
    @TableField("created_by")
    private Long createdBy;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    
    @TableField("published_at")
    private LocalDateTime publishedAt;

    @TableField("deleted_at")
    private LocalDateTime deletedAt;
    
    // 业务方法
    public boolean isDraft() {
        return "draft".equals(this.status);
    }
    
    public boolean isPublished() {
        return "published".equals(this.status);
    }
    
    public void publish() {
        this.status = "published";
        this.publishedAt = LocalDateTime.now();
    }
    
    public void incrementCardCount() {
        this.lessonCardCount = (this.lessonCardCount == null ? 0 : this.lessonCardCount) + 1;
    }
    
    public void decrementCardCount() {
        if (this.lessonCardCount != null && this.lessonCardCount > 0) {
            this.lessonCardCount--;
        }
    }
} 