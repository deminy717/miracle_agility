package com.miracle.agility.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 课时内容卡片实体类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("lesson_cards")
public class LessonCard {
    
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    @TableField("lesson_id")
    private Long lessonId;
    
    @TableField("chapter_id")
    private Long chapterId;
    
    @TableField("course_id")
    private Long courseId;
    
    @TableField("card_type")
    private String cardType; // video, text, image, highlight, quiz, audio
    
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
    
    @TableField("video_file_size")
    private Long videoFileSize;
    
    // 图片相关字段
    @TableField("image_url")
    private String imageUrl;
    
    @TableField("image_description")
    private String imageDescription;
    
    @TableField("image_alt")
    private String imageAlt;
    
    // 音频相关字段
    @TableField("audio_url")
    private String audioUrl;
    
    @TableField("audio_duration")
    private String audioDuration;
    
    // 重点卡片相关字段 (存储为JSON字符串)
    @TableField("highlight_points")
    private String highlightPointsJson;
    
    // 测验卡片相关字段 (存储为JSON字符串)
    @TableField("quiz_data")
    private String quizDataJson;
    
    // 扩展数据字段 (存储为JSON字符串)
    @TableField("extra_data")
    private String extraDataJson;
    
    @TableField("status")
    private String status; // active, inactive
    
    @TableField("is_required")
    private Boolean isRequired; // 是否必修
    
    @TableField("completion_required")
    private Boolean completionRequired; // 是否需要完成才能继续
    
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
    
    public boolean isQuiz() {
        return "quiz".equals(this.cardType);
    }
    
    public boolean isAudio() {
        return "audio".equals(this.cardType);
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
    
    public boolean isRequired() {
        return Boolean.TRUE.equals(this.isRequired);
    }
    
    public boolean needsCompletion() {
        return Boolean.TRUE.equals(this.completionRequired);
    }
} 