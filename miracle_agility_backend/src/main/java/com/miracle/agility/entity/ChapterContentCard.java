package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 章节内容卡片实体类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("chapter_content_cards")
public class ChapterContentCard {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("chapter_id")
    private Long chapterId;
    
    @TableField("card_type")
    private String cardType; // video, text, image, highlight
    
    @TableField("title")
    private String title;
    
    @TableField("content")
    private String content;
    
    @TableField("sort_order")
    private Integer sortOrder;
    
    // 视频相关字段
    @TableField("video_url")
    private String videoUrl;
    
    @TableField("video_duration")
    private String videoDuration;
    
    @TableField("video_views")
    private String videoViews;
    
    @TableField("video_thumbnail")
    private String videoThumbnail;
    
    // 图片相关字段
    @TableField("image_url")
    private String imageUrl;
    
    @TableField("image_description")
    private String imageDescription;
    
    // 重点卡片相关字段 (存储为JSON字符串)
    @TableField("highlight_points")
    private String highlightPointsJson;
    
    // 扩展数据字段 (存储为JSON字符串)
    @TableField("extra_data")
    private String extraDataJson;
    
    @TableField("status")
    private String status; // active, inactive
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField("deleted_at")
    private LocalDateTime deletedAt;
    
    // 业务方法
    public boolean isVideo() {
        return "video".equals(this.cardType);
    }
    
    public boolean isText() {
        return "text".equals(this.cardType);
    }
    
    public boolean isImage() {
        return "image".equals(this.cardType);
    }
    
    public boolean isHighlight() {
        return "highlight".equals(this.cardType);
    }
    
    public boolean isActive() {
        return "active".equals(this.status);
    }
    
    public void activate() {
        this.status = "active";
    }
    
    public void deactivate() {
        this.status = "inactive";
    }
} 