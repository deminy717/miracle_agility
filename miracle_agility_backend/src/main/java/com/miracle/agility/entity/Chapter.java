package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 章节实体类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("chapters")
public class Chapter {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("course_id")
    private Long courseId;
    
    @TableField("title")
    private String title;
    
    @TableField("description")
    private String description;
    
    @TableField("sort_order")
    private Integer sortOrder;
    
    @TableField("status")
    private String status; // draft, published, archived
    
    @TableField("duration_minutes")
    private Integer durationMinutes;
    
    @TableField("content_card_count")
    private Integer contentCardCount;
    
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
    
    public boolean isArchived() {
        return "archived".equals(this.status);
    }
    
    public void publish() {
        this.status = "published";
        this.publishedAt = LocalDateTime.now();
    }
    
    public void archive() {
        this.status = "archived";
    }
    
    public void incrementCardCount() {
        this.contentCardCount = (this.contentCardCount == null ? 0 : this.contentCardCount) + 1;
    }
    
    public void decrementCardCount() {
        if (this.contentCardCount != null && this.contentCardCount > 0) {
            this.contentCardCount--;
        }
    }
} 