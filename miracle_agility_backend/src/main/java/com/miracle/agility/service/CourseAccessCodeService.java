package com.miracle.agility.service;

import com.miracle.agility.entity.CourseAccessCode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 课程授权码服务接口
 */
public interface CourseAccessCodeService {

    /**
     * 生成授权码
     */
    CourseAccessCode generateAccessCode(Long courseId, Long createdBy, String description, 
                                      LocalDateTime validFrom, LocalDateTime validUntil, Integer usageLimit);

    /**
     * 验证并使用授权码
     */
    CourseAccessCode validateAndUseAccessCode(String code, Long userId);

    /**
     * 根据授权码查询
     */
    CourseAccessCode getByCode(String code);

    /**
     * 获取课程的所有授权码
     */
    List<CourseAccessCode> getCourseAccessCodes(Long courseId);

    /**
     * 获取所有授权码（管理员）
     */
    List<CourseAccessCode> getAllAccessCodes();

    /**
     * 获取用户创建的授权码
     */
    List<CourseAccessCode> getAccessCodesByCreator(Long createdBy);

    /**
     * 禁用授权码
     */
    void disableAccessCode(Long codeId);

    /**
     * 启用授权码
     */
    void enableAccessCode(Long codeId);

    /**
     * 删除授权码
     */
    void deleteAccessCode(Long codeId);

    /**
     * 生成唯一的授权码字符串
     */
    String generateUniqueCode();
} 