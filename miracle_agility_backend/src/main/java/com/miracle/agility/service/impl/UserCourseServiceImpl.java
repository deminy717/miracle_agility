package com.miracle.agility.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.miracle.agility.entity.Course;
import com.miracle.agility.entity.CourseAccessCode;
import com.miracle.agility.entity.UserCourse;
import com.miracle.agility.mapper.CourseMapper;
import com.miracle.agility.mapper.UserCourseMapper;
import com.miracle.agility.service.CourseAccessCodeService;
import com.miracle.agility.service.UserCourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户课程服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserCourseServiceImpl implements UserCourseService {

    private final UserCourseMapper userCourseMapper;
    private final CourseMapper courseMapper;
    private final CourseAccessCodeService courseAccessCodeService;

    @Override
    @Transactional
    public UserCourse registerCourse(Long userId, Long courseId, String registrationType, Long sourceCodeId) {
        // 检查用户是否已注册该课程
        if (isUserRegisteredForCourse(userId, courseId)) {
            throw new RuntimeException("用户已经注册了该课程");
        }

        // 检查课程是否存在且可用
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        if (!"published".equals(course.getStatus())) {
            throw new RuntimeException("课程未发布，无法注册");
        }

        // 创建用户课程关联记录
        UserCourse userCourse = new UserCourse()
                .setUserId(userId)
                .setCourseId(courseId)
                .setRegistrationType(registrationType)
                .setSourceCodeId(sourceCodeId);

        int result = userCourseMapper.insert(userCourse);
        if (result > 0) {
            // 更新课程学生数量
            course.incrementStudentCount();
            courseMapper.updateById(course);
            
            log.info("用户{}成功注册课程{}, 注册方式: {}", userId, courseId, registrationType);
            return userCourse;
        } else {
            throw new RuntimeException("注册课程失败");
        }
    }

    @Override
    @Transactional
    public UserCourse registerCourseByCode(Long userId, String accessCode) {
        log.info("用户{}尝试通过授权码{}注册课程", userId, accessCode);
        
        // 验证并使用授权码
        CourseAccessCode validCode = courseAccessCodeService.validateAndUseAccessCode(accessCode, userId);
        
        // 注册课程
        return registerCourse(userId, validCode.getCourseId(), "code", validCode.getId());
    }

    @Override
    public List<UserCourse> getUserCourses(Long userId) {
        return userCourseMapper.getUserCoursesWithDetails(userId);
    }

    @Override
    public List<UserCourse> getCourseStudents(Long courseId) {
        return userCourseMapper.getCourseStudentsWithDetails(courseId);
    }

    @Override
    public List<UserCourse> getAllUserCourses() {
        return userCourseMapper.getAllUserCoursesWithDetails();
    }

    @Override
    public boolean isUserRegisteredForCourse(Long userId, Long courseId) {
        return userCourseMapper.countUserCourse(userId, courseId) > 0;
    }

    @Override
    @Transactional
    public void updateProgress(Long userId, Long courseId, int progress) {
        UpdateWrapper<UserCourse> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("user_id", userId)
                    .eq("course_id", courseId)
                    .eq("status", "active")
                    .set("progress", Math.max(0, Math.min(100, progress)))
                    .set("last_study_time", LocalDateTime.now());

        // 如果进度达到100%，标记为完成
        if (progress >= 100) {
            updateWrapper.set("is_completed", true)
                        .set("completed_at", LocalDateTime.now());
        }

        int result = userCourseMapper.update(null, updateWrapper);
        if (result > 0) {
            log.info("更新用户{}课程{}学习进度: {}%", userId, courseId, progress);
        }
    }

    @Override
    @Transactional
    public void updateStudyTime(Long userId, Long courseId, int minutes) {
        UserCourse userCourse = getUserCourse(userId, courseId);
        if (userCourse != null) {
            userCourse.addStudyTime(minutes);
            userCourseMapper.updateById(userCourse);
            log.info("更新用户{}课程{}学习时间: +{}分钟", userId, courseId, minutes);
        }
    }

    @Override
    @Transactional
    public void cancelCourseRegistration(Long userId, Long courseId) {
        UpdateWrapper<UserCourse> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("user_id", userId)
                    .eq("course_id", courseId)
                    .set("status", "cancelled");

        int result = userCourseMapper.update(null, updateWrapper);
        if (result > 0) {
            // 减少课程学生数量
            Course course = courseMapper.selectById(courseId);
            if (course != null && course.getStudentCount() > 0) {
                course.setStudentCount(course.getStudentCount() - 1);
                courseMapper.updateById(course);
            }
            
            log.info("用户{}取消课程{}注册", userId, courseId);
        }
    }

    @Override
    @Transactional
    public void rateCourse(Long userId, Long courseId, int rating, String review) {
        UpdateWrapper<UserCourse> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("user_id", userId)
                    .eq("course_id", courseId)
                    .eq("status", "active")
                    .set("rating", Math.max(1, Math.min(5, rating)))
                    .set("review", review);

        int result = userCourseMapper.update(null, updateWrapper);
        if (result > 0) {
            log.info("用户{}对课程{}进行评价: {}分", userId, courseId, rating);
        }
    }

    /**
     * 获取用户课程关联记录
     */
    private UserCourse getUserCourse(Long userId, Long courseId) {
        QueryWrapper<UserCourse> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("course_id", courseId)
                   .eq("status", "active");
        return userCourseMapper.selectOne(queryWrapper);
    }
} 