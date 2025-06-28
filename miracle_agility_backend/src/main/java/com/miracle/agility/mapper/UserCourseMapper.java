package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.UserCourse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 用户课程关联Mapper
 */
@Mapper
public interface UserCourseMapper extends BaseMapper<UserCourse> {

    /**
     * 根据用户ID获取用户的所有课程（包含课程信息）
     */
    @Select("SELECT uc.*, c.title as course_title, c.description as course_description, " +
            "c.cover as course_cover, c.teacher_name, c.level, c.status as course_status " +
            "FROM user_courses uc " +
            "LEFT JOIN courses c ON uc.course_id = c.id " +
            "WHERE uc.user_id = #{userId} AND uc.status = 'active' " +
            "ORDER BY uc.created_at DESC")
    List<UserCourse> getUserCoursesWithDetails(@Param("userId") Long userId);

    /**
     * 根据课程ID获取所有注册用户（包含用户信息）
     */
    @Select("SELECT uc.*, u.nickname, u.avatar_url, u.phone, u.email " +
            "FROM user_courses uc " +
            "LEFT JOIN users u ON uc.user_id = u.id " +
            "WHERE uc.course_id = #{courseId} AND uc.status = 'active' " +
            "ORDER BY uc.created_at DESC")
    List<UserCourse> getCourseStudentsWithDetails(@Param("courseId") Long courseId);

    /**
     * 获取所有用户课程关联信息（管理员使用，包含用户和课程详情）
     */
    @Select("SELECT uc.*, u.nickname, u.avatar_url, u.phone, u.email, " +
            "c.title as course_title, c.description as course_description, c.cover as course_cover " +
            "FROM user_courses uc " +
            "LEFT JOIN users u ON uc.user_id = u.id " +
            "LEFT JOIN courses c ON uc.course_id = c.id " +
            "WHERE uc.status = 'active' " +
            "ORDER BY uc.created_at DESC")
    List<UserCourse> getAllUserCoursesWithDetails();

    /**
     * 检查用户是否已注册某课程
     */
    @Select("SELECT COUNT(*) FROM user_courses WHERE user_id = #{userId} AND course_id = #{courseId} AND status = 'active'")
    int countUserCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);

    /**
     * 获取课程的学生数量
     */
    @Select("SELECT COUNT(*) FROM user_courses WHERE course_id = #{courseId} AND status = 'active'")
    int getCourseStudentCount(@Param("courseId") Long courseId);

    /**
     * 获取用户的课程数量
     */
    @Select("SELECT COUNT(*) FROM user_courses WHERE user_id = #{userId} AND status = 'active'")
    int getUserCourseCount(@Param("userId") Long userId);
} 