package com.miracle.agility.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.miracle.agility.entity.CourseAccessCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 课程授权码Mapper
 */
@Mapper
public interface CourseAccessCodeMapper extends BaseMapper<CourseAccessCode> {

    /**
     * 根据授权码查找（包含课程信息）
     */
    @Select("SELECT cac.*, c.title as course_title, c.description as course_description, " +
            "c.cover as course_cover, c.teacher_name, c.level, c.price " +
            "FROM course_access_codes cac " +
            "LEFT JOIN courses c ON cac.course_id = c.id " +
            "WHERE cac.code = #{code}")
    CourseAccessCode findByCodeWithCourse(@Param("code") String code);

    /**
     * 根据课程ID获取所有授权码（包含使用者信息）
     */
    @Select("SELECT cac.*, u.nickname as used_by_nickname, " +
            "cu.nickname as created_by_nickname " +
            "FROM course_access_codes cac " +
            "LEFT JOIN users u ON cac.used_by = u.id " +
            "LEFT JOIN users cu ON cac.created_by = cu.id " +
            "WHERE cac.course_id = #{courseId} " +
            "ORDER BY cac.created_at DESC")
    List<CourseAccessCode> getCourseAccessCodes(@Param("courseId") Long courseId);

    /**
     * 获取所有授权码（管理员使用，包含课程和用户信息）
     */
    @Select("SELECT cac.*, c.title as course_title, " +
            "u.nickname as used_by_nickname, cu.nickname as created_by_nickname " +
            "FROM course_access_codes cac " +
            "LEFT JOIN courses c ON cac.course_id = c.id " +
            "LEFT JOIN users u ON cac.used_by = u.id " +
            "LEFT JOIN users cu ON cac.created_by = cu.id " +
            "ORDER BY cac.created_at DESC")
    List<CourseAccessCode> getAllAccessCodesWithDetails();

    /**
     * 根据创建者获取授权码列表
     */
    @Select("SELECT cac.*, c.title as course_title " +
            "FROM course_access_codes cac " +
            "LEFT JOIN courses c ON cac.course_id = c.id " +
            "WHERE cac.created_by = #{createdBy} " +
            "ORDER BY cac.created_at DESC")
    List<CourseAccessCode> getAccessCodesByCreator(@Param("createdBy") Long createdBy);

    /**
     * 检查授权码是否存在
     */
    @Select("SELECT COUNT(*) FROM course_access_codes WHERE code = #{code}")
    int countByCode(@Param("code") String code);

    /**
     * 获取某课程的有效授权码数量
     */
    @Select("SELECT COUNT(*) FROM course_access_codes WHERE course_id = #{courseId} AND status = 'active'")
    int getActiveCodeCount(@Param("courseId") Long courseId);
} 