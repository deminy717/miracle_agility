package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.Chapter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 章节Mapper接口
 */
@Mapper
public interface ChapterMapper extends BaseMapper<Chapter> {
    
    /**
     * 根据课程ID查询章节列表
     */
    @Select("SELECT * FROM chapters WHERE course_id = #{courseId} AND deleted_at IS NULL ORDER BY sort_order ASC")
    List<Chapter> selectByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 根据课程ID和状态查询章节列表
     */
    @Select("SELECT * FROM chapters WHERE course_id = #{courseId} AND status = #{status} AND deleted_at IS NULL ORDER BY sort_order ASC")
    List<Chapter> selectByCourseIdAndStatus(@Param("courseId") Long courseId, @Param("status") String status);
    
    /**
     * 获取指定课程的下一个排序号
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM chapters WHERE course_id = #{courseId} AND deleted_at IS NULL")
    Integer getNextSortOrder(@Param("courseId") Long courseId);
    
    /**
     * 更新章节状态
     */
    @Update("UPDATE chapters SET status = #{status}, updated_at = NOW() WHERE id = #{chapterId}")
    int updateStatus(@Param("chapterId") Long chapterId, @Param("status") String status);
    
    /**
     * 更新章节的内容卡片数量
     */
    @Update("UPDATE chapters SET content_card_count = #{count}, updated_at = NOW() WHERE id = #{chapterId}")
    int updateContentCardCount(@Param("chapterId") Long chapterId, @Param("count") Integer count);
    
    /**
     * 批量更新章节排序
     */
    @Update("UPDATE chapters SET sort_order = #{sortOrder}, updated_at = NOW() WHERE id = #{chapterId}")
    int updateSortOrder(@Param("chapterId") Long chapterId, @Param("sortOrder") Integer sortOrder);
    
    /**
     * 统计指定课程的章节数量
     */
    @Select("SELECT COUNT(*) FROM chapters WHERE course_id = #{courseId} AND deleted_at IS NULL")
    long countByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 统计指定课程已发布的章节数量
     */
    @Select("SELECT COUNT(*) FROM chapters WHERE course_id = #{courseId} AND status = 'published' AND deleted_at IS NULL")
    long countPublishedByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 查询指定课程的最大排序号
     */
    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM chapters WHERE course_id = #{courseId} AND deleted_at IS NULL")
    Integer getMaxSortOrderByCourseId(@Param("courseId") Long courseId);
    
    /**
     * 根据创建者查询章节列表
     */
    @Select("SELECT * FROM chapters WHERE created_by = #{createdBy} AND deleted_at IS NULL ORDER BY created_at DESC")
    List<Chapter> selectByCreatedBy(@Param("createdBy") Long createdBy);
} 