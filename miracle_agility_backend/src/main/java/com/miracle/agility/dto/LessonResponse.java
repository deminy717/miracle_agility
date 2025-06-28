package com.miracle.agility.dto;

import com.miracle.agility.entity.Lesson;
import com.miracle.agility.entity.LessonCard;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 课时响应DTO（简化版）
 */
@Data
@Builder
public class LessonResponse {
    
    private Long id;
    private Long chapterId;
    private Long courseId;
    private String title;
    private Integer sortOrder;
    private String status;
    private Integer durationMinutes;
    private Integer lessonCardCount;
    private String videoUrl;
    private String videoDuration;
    private String thumbnailUrl;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
    
    private List<LessonCardResponse> lessonCards;
    
    @Data
    @Builder
    public static class LessonCardResponse {
        
        private Long id;
        private Long lessonId;
        private Long chapterId;
        private Long courseId;
        private String cardType;
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
        
        // 文件相关字段
        private String fileUrl;
        private String fileName;
        private String fileSize;
        private String fileType;
        
        // 重点卡片相关字段
        private List<String> highlightPoints;
        
        // 测验卡片相关字段
        private Object quizData; // 可以是复杂的测验数据结构
        
        private String status;
        private Boolean isRequired;
        private Boolean completionRequired;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public static LessonCardResponse fromEntity(LessonCard card) {
            return LessonCardResponse.builder()
                    .id(card.getId())
                    .lessonId(card.getLessonId())
                    .chapterId(card.getChapterId())
                    .courseId(card.getCourseId())
                    .cardType(card.getCardType())
                    .title(card.getTitle())
                    .content(card.getContent())
                    .sortOrder(card.getSortOrder())
                    .videoUrl(card.getVideoUrl())
                    .videoDuration(card.getVideoDuration())
                    .videoViews(card.getVideoViews())
                    .videoThumbnail(card.getVideoThumbnail())
                    .videoFileSize(card.getVideoFileSize())
                    .imageUrl(card.getImageUrl())
                    .imageDescription(card.getImageDescription())
                    .imageAlt(card.getImageAlt())
                    .audioUrl(card.getAudioUrl())
                    .audioDuration(card.getAudioDuration())
                    .fileUrl(card.getFileUrl())
                    .fileName(card.getFileName())
                    .fileSize(card.getFileSize())
                    .fileType(card.getFileType())
                    .highlightPoints(parseHighlightPoints(card.getHighlightPointsJson()))
                    .quizData(parseQuizData(card.getQuizDataJson()))
                    .status(card.getStatus())
                    .isRequired(card.getIsRequired())
                    .completionRequired(card.getCompletionRequired())
                    .createdAt(card.getCreatedAt())
                    .updatedAt(card.getUpdatedAt())
                    .build();
        }
        
        /**
         * 解析重点列表JSON字符串
         */
        private static List<String> parseHighlightPoints(String highlightPointsJson) {
            if (highlightPointsJson == null || highlightPointsJson.trim().isEmpty()) {
                return Collections.emptyList();
            }
            
            try {
                // 处理逗号分隔的格式
                String[] points = highlightPointsJson.split(",");
                return Arrays.stream(points)
                        .map(String::trim)
                        .filter(point -> !point.isEmpty())
                        .collect(Collectors.toList());
            } catch (Exception e) {
                // 解析失败时返回空列表，避免影响整体功能
                return Collections.emptyList();
            }
        }
        
        /**
         * 解析测验数据JSON字符串
         */
        private static Object parseQuizData(String quizDataJson) {
            if (quizDataJson == null || quizDataJson.trim().isEmpty()) {
                return null;
            }
            
            // 目前直接返回原始字符串
            // 后续可以根据具体的测验数据结构进行JSON解析
            return quizDataJson;
        }
    }
    
    public static LessonResponse fromEntity(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapterId())
                .courseId(lesson.getCourseId())
                .title(lesson.getTitle())
                .sortOrder(lesson.getSortOrder())
                .status(lesson.getStatus())
                .durationMinutes(lesson.getDurationMinutes())
                .lessonCardCount(lesson.getLessonCardCount())
                .videoUrl(lesson.getVideoUrl())
                .videoDuration(lesson.getVideoDuration())
                .thumbnailUrl(lesson.getThumbnailUrl())
                .createdBy(lesson.getCreatedBy())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .publishedAt(lesson.getPublishedAt())
                .build();
    }
    
    public static LessonResponse fromEntityWithCards(Lesson lesson, List<LessonCard> cards) {
        LessonResponse response = fromEntity(lesson);
        if (cards != null) {
            response.setLessonCards(
                cards.stream()
                    .map(LessonCardResponse::fromEntity)
                    .collect(Collectors.toList())
            );
        }
        return response;
    }
} 