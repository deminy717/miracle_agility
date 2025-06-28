package com.miracle.agility.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

/**
 * 章节创建请求DTO
 */
@Data
public class ChapterCreateRequest {
    
    @NotNull(message = "课程ID不能为空")
    private Long courseId;
    
    @NotBlank(message = "章节标题不能为空")
    @Size(max = 200, message = "章节标题长度不能超过200字符")
    private String title;
    
    @NotBlank(message = "章节描述不能为空")
    @Size(max = 2000, message = "章节描述长度不能超过2000字符")
    private String description;
    
    private Integer sortOrder;
    
    private String status; // draft, published, archived
    
    private Integer durationMinutes;
    
    // 注意：contentCards字段保留但移除校验，创建时不会处理这些卡片
    // 卡片的创建和编辑将在编辑章节阶段进行
    private List<ContentCardRequest> contentCards;
    
    @Data
    public static class ContentCardRequest {
        
        private String cardType; // video, text, image, highlight
        
        private String title;
        
        private String content;
        
        private Integer sortOrder;
        
        // 视频相关字段
        private String videoUrl;
        private String videoDuration;
        private String videoViews;
        private String videoThumbnail;
        
        // 图片相关字段
        private String imageUrl;
        private String imageDescription;
        
        // 重点卡片相关字段
        private List<String> highlightPoints;
        
        private String status; // active, inactive
    }
} 