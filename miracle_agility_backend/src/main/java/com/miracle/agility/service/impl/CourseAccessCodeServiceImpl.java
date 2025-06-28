package com.miracle.agility.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.miracle.agility.entity.Course;
import com.miracle.agility.entity.CourseAccessCode;
import com.miracle.agility.mapper.CourseAccessCodeMapper;
import com.miracle.agility.mapper.CourseMapper;
import com.miracle.agility.service.CourseAccessCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 课程授权码服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseAccessCodeServiceImpl implements CourseAccessCodeService {

    private final CourseAccessCodeMapper courseAccessCodeMapper;
    private final CourseMapper courseMapper;
    
    private static final String CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public CourseAccessCode generateAccessCode(Long courseId, Long createdBy, String description,
                                             LocalDateTime validFrom, LocalDateTime validUntil, Integer usageLimit) {
        // 检查课程是否存在
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        // 生成唯一授权码
        String code = generateUniqueCode();

        // 创建授权码记录
        CourseAccessCode accessCode = new CourseAccessCode()
                .setCode(code)
                .setCourseId(courseId)
                .setCreatedBy(createdBy)
                .setDescription(description)
                .setValidFrom(validFrom)
                .setValidUntil(validUntil)
                .setUsageLimit(usageLimit);

        int result = courseAccessCodeMapper.insert(accessCode);
        if (result > 0) {
            log.info("为课程{}生成授权码: {}, 创建者: {}", courseId, code, createdBy);
            return accessCode;
        } else {
            throw new RuntimeException("生成授权码失败");
        }
    }

    @Override
    @Transactional
    public CourseAccessCode validateAndUseAccessCode(String code, Long userId) {
        // 查找授权码
        CourseAccessCode accessCode = courseAccessCodeMapper.findByCodeWithCourse(code);
        if (accessCode == null) {
            throw new RuntimeException("授权码不存在");
        }

        // 检查授权码是否可用
        if (!accessCode.isUsable()) {
            if (accessCode.isExpired()) {
                throw new RuntimeException("授权码已过期");
            }
            if ("used".equals(accessCode.getStatus())) {
                throw new RuntimeException("授权码已使用");
            }
            if ("disabled".equals(accessCode.getStatus())) {
                throw new RuntimeException("授权码已被禁用");
            }
            throw new RuntimeException("授权码不可用");
        }

        // 检查课程状态
        Course course = courseMapper.selectById(accessCode.getCourseId());
        if (course == null || !"published".equals(course.getStatus())) {
            throw new RuntimeException("关联的课程不可用");
        }

        // 标记授权码为已使用
        accessCode.markAsUsed(userId);
        courseAccessCodeMapper.updateById(accessCode);

        log.info("用户{}成功使用授权码{}: 注册课程{}", userId, code, accessCode.getCourseId());
        return accessCode;
    }

    @Override
    public CourseAccessCode getByCode(String code) {
        QueryWrapper<CourseAccessCode> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("code", code);
        return courseAccessCodeMapper.selectOne(queryWrapper);
    }

    @Override
    public List<CourseAccessCode> getCourseAccessCodes(Long courseId) {
        return courseAccessCodeMapper.getCourseAccessCodes(courseId);
    }

    @Override
    public List<CourseAccessCode> getAllAccessCodes() {
        return courseAccessCodeMapper.getAllAccessCodesWithDetails();
    }

    @Override
    public List<CourseAccessCode> getAccessCodesByCreator(Long createdBy) {
        return courseAccessCodeMapper.getAccessCodesByCreator(createdBy);
    }

    @Override
    @Transactional
    public void disableAccessCode(Long codeId) {
        UpdateWrapper<CourseAccessCode> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", codeId).set("status", "disabled");
        
        int result = courseAccessCodeMapper.update(null, updateWrapper);
        if (result > 0) {
            log.info("禁用授权码: {}", codeId);
        }
    }

    @Override
    @Transactional
    public void enableAccessCode(Long codeId) {
        UpdateWrapper<CourseAccessCode> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", codeId).set("status", "active");
        
        int result = courseAccessCodeMapper.update(null, updateWrapper);
        if (result > 0) {
            log.info("启用授权码: {}", codeId);
        }
    }

    @Override
    @Transactional
    public void deleteAccessCode(Long codeId) {
        int result = courseAccessCodeMapper.deleteById(codeId);
        if (result > 0) {
            log.info("删除授权码: {}", codeId);
        }
    }

    @Override
    public String generateUniqueCode() {
        String code;
        int attempts = 0;
        
        do {
            code = generateRandomCode();
            attempts++;
            
            if (attempts > 100) {
                throw new RuntimeException("生成唯一授权码失败，请稍后重试");
            }
        } while (courseAccessCodeMapper.countByCode(code) > 0);
        
        return code;
    }

    /**
     * 生成随机授权码
     */
    private String generateRandomCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        return code.toString();
    }
} 