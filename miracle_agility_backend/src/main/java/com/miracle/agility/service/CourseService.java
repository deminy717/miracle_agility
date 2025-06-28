package com.miracle.agility.service;

import com.miracle.agility.dto.CourseCreateRequest;
import com.miracle.agility.dto.CourseResponse;

import java.util.List;
import java.util.Map;

/**
 * 课程服务接口
 */
public interface CourseService {

    /**
     * 创建课程
     */
    CourseResponse createCourse(CourseCreateRequest request, Long userId);

    /**
     * 根据ID获取课程详情
     */
    CourseResponse getCourseById(Long courseId);

    /**
     * 获取所有课程列表
     */
    List<CourseResponse> getAllCourses();

    /**
     * 根据状态获取课程列表
     */
    List<CourseResponse> getCoursesByStatus(String status);

    /**
     * 根据分类获取课程列表
     */
    List<CourseResponse> getCoursesByCategory(String category);

    /**
     * 获取用户创建的课程列表
     */
    List<CourseResponse> getUserCourses(Long userId);

    /**
     * 搜索课程
     */
    List<CourseResponse> searchCourses(String keyword);

    /**
     * 更新课程
     */
    CourseResponse updateCourse(Long courseId, CourseCreateRequest request, Long userId);

    /**
     * 发布课程
     */
    CourseResponse publishCourse(Long courseId, Long userId);

    /**
     * 下架课程
     */
    CourseResponse unpublishCourse(Long courseId, Long userId);

    /**
     * 删除课程
     */
    void deleteCourse(Long courseId, Long userId);

    /**
     * 获取课程统计信息
     */
    Map<String, Object> getCourseStatistics();

    /**
     * 获取用户课程统计
     */
    Map<String, Object> getUserCourseStatistics(Long userId);

    /**
     * 获取热门课程
     */
    List<CourseResponse> getPopularCourses(Integer limit);

    /**
     * 获取最新课程
     */
    List<CourseResponse> getLatestCourses(Integer limit);

    /**
     * 更新章节数量
     */
    void updateChapterCount(Long courseId, Integer chapterCount);

    /**
     * 增加学生数量
     */
    void incrementStudentCount(Long courseId);
} 