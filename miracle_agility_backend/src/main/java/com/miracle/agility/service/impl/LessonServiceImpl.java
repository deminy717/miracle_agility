package com.miracle.agility.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.miracle.agility.dto.LessonCreateRequest;
import com.miracle.agility.dto.LessonResponse;
import com.miracle.agility.entity.Chapter;
import com.miracle.agility.entity.Lesson;
import com.miracle.agility.entity.LessonCard;
import com.miracle.agility.mapper.ChapterMapper;
import com.miracle.agility.mapper.LessonCardMapper;
import com.miracle.agility.mapper.LessonMapper;
import com.miracle.agility.service.LessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 课时服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonMapper lessonMapper;
    private final LessonCardMapper lessonCardMapper;
    private final ChapterMapper chapterMapper;

    @Override
    @Transactional
    public LessonResponse createLesson(LessonCreateRequest request, Long createdBy) {
        log.info("创建课时: chapterId={}, title={}", request.getChapterId(), request.getTitle());
        
        // 验证章节是否存在
        Chapter chapter = chapterMapper.selectById(request.getChapterId());
        if (chapter == null) {
            throw new IllegalArgumentException("章节不存在");
        }
        
        // 获取排序位置
        Integer sortOrder = request.getSortOrder();
        if (sortOrder == null) {
            QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("chapter_id", request.getChapterId());
            queryWrapper.orderByDesc("sort_order");
            queryWrapper.last("LIMIT 1");
            Lesson lastLesson = lessonMapper.selectOne(queryWrapper);
            sortOrder = (lastLesson != null && lastLesson.getSortOrder() != null) ? lastLesson.getSortOrder() + 1 : 1;
        }
        
        // 创建课时实体
        Lesson lesson = new Lesson();
        lesson.setChapterId(request.getChapterId());
        lesson.setCourseId(request.getCourseId());
        lesson.setTitle(request.getTitle());
        lesson.setSortOrder(sortOrder);
        lesson.setStatus(request.getStatus() != null ? request.getStatus() : "draft");
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setVideoDuration(request.getVideoDuration());
        lesson.setThumbnailUrl(request.getThumbnailUrl());
        lesson.setCreatedBy(createdBy);
        lesson.setLessonCardCount(0);
        
        lessonMapper.insert(lesson);
        
        // 处理课时卡片
        if (request.getLessonCards() != null && !request.getLessonCards().isEmpty()) {
            for (int i = 0; i < request.getLessonCards().size(); i++) {
                LessonCreateRequest.LessonCardRequest cardRequest = request.getLessonCards().get(i);
                createLessonCard(lesson.getId(), cardRequest, i + 1);
            }
            lesson.setLessonCardCount(request.getLessonCards().size());
            lessonMapper.updateById(lesson);
        }
        
        // 更新章节的课时数量
        updateChapterLessonCount(request.getChapterId());
        
        return convertToResponse(lesson);
    }

    @Override
    public LessonResponse getLessonById(Long lessonId) {
        log.info("获取课时详情: lessonId={}", lessonId);
        
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            throw new IllegalArgumentException("课时不存在");
        }
        
        LessonResponse response = convertToResponse(lesson);
        
        // 加载课时卡片
        QueryWrapper<LessonCard> cardQuery = new QueryWrapper<>();
        cardQuery.eq("lesson_id", lessonId);
        cardQuery.eq("status", "active");
        cardQuery.orderByAsc("sort_order");
        List<LessonCard> cards = lessonCardMapper.selectList(cardQuery);
        
        // 转换为响应DTO
        List<LessonResponse.LessonCardResponse> cardResponses = cards.stream()
                .map(LessonResponse.LessonCardResponse::fromEntity)
                .collect(Collectors.toList());
        response.setLessonCards(cardResponses);
        
        return response;
    }

    @Override
    public List<LessonResponse> getLessonsByChapterId(Long chapterId) {
        log.info("获取章节课时列表: chapterId={}", chapterId);
        
        QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("chapter_id", chapterId);
        queryWrapper.isNull("deleted_at");
        queryWrapper.orderByAsc("sort_order");
        
        List<Lesson> lessons = lessonMapper.selectList(queryWrapper);
        return lessons.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LessonResponse> getLessonsByCourseId(Long courseId) {
        log.info("获取课程课时列表: courseId={}", courseId);
        
        QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("course_id", courseId);
        queryWrapper.isNull("deleted_at");
        queryWrapper.orderByAsc("sort_order");
        
        List<Lesson> lessons = lessonMapper.selectList(queryWrapper);
        return lessons.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LessonResponse> getPublishedLessonsByChapterId(Long chapterId) {
        log.info("获取已发布课时列表: chapterId={}", chapterId);
        
        QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("chapter_id", chapterId);
        queryWrapper.eq("status", "published");
        queryWrapper.isNull("deleted_at");
        queryWrapper.orderByAsc("sort_order");
        
        List<Lesson> lessons = lessonMapper.selectList(queryWrapper);
        return lessons.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonCreateRequest request, Long updatedBy) {
        log.info("更新课时: lessonId={}, title={}", lessonId, request.getTitle());
        
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            throw new IllegalArgumentException("课时不存在");
        }
        
        // 更新课时基本信息
        lesson.setTitle(request.getTitle());
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setVideoDuration(request.getVideoDuration());
        lesson.setThumbnailUrl(request.getThumbnailUrl());
        
        if (request.getStatus() != null) {
            lesson.setStatus(request.getStatus());
        }
        
        // 处理课时卡片：全量替换策略
        if (request.getLessonCards() != null) {
            log.info("更新课时卡片: lessonId={}, 卡片数量={}", lessonId, request.getLessonCards().size());
            
            // 1. 删除现有的所有课时卡片（软删除）
            deleteLessonCardsByLessonId(lessonId);
            
            // 2. 重新创建所有新的课时卡片
            int sortOrder = 1;
            for (LessonCreateRequest.LessonCardRequest cardRequest : request.getLessonCards()) {
                createLessonCardForUpdate(lessonId, lesson.getChapterId(), lesson.getCourseId(), cardRequest, sortOrder++);
            }
            
            // 3. 更新课时的卡片数量
            lesson.setLessonCardCount(request.getLessonCards().size());
        }
        
        lessonMapper.updateById(lesson);
        
        // 返回包含卡片数据的完整响应
        return getLessonById(lessonId);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId, Long deletedBy) {
        log.info("删除课时: lessonId={}", lessonId);
        
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            throw new IllegalArgumentException("课时不存在");
        }
        
        // 软删除课时
        lesson.setDeletedAt(LocalDateTime.now());
        lessonMapper.updateById(lesson);
        
        // 软删除相关的课时卡片
        UpdateWrapper<LessonCard> cardUpdate = new UpdateWrapper<>();
        cardUpdate.eq("lesson_id", lessonId);
        cardUpdate.set("status", "deleted");
        cardUpdate.set("updated_at", LocalDateTime.now());
        lessonCardMapper.update(null, cardUpdate);
        
        // 更新章节的课时数量
        updateChapterLessonCount(lesson.getChapterId());
    }

    @Override
    @Transactional
    public void publishLesson(Long lessonId, Long publishedBy) {
        log.info("发布课时: lessonId={}", lessonId);
        
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            throw new IllegalArgumentException("课时不存在");
        }
        
        lesson.publish();
        lessonMapper.updateById(lesson);
    }

    @Override
    @Transactional
    public void unpublishLesson(Long lessonId, Long unpublishedBy) {
        log.info("下架课时: lessonId={}", lessonId);
        
        Lesson lesson = lessonMapper.selectById(lessonId);
        if (lesson == null) {
            throw new IllegalArgumentException("课时不存在");
        }
        
        // 将状态设置为草稿
        lesson.setStatus("draft");
        lesson.setPublishedAt(null);
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonMapper.updateById(lesson);
    }


    @Override
    public long countLessonsByChapterId(Long chapterId) {
        QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("chapter_id", chapterId);
        queryWrapper.isNull("deleted_at");
        return lessonMapper.selectCount(queryWrapper);
    }


    @Override
    public LessonResponse getLessonWithCards(Long lessonId) {
        return getLessonById(lessonId);
    }

    @Override
    public List<LessonResponse> getPublishedLessonsByCourseId(Long courseId) {
        log.info("获取课程已发布课时列表: courseId={}", courseId);
        
        QueryWrapper<Lesson> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("course_id", courseId);
        queryWrapper.eq("status", "published");
        queryWrapper.isNull("deleted_at");
        queryWrapper.orderByAsc("sort_order");
        
        List<Lesson> lessons = lessonMapper.selectList(queryWrapper);
        return lessons.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 删除课时的所有卡片（软删除）
     */
    private void deleteLessonCardsByLessonId(Long lessonId) {
        log.info("删除课时的所有卡片: lessonId={}", lessonId);
        
        UpdateWrapper<LessonCard> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("lesson_id", lessonId);
        updateWrapper.set("status", "deleted");
        updateWrapper.set("deleted_at", LocalDateTime.now());
        updateWrapper.set("updated_at", LocalDateTime.now());
        
        lessonCardMapper.update(null, updateWrapper);
    }
    
    /**
     * 为更新操作创建课时卡片
     */
    private void createLessonCardForUpdate(Long lessonId, Long chapterId, Long courseId, 
                                          LessonCreateRequest.LessonCardRequest cardRequest, int sortOrder) {
        LessonCard card = new LessonCard();
        card.setLessonId(lessonId);
        card.setChapterId(chapterId);  // 设置章节ID
        card.setCourseId(courseId);    // 设置课程ID
        card.setCardType(cardRequest.getCardType());
        card.setTitle(cardRequest.getTitle());
        card.setContent(cardRequest.getContent());
        card.setSortOrder(sortOrder);
        card.setStatus(cardRequest.getStatus() != null ? cardRequest.getStatus() : "active");
        
        // 视频相关字段
        card.setVideoUrl(cardRequest.getVideoUrl());
        card.setVideoDuration(cardRequest.getVideoDuration());
        card.setVideoViews(cardRequest.getVideoViews());
        card.setVideoThumbnail(cardRequest.getVideoThumbnail());
        card.setVideoFileSize(cardRequest.getVideoFileSize());
        
        // 图片相关字段
        card.setImageUrl(cardRequest.getImageUrl());
        card.setImageDescription(cardRequest.getImageDescription());
        card.setImageAlt(cardRequest.getImageAlt());
        
        // 音频相关字段
        card.setAudioUrl(cardRequest.getAudioUrl());
        card.setAudioDuration(cardRequest.getAudioDuration());
        
        // 重点卡片相关字段
        if (cardRequest.getHighlightPoints() != null && !cardRequest.getHighlightPoints().isEmpty()) {
            card.setHighlightPointsJson(String.join(",", cardRequest.getHighlightPoints()));
        }
        
        // 测验卡片相关字段
        if (cardRequest.getQuizData() != null) {
            // 这里可以根据需要处理测验数据的序列化
            card.setQuizDataJson(cardRequest.getQuizData().toString());
        }
        
        card.setIsRequired(cardRequest.getIsRequired());
        card.setCompletionRequired(cardRequest.getCompletionRequired());
        
        lessonCardMapper.insert(card);
        log.debug("创建课时卡片成功: lessonId={}, cardType={}, sortOrder={}", lessonId, cardRequest.getCardType(), sortOrder);
    }

    /**
     * 创建课时卡片
     */
    private void createLessonCard(Long lessonId, LessonCreateRequest.LessonCardRequest cardRequest, int sortOrder) {
        LessonCard card = new LessonCard();
        card.setLessonId(lessonId);
        card.setCardType(cardRequest.getCardType());
        card.setTitle(cardRequest.getTitle());
        card.setContent(cardRequest.getContent());
        card.setSortOrder(sortOrder);
        card.setStatus(cardRequest.getStatus() != null ? cardRequest.getStatus() : "active");
        
        // 视频相关字段
        card.setVideoUrl(cardRequest.getVideoUrl());
        card.setVideoDuration(cardRequest.getVideoDuration());
        card.setVideoViews(cardRequest.getVideoViews());
        card.setVideoThumbnail(cardRequest.getVideoThumbnail());
        card.setVideoFileSize(cardRequest.getVideoFileSize());
        
        // 图片相关字段
        card.setImageUrl(cardRequest.getImageUrl());
        card.setImageDescription(cardRequest.getImageDescription());
        card.setImageAlt(cardRequest.getImageAlt());
        
        // 音频相关字段
        card.setAudioUrl(cardRequest.getAudioUrl());
        card.setAudioDuration(cardRequest.getAudioDuration());
        
        // 重点卡片相关字段
        if (cardRequest.getHighlightPoints() != null && !cardRequest.getHighlightPoints().isEmpty()) {
            card.setHighlightPointsJson(String.join(",", cardRequest.getHighlightPoints()));
        }
        
        // 测验卡片相关字段
        if (cardRequest.getQuizData() != null) {
            // 这里可以根据需要处理测验数据的序列化
            card.setQuizDataJson(cardRequest.getQuizData().toString());
        }
        
        card.setIsRequired(cardRequest.getIsRequired());
        card.setCompletionRequired(cardRequest.getCompletionRequired());
        
        lessonCardMapper.insert(card);
    }

    /**
     * 更新章节的课时数量
     */
    private void updateChapterLessonCount(Long chapterId) {
        long lessonCount = countLessonsByChapterId(chapterId);
        
        UpdateWrapper<Chapter> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", chapterId);
        updateWrapper.set("lesson_count", lessonCount);
        updateWrapper.set("updated_at", LocalDateTime.now());
        chapterMapper.update(null, updateWrapper);
    }

    /**
     * 转换为响应DTO
     */
    private LessonResponse convertToResponse(Lesson lesson) {
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
} 