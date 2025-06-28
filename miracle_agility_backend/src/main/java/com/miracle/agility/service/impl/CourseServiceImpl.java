package com.miracle.agility.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.miracle.agility.dto.CourseCreateRequest;
import com.miracle.agility.dto.CourseResponse;
import com.miracle.agility.entity.Course;
import com.miracle.agility.entity.User;
import com.miracle.agility.entity.UserCourse;
import com.miracle.agility.mapper.CourseMapper;
import com.miracle.agility.mapper.UserCourseMapper;
import com.miracle.agility.service.CourseService;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 课程服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseMapper courseMapper;
    private final UserCourseMapper userCourseMapper;
    private final UserService userService;

    @Override
    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request, Long userId) {
        log.info("创建课程: title={}, userId={}", request.getTitle(), userId);

        Course course = new Course();
        BeanUtils.copyProperties(request, course);
        
        // 处理JSON字段：将逗号分隔的字符串转换为JSON数组
        course.setTags(convertToJsonArray(request.getTags()));
        course.setRequirements(convertToJsonArray(request.getRequirements()));
        course.setObjectives(convertToJsonArray(request.getObjectives()));
        
        // 设置默认值
        course.setCreatedBy(userId);
        course.setTeacherId(userId);
        course.setStatus("draft");
        course.setStudentCount(0);
        course.setChapterCount(0);
        course.setSortOrder(0);
        
        if (course.getIsFree() == null) {
            course.setIsFree(false);
        }

        int result = courseMapper.insert(course);
        if (result <= 0) {
            throw new RuntimeException("创建课程失败");
        }

        log.info("课程创建成功: courseId={}", course.getId());
        return convertToResponse(course);
    }

    @Override
    public CourseResponse getCourseById(Long courseId) {
        log.info("获取课程详情: courseId={}", courseId);

        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        return convertToResponse(course);
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        log.info("获取所有课程列表");

        // 使用MyBatis-Plus自带的方法，应该自动处理软删除
        LambdaQueryWrapper<Course> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByAsc(Course::getSortOrder)
                   .orderByDesc(Course::getCreatedAt);

        List<Course> courses = courseMapper.selectList(queryWrapper);
        log.info("查询到课程数量: {}", courses.size());
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getCoursesByStatus(String status) {
        log.info("根据状态获取课程列表: status={}", status);

        List<Course> courses = courseMapper.selectByStatus(status);
        log.info("查询到课程数量: {}", courses.size());
        
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getCoursesByCategory(String category) {
        log.info("根据分类获取课程列表: category={}", category);

        List<Course> courses = courseMapper.selectByCategory(category);
        log.info("查询到课程数量: {}", courses.size());
        
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getUserCourses(Long userId) {
        log.info("获取用户课程列表: userId={}", userId);

        // 获取用户信息来判断角色
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        boolean isAdmin = user.isAdmin();
        log.info("用户角色检查: userId={}, role={}, isAdmin={}", userId, user.getRole(), isAdmin);
        
        if (isAdmin) {
            log.info("管理员用户，返回所有已发布课程");
            // 管理员：返回所有已发布的课程
            return getCoursesByStatus("published");
        } else {
            log.info("普通用户，返回注册的已发布课程");
            // 普通用户：返回注册的已发布课程
            List<UserCourse> userCourses = userCourseMapper.getUserCoursesWithDetails(userId);
            log.info("查询到用户注册的课程数量: {}", userCourses.size());
            
            return userCourses.stream()
                    .filter(userCourse -> {
                        if (userCourse.getCourseId() != null) {
                            Course course = courseMapper.selectById(userCourse.getCourseId());
                            boolean isPublished = course != null && "published".equals(course.getStatus());
                            log.debug("课程ID: {}, 状态: {}, 是否已发布: {}", 
                                    userCourse.getCourseId(), 
                                    course != null ? course.getStatus() : "null", 
                                    isPublished);
                            return isPublished;
                        }
                        return false;
                    })
                    .map(userCourse -> {
                        Course course = courseMapper.selectById(userCourse.getCourseId());
                        CourseResponse response = convertToResponse(course);
                        log.debug("返回已发布课程: {}", response.getTitle());
                        return response;
                    })
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<CourseResponse> searchCourses(String keyword) {
        log.info("搜索课程: keyword={}", keyword);

        if (!StringUtils.hasText(keyword)) {
            return getAllCourses();
        }

        List<Course> courses = courseMapper.searchCourses(keyword);
        log.info("搜索到课程数量: {}", courses.size());
        
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseCreateRequest request, Long userId) {
        log.info("更新课程: courseId={}, userId={}", courseId, userId);

        Course existingCourse = courseMapper.selectById(courseId);
        if (existingCourse == null) {
            throw new RuntimeException("课程不存在");
        }

        // 更新课程信息
        BeanUtils.copyProperties(request, existingCourse);
        
        // 处理JSON字段：将逗号分隔的字符串转换为JSON数组
        existingCourse.setTags(convertToJsonArray(request.getTags()));
        existingCourse.setRequirements(convertToJsonArray(request.getRequirements()));
        existingCourse.setObjectives(convertToJsonArray(request.getObjectives()));
        
        existingCourse.setUpdatedAt(LocalDateTime.now());

        int result = courseMapper.updateById(existingCourse);
        if (result <= 0) {
            throw new RuntimeException("更新课程失败");
        }

        log.info("课程更新成功: courseId={}", courseId);
        return convertToResponse(existingCourse);
    }

    @Override
    @Transactional
    public CourseResponse publishCourse(Long courseId, Long userId) {
        log.info("发布课程: courseId={}, userId={}", courseId, userId);

        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        // 更新状态
        LocalDateTime now = LocalDateTime.now();
        int result = courseMapper.updateStatus(courseId, "published", now);
        if (result <= 0) {
            throw new RuntimeException("发布课程失败");
        }

        course.setStatus("published");
        course.setPublishedAt(now);

        log.info("课程发布成功: courseId={}", courseId);
        return convertToResponse(course);
    }

    @Override
    @Transactional
    public CourseResponse unpublishCourse(Long courseId, Long userId) {
        log.info("下架课程: courseId={}, userId={}", courseId, userId);

        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        // 更新状态
        int result = courseMapper.updateStatus(courseId, "draft", null);
        if (result <= 0) {
            throw new RuntimeException("下架课程失败");
        }

        course.setStatus("draft");
        course.setPublishedAt(null);

        log.info("课程下架成功: courseId={}", courseId);
        return convertToResponse(course);
    }


    @Override
    @Transactional
    public void deleteCourse(Long courseId, Long userId) {
        log.info("删除课程: courseId={}, userId={}", courseId, userId);

        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        // 物理删除
        int result = courseMapper.deleteById(courseId);
        if (result <= 0) {
            throw new RuntimeException("删除课程失败");
        }

        log.info("课程删除成功: courseId={}", courseId);
    }

    @Override
    public Map<String, Object> getCourseStatistics() {
        log.info("获取课程统计信息");
        return courseMapper.getStatistics();
    }

    @Override
    public Map<String, Object> getUserCourseStatistics(Long userId) {
        log.info("获取用户课程统计: userId={}", userId);
        return courseMapper.getUserStatistics(userId);
    }

    @Override
    public List<CourseResponse> getPopularCourses(Integer limit) {
        log.info("获取热门课程: limit={}", limit);

        if (limit == null || limit <= 0) {
            limit = 10;
        }

        List<Course> courses = courseMapper.getPopularCourses(limit);
        log.info("查询到热门课程数量: {}", courses.size());
        
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    public List<CourseResponse> getLatestCourses(Integer limit) {
        log.info("获取最新课程: limit={}", limit);

        if (limit == null || limit <= 0) {
            limit = 10;
        }

        List<Course> courses = courseMapper.getLatestCourses(limit);
        log.info("查询到最新课程数量: {}", courses.size());
        
        return courses.stream()
                     .map(this::convertToResponse)
                     .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateChapterCount(Long courseId, Integer chapterCount) {
        log.info("更新课程章节数量: courseId={}, chapterCount={}", courseId, chapterCount);

        int result = courseMapper.updateChapterCount(courseId, chapterCount);
        if (result <= 0) {
            log.warn("更新章节数量失败: courseId={}", courseId);
        }
    }

    @Override
    @Transactional
    public void incrementStudentCount(Long courseId) {
        log.info("增加课程学生数量: courseId={}", courseId);

        int result = courseMapper.incrementStudentCount(courseId);
        if (result <= 0) {
            log.warn("增加学生数量失败: courseId={}", courseId);
        }
    }

    /**
     * 转换为响应DTO
     */
    private CourseResponse convertToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        BeanUtils.copyProperties(course, response);
        
        // 设置显示名称
        response.setLevelDisplayName(course.getLevelDisplayName());
        response.setStatusDisplayName(course.getStatusDisplayName());
        response.setFormattedPrice(course.getFormattedPrice());
        
        return response;
    }

    /**
     * 将逗号分隔的字符串转换为JSON数组格式
     * @param csvString 逗号分隔的字符串，如："tag1,tag2,tag3"
     * @return JSON数组字符串，如：["tag1","tag2","tag3"]
     */
    private String convertToJsonArray(String csvString) {
        if (csvString == null || csvString.trim().isEmpty()) {
            return "[]";
        }
        
        try {
            // 分割字符串并去除空白
            String[] items = csvString.split(",");
            StringBuilder jsonArray = new StringBuilder("[");
            
            for (int i = 0; i < items.length; i++) {
                String item = items[i].trim();
                if (!item.isEmpty()) {
                    if (jsonArray.length() > 1) {
                        jsonArray.append(",");
                    }
                    // 转义JSON字符串中的特殊字符
                    String escapedItem = item.replace("\"", "\\\"")
                                            .replace("\\", "\\\\")
                                            .replace("\n", "\\n")
                                            .replace("\r", "\\r")
                                            .replace("\t", "\\t");
                    jsonArray.append("\"").append(escapedItem).append("\"");
                }
            }
            
            jsonArray.append("]");
            return jsonArray.toString();
        } catch (Exception e) {
            log.error("转换JSON数组失败: {}", e.getMessage());
            return "[]";
        }
    }
} 