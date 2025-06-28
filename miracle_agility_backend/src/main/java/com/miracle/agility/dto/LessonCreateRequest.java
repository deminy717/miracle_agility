package com.miracle.agility.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 课时创建请求DTO
 */
@Data
public class LessonCreateRequest {
    
    @NotNull(message = "章节ID不能为空")
    private Long chapterId;
    
    @NotNull(message = "课程ID不能为空")
    private Long courseId;
    
    @NotBlank(message = "课时标题不能为空")
    @Size(max = 200, message = "课时标题长度不能超过200字符")
    private String title;
    
    private Integer sortOrder;
    
    private String status; // draft, published, archived
    
    private Integer durationMinutes;
    
    private String videoUrl;
    
    private String videoDuration;
    
    private String thumbnailUrl;
    
    // 课时卡片列表（创建时可选，编辑时在单独接口处理）
    private List<LessonCardRequest> lessonCards;
    
    @Data
    public static class LessonCardRequest {
        
        private String cardType; // video, text, image, highlight, quiz, audio
        
        private String title;
        
        private String content;
        
        private Integer sortOrder;
        
        // 视频相关字段
        private String videoUrl;
        private String videoDuration;
        private String videoViews;
        private String videoThumbnail;
        private Long videoFileSize;
        
        // 图片相关字段
        private String imageUrl;
        private String imageDescription;
        private String imageAlt;
        
        // 音频相关字段
        private String audioUrl;
        private String audioDuration;
        
        // 重点卡片相关字段
        private List<String> highlightPoints;
        
        // 测验卡片相关字段
        private Object quizData;
        
        private String status; // active, inactive
        
        private Boolean isRequired;
        
        private Boolean completionRequired;
    }
} 