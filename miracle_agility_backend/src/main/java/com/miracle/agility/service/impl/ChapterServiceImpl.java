package com.miracle.agility.service.impl;

import com.miracle.agility.dto.ChapterCreateRequest;
import com.miracle.agility.dto.ChapterResponse;
import com.miracle.agility.entity.Chapter;
import com.miracle.agility.entity.ChapterContentCard;
import com.miracle.agility.mapper.ChapterMapper;
import com.miracle.agility.mapper.ChapterContentCardMapper;
import com.miracle.agility.service.ChapterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 章节服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterMapper chapterMapper;
    private final ChapterContentCardMapper contentCardMapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChapterResponse createChapter(ChapterCreateRequest request, Long createdBy) {
        log.info("开始创建章节: courseId={}, title={}, createdBy={}", 
                request.getCourseId(), request.getTitle(), createdBy);

        try {
            // 1. 创建章节基本信息
            Chapter chapter = new Chapter();
            chapter.setCourseId(request.getCourseId());
            chapter.setTitle(request.getTitle());
            chapter.setDescription(request.getDescription());
            chapter.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "draft");
            chapter.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 0);
            chapter.setCreatedBy(createdBy);
            
            // 设置排序号
            Integer sortOrder = request.getSortOrder();
            if (sortOrder == null) {
                sortOrder = chapterMapper.getNextSortOrder(request.getCourseId());
            }
            chapter.setSortOrder(sortOrder);
            
            // 初始化卡片数量为0，章节创建时不处理内容卡片
            chapter.setContentCardCount(0);

            // 保存章节
            chapterMapper.insert(chapter);
            log.info("章节创建成功: chapterId={}", chapter.getId());

            // 注意：不再在创建时处理内容卡片，这些操作将在编辑章节阶段进行
            // 创建章节时只创建基本的章节信息

            // 查询完整的章节信息并返回
            return getChapterById(chapter.getId());

        } catch (Exception e) {
            log.error("创建章节失败: {}", e.getMessage(), e);
            throw new RuntimeException("创建章节失败: " + e.getMessage(), e);
        }
    }

    @Override
    public ChapterResponse getChapterById(Long chapterId) {
        try {
            Chapter chapter = chapterMapper.selectById(chapterId);
            if (chapter == null) {
                throw new RuntimeException("章节不存在");
            }

            List<ChapterContentCard> contentCards = contentCardMapper.selectByChapterId(chapterId);
            return ChapterResponse.fromEntityWithCards(chapter, contentCards);

        } catch (Exception e) {
            log.error("获取章节详情失败: chapterId={}, error={}", chapterId, e.getMessage());
            throw new RuntimeException("获取章节详情失败", e);
        }
    }

    @Override
    public List<ChapterResponse> getChaptersByCourseId(Long courseId) {
        try {
            List<Chapter> chapters = chapterMapper.selectByCourseId(courseId);
            return chapters.stream()
                    .map(chapter -> {
                        List<ChapterContentCard> cards = contentCardMapper.selectByChapterId(chapter.getId());
                        return ChapterResponse.fromEntityWithCards(chapter, cards);
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("获取课程章节列表失败: courseId={}, error={}", courseId, e.getMessage());
            throw new RuntimeException("获取课程章节列表失败", e);
        }
    }

    @Override
    public List<ChapterResponse> getPublishedChaptersByCourseId(Long courseId) {
        try {
            List<Chapter> chapters = chapterMapper.selectByCourseIdAndStatus(courseId, "published");
            return chapters.stream()
                    .map(ChapterResponse::fromEntity)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("获取已发布章节列表失败: courseId={}, error={}", courseId, e.getMessage());
            throw new RuntimeException("获取已发布章节列表失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChapterResponse updateChapter(Long chapterId, ChapterCreateRequest request, Long updatedBy) {
        log.info("开始更新章节: chapterId={}, updatedBy={}", chapterId, updatedBy);

        try {
            Chapter chapter = chapterMapper.selectById(chapterId);
            if (chapter == null) {
                throw new RuntimeException("章节不存在");
            }

            // 更新基本信息
            chapter.setTitle(request.getTitle());
            chapter.setDescription(request.getDescription());
            if (StringUtils.hasText(request.getStatus())) {
                chapter.setStatus(request.getStatus());
            }
            if (request.getDurationMinutes() != null) {
                chapter.setDurationMinutes(request.getDurationMinutes());
            }
            if (request.getSortOrder() != null) {
                chapter.setSortOrder(request.getSortOrder());
            }

            chapterMapper.updateById(chapter);

            // TODO: 处理内容卡片的更新逻辑

            log.info("章节更新成功: chapterId={}", chapterId);
            return getChapterById(chapterId);

        } catch (Exception e) {
            log.error("更新章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            throw new RuntimeException("更新章节失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteChapter(Long chapterId, Long deletedBy) {
        log.info("开始删除章节: chapterId={}, deletedBy={}", chapterId, deletedBy);

        try {
            Chapter chapter = chapterMapper.selectById(chapterId);
            if (chapter == null) {
                throw new RuntimeException("章节不存在");
            }

            // 软删除章节
            chapterMapper.deleteById(chapterId);
            
            // 软删除关联的内容卡片
            contentCardMapper.deleteByChapterId(chapterId);

            log.info("章节删除成功: chapterId={}", chapterId);

        } catch (Exception e) {
            log.error("删除章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            throw new RuntimeException("删除章节失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishChapter(Long chapterId, Long publishedBy) {
        try {
            Chapter chapter = chapterMapper.selectById(chapterId);
            if (chapter == null) {
                throw new RuntimeException("章节不存在");
            }

            chapter.publish();
            chapterMapper.updateById(chapter);
            log.info("章节发布成功: chapterId={}", chapterId);

        } catch (Exception e) {
            log.error("发布章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            throw new RuntimeException("发布章节失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void archiveChapter(Long chapterId, Long archivedBy) {
        try {
            Chapter chapter = chapterMapper.selectById(chapterId);
            if (chapter == null) {
                throw new RuntimeException("章节不存在");
            }

            chapter.archive();
            chapterMapper.updateById(chapter);
            log.info("章节归档成功: chapterId={}", chapterId);

        } catch (Exception e) {
            log.error("归档章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            throw new RuntimeException("归档章节失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateChapterSort(Long courseId, List<Long> chapterIds) {
        try {
            for (int i = 0; i < chapterIds.size(); i++) {
                chapterMapper.updateSortOrder(chapterIds.get(i), i + 1);
            }
            log.info("章节排序更新成功: courseId={}", courseId);

        } catch (Exception e) {
            log.error("更新章节排序失败: courseId={}, error={}", courseId, e.getMessage());
            throw new RuntimeException("更新章节排序失败", e);
        }
    }

    @Override
    public List<ChapterResponse> getChaptersByCreatedBy(Long createdBy) {
        try {
            List<Chapter> chapters = chapterMapper.selectByCreatedBy(createdBy);
            return chapters.stream()
                    .map(ChapterResponse::fromEntity)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("获取用户创建的章节失败: createdBy={}, error={}", createdBy, e.getMessage());
            throw new RuntimeException("获取用户创建的章节失败", e);
        }
    }

    @Override
    public long countChaptersByCourseId(Long courseId) {
        return chapterMapper.countByCourseId(courseId);
    }

    @Override
    public long countPublishedChaptersByCourseId(Long courseId) {
        return chapterMapper.countPublishedByCourseId(courseId);
    }

    /**
     * 创建内容卡片
     * 注意：此方法当前未在创建章节时使用，保留用于将来编辑章节阶段处理内容卡片
     */
    private void createContentCards(Long chapterId, List<ChapterCreateRequest.ContentCardRequest> cardRequests) {
        try {
            for (int i = 0; i < cardRequests.size(); i++) {
                ChapterCreateRequest.ContentCardRequest cardRequest = cardRequests.get(i);
                
                ChapterContentCard card = new ChapterContentCard();
                card.setChapterId(chapterId);
                card.setCardType(cardRequest.getCardType());
                card.setTitle(cardRequest.getTitle());
                card.setContent(cardRequest.getContent());
                card.setSortOrder(cardRequest.getSortOrder() != null ? cardRequest.getSortOrder() : i + 1);
                card.setStatus(StringUtils.hasText(cardRequest.getStatus()) ? cardRequest.getStatus() : "active");
                
                // 设置类型特定字段
                if ("video".equals(cardRequest.getCardType())) {
                    card.setVideoUrl(cardRequest.getVideoUrl());
                    card.setVideoDuration(cardRequest.getVideoDuration());
                    card.setVideoViews(cardRequest.getVideoViews());
                    card.setVideoThumbnail(cardRequest.getVideoThumbnail());
                } else if ("image".equals(cardRequest.getCardType())) {
                    card.setImageUrl(cardRequest.getImageUrl());
                    card.setImageDescription(cardRequest.getImageDescription());
                } else if ("highlight".equals(cardRequest.getCardType()) && cardRequest.getHighlightPoints() != null) {
                    // 将List转换为JSON字符串存储
                    try {
                        String json = objectMapper.writeValueAsString(cardRequest.getHighlightPoints());
                        card.setHighlightPointsJson(json);
                    } catch (Exception e) {
                        log.warn("转换重点列表为JSON失败: {}", e.getMessage());
                    }
                }
                
                contentCardMapper.insert(card);
            }
        } catch (Exception e) {
            log.error("创建内容卡片失败: {}", e.getMessage(), e);
            throw new RuntimeException("创建内容卡片失败", e);
        }
    }
} 