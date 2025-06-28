package com.miracle.agility.dto;

import com.miracle.agility.entity.Chapter;
import com.miracle.agility.entity.ChapterContentCard;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 章节响应DTO
 */
@Data
@Builder
public class ChapterResponse {
    
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer sortOrder;
    private String status;
    private Integer durationMinutes;
    private Integer contentCardCount;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    
    private List<ContentCardResponse> contentCards;
    
    @Data
    @Builder
    public static class ContentCardResponse {
        
        private Long id;
        private Long chapterId;
        private String cardType;
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
        
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public static ContentCardResponse fromEntity(ChapterContentCard card) {
            return ContentCardResponse.builder()
                    .id(card.getId())
                    .chapterId(card.getChapterId())
                    .cardType(card.getCardType())
                    .title(card.getTitle())
                    .content(card.getContent())
                    .sortOrder(card.getSortOrder())
                    .videoUrl(card.getVideoUrl())
                    .videoDuration(card.getVideoDuration())
                    .videoViews(card.getVideoViews())
                    .videoThumbnail(card.getVideoThumbnail())
                    .imageUrl(card.getImageUrl())
                    .imageDescription(card.getImageDescription())
                    // TODO: 处理highlightPoints的JSON转换
                    .status(card.getStatus())
                    .createdAt(card.getCreatedAt())
                    .updatedAt(card.getUpdatedAt())
                    .build();
        }
    }
    
    public static ChapterResponse fromEntity(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .courseId(chapter.getCourseId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .sortOrder(chapter.getSortOrder())
                .status(chapter.getStatus())
                .durationMinutes(chapter.getDurationMinutes())
                .contentCardCount(chapter.getContentCardCount())
                .createdBy(chapter.getCreatedBy())
                .createdAt(chapter.getCreatedAt())
                .updatedAt(chapter.getUpdatedAt())
                .publishedAt(chapter.getPublishedAt())
                .build();
    }
    
    public static ChapterResponse fromEntityWithCards(Chapter chapter, List<ChapterContentCard> cards) {
        ChapterResponse response = fromEntity(chapter);
        if (cards != null) {
            response.setContentCards(
                cards.stream()
                    .map(ContentCardResponse::fromEntity)
                    .collect(Collectors.toList())
            );
        }
        return response;
    }
} 