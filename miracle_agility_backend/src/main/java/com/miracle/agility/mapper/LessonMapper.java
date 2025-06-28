package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.Lesson;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 课时Mapper接口
 */
@Mapper
public interface LessonMapper extends BaseMapper<Lesson> {
    
    /**
     * 根据章节ID查询课时列表
     */
    List<Lesson> selectByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 根据章节ID和状态查询课时列表
     */
    List<Lesson> selectByChapterIdAndStatus(@Param("chapterId") Long chapterId, @Param("status") String status);
    
    /**
     * 根据课程ID查询课时列表
     */
    List<Lesson> selectByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 根据课程ID和状态查询课时列表
     */
    List<Lesson> selectByCourseIdAndStatus(@Param("courseId") Long courseId, @Param("status") String status);
    
    /**
     * 根据创建者查询课时列表
     */
    List<Lesson> selectByCreatedBy(@Param("createdBy") Long createdBy);
    
    /**
     * 统计章节下的课时数量
     */
    long countByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 统计章节下已发布的课时数量
     */
    long countPublishedByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 统计课程下的课时数量
     */
    long countByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 统计课程下已发布的课时数量
     */
    long countPublishedByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 更新课时排序
     */
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
    
    /**
     * 更新课时卡片数量
     */
    int updateLessonCardCount(@Param("id") Long id, @Param("cardCount") Integer cardCount);
    
    /**
     * 增加学习人数
     */
    int incrementStudyCount(@Param("id") Long id);
    
    /**
     * 增加完成人数
     */
    int incrementCompletionCount(@Param("id") Long id);
} 