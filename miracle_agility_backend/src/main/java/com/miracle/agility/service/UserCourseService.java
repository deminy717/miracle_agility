package com.miracle.agility.service;

import com.miracle.agility.entity.UserCourse;

import java.util.List;

/**
 * 用户课程服务接口
 */
public interface UserCourseService {

    /**
     * 用户注册课程
     */
    UserCourse registerCourse(Long userId, Long courseId, String registrationType, Long sourceCodeId);

    /**
     * 通过授权码注册课程
     */
    UserCourse registerCourseByCode(Long userId, String accessCode);

    /**
     * 获取用户的所有课程
     */
    List<UserCourse> getUserCourses(Long userId);

    /**
     * 获取课程的所有学生
     */
    List<UserCourse> getCourseStudents(Long courseId);

    /**
     * 获取所有用户课程关联信息（管理员）
     */
    List<UserCourse> getAllUserCourses();

    /**
     * 检查用户是否已注册课程
     */
    boolean isUserRegisteredForCourse(Long userId, Long courseId);

    /**
     * 更新学习进度
     */
    void updateProgress(Long userId, Long courseId, int progress);

    /**
     * 更新学习时间
     */
    void updateStudyTime(Long userId, Long courseId, int minutes);

    /**
     * 取消课程注册
     */
    void cancelCourseRegistration(Long userId, Long courseId);

    /**
     * 对课程进行评价
     */
    void rateCourse(Long userId, Long courseId, int rating, String review);
} 