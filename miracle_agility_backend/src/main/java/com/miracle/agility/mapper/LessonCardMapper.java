package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.LessonCard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 课时卡片Mapper接口
 */
@Mapper
public interface LessonCardMapper extends BaseMapper<LessonCard> {
    
    /**
     * 根据课时ID查询卡片列表
     */
    List<LessonCard> selectByLessonId(@Param("lessonId") Long lessonId);
    
    /**
     * 根据课时ID和状态查询卡片列表
     */
    List<LessonCard> selectByLessonIdAndStatus(@Param("lessonId") Long lessonId, @Param("status") String status);
    
    /**
     * 根据章节ID查询卡片列表
     */
    List<LessonCard> selectByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 根据课程ID查询卡片列表
     */
    List<LessonCard> selectByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 根据卡片类型查询卡片列表
     */
    List<LessonCard> selectByCardType(@Param("cardType") String cardType);
    
    /**
     * 统计课时下的卡片数量
     */
    long countByLessonId(@Param("lessonId") Long lessonId);
    
    /**
     * 统计课时下活跃的卡片数量
     */
    long countActiveByLessonId(@Param("lessonId") Long lessonId);
    
    /**
     * 统计章节下的卡片数量
     */
    long countByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 统计课程下的卡片数量
     */
    long countByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 更新卡片排序
     */
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
    
    /**
     * 根据课时ID删除所有卡片（软删除）
     */
    int deleteByLessonId(@Param("lessonId") Long lessonId);
    
    /**
     * 根据章节ID删除所有卡片（软删除）
     */
    int deleteByChapterId(@Param("chapterId") Long chapterId);
    
    /**
     * 根据课程ID删除所有卡片（软删除）
     */
    int deleteByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 查询必修卡片列表
     */
    List<LessonCard> selectRequiredByLessonId(@Param("lessonId") Long lessonId);
    
    /**
     * 查询需要完成的卡片列表
     */
    List<LessonCard> selectCompletionRequiredByLessonId(@Param("lessonId") Long lessonId);
} 