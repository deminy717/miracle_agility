package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Delete;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 课程Mapper接口
 */
@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    /**
     * 根据状态查询课程列表
     */
    @Select("SELECT * FROM courses WHERE status = #{status} ORDER BY sort_order ASC, created_at DESC")
    List<Course> selectByStatus(@Param("status") String status);

    /**
     * 根据分类查询课程列表
     */
    @Select("SELECT * FROM courses WHERE category = #{category} ORDER BY sort_order ASC, created_at DESC")
    List<Course> selectByCategory(@Param("category") String category);

    /**
     * 根据创建者查询课程列表
     */
    @Select("SELECT * FROM courses WHERE created_by = #{createdBy} ORDER BY created_at DESC")
    List<Course> selectByCreatedBy(@Param("createdBy") Long createdBy);

    /**
     * 搜索课程（按标题和描述）
     */
    @Select("SELECT * FROM courses WHERE (title LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%')) ORDER BY sort_order ASC, created_at DESC")
    List<Course> searchCourses(@Param("keyword") String keyword);

    /**
     * 更新课程状态
     */
    @Update("UPDATE courses SET status = #{status}, published_at = #{publishedAt}, updated_at = NOW() WHERE id = #{courseId}")
    int updateStatus(@Param("courseId") Long courseId, @Param("status") String status, @Param("publishedAt") LocalDateTime publishedAt);

    /**
     * 更新章节数量
     */
    @Update("UPDATE courses SET chapter_count = #{chapterCount}, updated_at = NOW() WHERE id = #{courseId}")
    int updateChapterCount(@Param("courseId") Long courseId, @Param("chapterCount") Integer chapterCount);

    /**
     * 增加学生数量
     */
    @Update("UPDATE courses SET student_count = student_count + 1, updated_at = NOW() WHERE id = #{courseId}")
    int incrementStudentCount(@Param("courseId") Long courseId);

    /**
     * 获取课程统计信息
     */
    @Select("SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published, " +
            "SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft, " +
            "SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived " +
            "FROM courses")
    Map<String, Object> getStatistics();

    /**
     * 获取用户创建的课程统计
     */
    @Select("SELECT " +
            "COUNT(*) as total, " +
            "SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published, " +
            "SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft " +
            "FROM courses WHERE created_by = #{userId}")
    Map<String, Object> getUserStatistics(@Param("userId") Long userId);

    /**
     * 获取热门课程（按学生数量排序）
     */
    @Select("SELECT * FROM courses WHERE status = 'published' ORDER BY student_count DESC LIMIT #{limit}")
    List<Course> getPopularCourses(@Param("limit") Integer limit);

    /**
     * 获取最新发布的课程
     */
    @Select("SELECT * FROM courses WHERE status = 'published' ORDER BY published_at DESC LIMIT #{limit}")
    List<Course> getLatestCourses(@Param("limit") Integer limit);

    /**
     * 物理删除课程
     */
    @Delete("DELETE FROM courses WHERE id = #{courseId}")
    int deleteById(@Param("courseId") Long courseId);
} 