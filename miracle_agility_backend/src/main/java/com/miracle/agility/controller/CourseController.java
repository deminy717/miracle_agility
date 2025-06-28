package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.CourseCreateRequest;
import com.miracle.agility.dto.CourseResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.service.CourseService;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 课程管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Validated
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;

    /**
     * 创建课程
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("创建课程请求: title={}", request.getTitle());
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            // 检查管理员权限
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限创建课程"));
            }
            
            CourseResponse response = courseService.createCourse(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课程创建成功", response));
            
        } catch (AuthenticationException authenticationException) {
           throw authenticationException;
        } catch (Exception e) {
            log.error("创建课程失败: {}", e.getMessage(), e);
            
            // 检查是否为认证/权限相关异常
            String errorMessage = e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("创建课程失败: " + errorMessage));
        }
    }

    /**
     * 获取课程详情
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable Long courseId) {
        
        log.info("获取课程详情: courseId={}", courseId);
        
        try {
            CourseResponse response = courseService.getCourseById(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课程详情失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程详情失败: " + e.getMessage()));
        }
    }

    /**
     * 获取所有课程列表（管理员后台接口）
     */
    @GetMapping("/admin/list")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAdminCourseList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            HttpServletRequest httpRequest) {
        
        log.info("管理员获取课程列表: status={}, category={}, keyword={}", status, category, keyword);
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            log.info("当前用户信息: userId={}, role={}", currentUser.getId(), currentUser.getRole());
            
            boolean adminCheck = isAdmin(currentUser);
            log.info("管理员权限检查结果: {}", adminCheck);
            
            if (!adminCheck) {
                log.warn("用户无管理员权限: userId={}, role={}", currentUser.getId(), currentUser.getRole());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限访问后台管理功能"));
            }
            
            List<CourseResponse> responses;
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                responses = courseService.searchCourses(keyword.trim());
            } else if (status != null && !status.trim().isEmpty()) {
                responses = courseService.getCoursesByStatus(status);
            } else if (category != null && !category.trim().isEmpty()) {
                responses = courseService.getCoursesByCategory(category);
            } else {
                responses = courseService.getAllCourses();
            }
            
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("管理员获取课程列表失败: error={}", e.getMessage());
            
            // 检查是否为认证/权限相关异常
            String errorMessage = e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程列表失败: " + errorMessage));
        }
    }

    /**
     * 获取公开课程列表（前台用户接口）
     * 只返回已发布的课程
     */
    @GetMapping("/public/list")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPublicCourseList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        
        log.info("获取公开课程列表: category={}, keyword={}", category, keyword);
        
        try {
            List<CourseResponse> responses;
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 搜索时只返回已发布的课程
                responses = courseService.searchCourses(keyword.trim())
                    .stream()
                    .filter(course -> "published".equals(course.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
            } else if (category != null && !category.trim().isEmpty()) {
                responses = courseService.getCoursesByCategory(category)
                    .stream()
                    .filter(course -> "published".equals(course.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                // 默认只返回已发布的课程
                responses = courseService.getCoursesByStatus("published");
            }
            
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取公开课程列表失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取我的课程列表
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyCourses(HttpServletRequest httpRequest) {
        
        log.info("获取我的课程列表");
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            List<CourseResponse> responses = courseService.getUserCourses(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取我的课程列表失败: error={}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("获取我的课程列表失败: " + e.getMessage()));
        }
    }

    /**
     * 更新课程
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("更新课程请求: courseId={}", courseId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            // 检查权限：管理员或课程创建者
            if (!canOperateCourse(currentUser, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限操作此课程"));
            }
            
            CourseResponse response = courseService.updateCourse(courseId, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课程更新成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("更新课程失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("更新课程失败: " + e.getMessage()));
        }
    }

    /**
     * 发布课程
     */
    @PostMapping("/{courseId}/publish")
    public ResponseEntity<ApiResponse<CourseResponse>> publishCourse(
            @PathVariable Long courseId,
            HttpServletRequest httpRequest) {
        
        log.info("发布课程: courseId={}", courseId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            // 检查权限：管理员或课程创建者
            if (!canOperateCourse(currentUser, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限操作此课程"));
            }
            
            CourseResponse response = courseService.publishCourse(courseId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课程发布成功", response));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("发布课程失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("发布课程失败: " + e.getMessage()));
        }
    }

    /**
     * 下架课程
     */
    @PostMapping("/{courseId}/unpublish")
    public ResponseEntity<ApiResponse<CourseResponse>> unpublishCourse(
            @PathVariable Long courseId,
            HttpServletRequest httpRequest) {
        
        log.info("下架课程: courseId={}", courseId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            // 检查权限：管理员或课程创建者
            if (!canOperateCourse(currentUser, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限操作此课程"));
            }
            
            CourseResponse response = courseService.unpublishCourse(courseId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课程下架成功", response));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("下架课程失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("下架课程失败: " + e.getMessage()));
        }
    }


    /**
     * 删除课程
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(
            @PathVariable Long courseId,
            HttpServletRequest httpRequest) {
        
        log.info("删除课程: courseId={}", courseId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            // 检查权限：管理员或课程创建者
            if (!canOperateCourse(currentUser, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.forbidden("无权限操作此课程"));
            }
            
            courseService.deleteCourse(courseId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课程删除成功", "deleted"));
            
        }  catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("删除课程失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.ok(ApiResponse.error("删除课程失败: " + e.getMessage()));
        }
    }

    /**
     * 获取课程统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourseStatistics() {
        
        log.info("获取课程统计信息");
        
        try {
            Map<String, Object> statistics = courseService.getCourseStatistics();
            return ResponseEntity.ok(ApiResponse.success("获取成功", statistics));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课程统计信息失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程统计信息失败: " + e.getMessage()));
        }
    }

    /**
     * 获取我的课程统计
     */
    @GetMapping("/my/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyCourseStatistics(HttpServletRequest httpRequest) {
        
        log.info("获取我的课程统计");
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            Map<String, Object> statistics = courseService.getUserCourseStatistics(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("获取成功", statistics));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取我的课程统计失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取我的课程统计失败: " + e.getMessage()));
        }
    }

    /**
     * 获取热门课程
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getPopularCourses(
            @RequestParam(defaultValue = "10") Integer limit) {
        
        log.info("获取热门课程: limit={}", limit);
        
        try {
            List<CourseResponse> responses = courseService.getPopularCourses(limit);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (Exception e) {
            log.error("获取热门课程失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取热门课程失败: " + e.getMessage()));
        }
    }

    /**
     * 获取最新课程
     */
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getLatestCourses(
            @RequestParam(defaultValue = "10") Integer limit) {
        
        log.info("获取最新课程: limit={}", limit);
        
        try {
            List<CourseResponse> responses = courseService.getLatestCourses(limit);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (Exception e) {
            log.error("获取最新课程失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取最新课程失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户
     */
    private User getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("未登录或登录已过期");
        }
        
        String accessToken = authHeader.substring(7);
        try {
            return userService.getUserByAccessToken(accessToken);
        } catch (Throwable throwable) {
            throw new AuthenticationException("获取用户信息失败,请重新登录");
        }
    }

    /**
     * 检查是否是管理员
     */
    private boolean isAdmin(User user) {
        // 使用User实体的isAdmin方法进行权限检查
        try {
            boolean isAdmin = user.isAdmin();
            log.debug("用户权限检查: userId={}, role={}, isAdmin={}", user.getId(), user.getRole(), isAdmin);
            return isAdmin;
        } catch (Exception e) {
            log.warn("检查管理员权限时出错: userId={}, error={}", user.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * 检查是否可以操作课程：管理员或课程创建者
     */
    private boolean canOperateCourse(User currentUser, Long courseId) {
        // 检查是否是管理员
        if (isAdmin(currentUser)) {
            return true;
        }
        
        // 检查是否是课程创建者
        try {
            CourseResponse course = courseService.getCourseById(courseId);
            return course.getCreatedBy().equals(currentUser.getId());
        } catch (Exception e) {
            log.warn("检查课程权限时出错: courseId={}, userId={}, error={}", 
                     courseId, currentUser.getId(), e.getMessage());
            return false;
        }
    }
} 