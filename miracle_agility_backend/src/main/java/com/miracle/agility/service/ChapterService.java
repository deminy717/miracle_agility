package com.miracle.agility.service;

import com.miracle.agility.dto.ChapterCreateRequest;
import com.miracle.agility.dto.ChapterResponse;
import com.miracle.agility.entity.Chapter;

import java.util.List;

/**
 * 章节服务接口
 */
public interface ChapterService {
    
    /**
     * 创建章节（卡片式编辑器）
     */
    ChapterResponse createChapter(ChapterCreateRequest request, Long createdBy);
    
    /**
     * 根据ID查询章节详情（包含内容卡片）
     */
    ChapterResponse getChapterById(Long chapterId);
    
    /**
     * 根据课程ID查询章节列表
     */
    List<ChapterResponse> getChaptersByCourseId(Long courseId);
    
    /**
     * 根据课程ID查询已发布的章节列表
     */
    List<ChapterResponse> getPublishedChaptersByCourseId(Long courseId);
    
    /**
     * 更新章节基本信息
     */
    ChapterResponse updateChapter(Long chapterId, ChapterCreateRequest request, Long updatedBy);
    
    /**
     * 删除章节（软删除）
     */
    void deleteChapter(Long chapterId, Long deletedBy);
    
    /**
     * 发布章节
     */
    void publishChapter(Long chapterId, Long publishedBy);
    
    /**
     * 下架章节（转为草稿状态）
     */
    void unpublishChapter(Long chapterId, Long unpublishedBy);
    
    /**
     * 归档章节
     */
    void archiveChapter(Long chapterId, Long archivedBy);
    
    /**
     * 更新章节排序
     */
    void updateChapterSort(Long courseId, List<Long> chapterIds);
    
    /**
     * 根据创建者查询章节列表
     */
    List<ChapterResponse> getChaptersByCreatedBy(Long createdBy);
    
    /**
     * 统计课程章节数量
     */
    long countChaptersByCourseId(Long courseId);
    
    /**
     * 统计课程已发布章节数量
     */
    long countPublishedChaptersByCourseId(Long courseId);
} 