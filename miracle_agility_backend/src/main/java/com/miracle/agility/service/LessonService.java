package com.miracle.agility.service;

import com.miracle.agility.dto.LessonCreateRequest;
import com.miracle.agility.dto.LessonResponse;

import java.util.List;

/**
 * 课时服务接口
 */
public interface LessonService {
    
    /**
     * 创建课时
     */
    LessonResponse createLesson(LessonCreateRequest request, Long createdBy);
    
    /**
     * 根据ID获取课时详情
     */
    LessonResponse getLessonById(Long lessonId);
    
    /**
     * 根据ID获取课时详情（包含卡片）
     */
    LessonResponse getLessonWithCards(Long lessonId);
    
    /**
     * 根据章节ID获取课时列表
     */
    List<LessonResponse> getLessonsByChapterId(Long chapterId);
    
    /**
     * 根据章节ID获取已发布的课时列表
     */
    List<LessonResponse> getPublishedLessonsByChapterId(Long chapterId);
    
    /**
     * 根据课程ID获取课时列表
     */
    List<LessonResponse> getLessonsByCourseId(Long courseId);
    
    /**
     * 根据课程ID获取已发布的课时列表
     */
    List<LessonResponse> getPublishedLessonsByCourseId(Long courseId);
    
    /**
     * 更新课时
     */
    LessonResponse updateLesson(Long lessonId, LessonCreateRequest request, Long updatedBy);
    
    /**
     * 删除课时
     */
    void deleteLesson(Long lessonId, Long deletedBy);
    
    /**
     * 发布课时
     */
    void publishLesson(Long lessonId, Long publishedBy);

    /**
     * 统计章节下的课时数量
     */
    long countLessonsByChapterId(Long chapterId);

} 