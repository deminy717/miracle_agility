package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.LessonCreateRequest;
import com.miracle.agility.dto.LessonResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.service.LessonService;
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

/**
 * 课时管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
@Validated
public class LessonController {

    private final LessonService lessonService;
    private final UserService userService;

    /**
     * 创建课时
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(
            @Valid @RequestBody LessonCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("创建课时请求: chapterId={}, title={}", request.getChapterId(), request.getTitle());
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            LessonResponse response = lessonService.createLesson(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课时创建成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("创建课时失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("创建课时失败: " + e.getMessage()));
        }
    }

    /**
     * 获取课时详情
     */
    @GetMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long lessonId) {
        
        log.info("获取课时详情: lessonId={}", lessonId);
        
        try {
            LessonResponse response = lessonService.getLessonById(lessonId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课时详情失败: lessonId={}, error={}", lessonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课时详情失败: " + e.getMessage()));
        }
    }

    /**
     * 根据章节ID获取课时列表
     */
    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByChapter(@PathVariable Long chapterId) {
        
        log.info("获取章节课时列表: chapterId={}", chapterId);
        
        try {
            List<LessonResponse> responses = lessonService.getLessonsByChapterId(chapterId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取章节课时列表失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取章节课时列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据课程ID获取课时列表
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByCourse(@PathVariable Long courseId) {
        
        log.info("获取课程课时列表: courseId={}", courseId);
        
        try {
            List<LessonResponse> responses = lessonService.getLessonsByCourseId(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课程课时列表失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程课时列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据章节ID获取已发布的课时列表
     */
    @GetMapping("/chapter/{chapterId}/published")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getPublishedLessonsByChapter(@PathVariable Long chapterId) {
        
        log.info("获取已发布课时列表: chapterId={}", chapterId);
        
        try {
            List<LessonResponse> responses = lessonService.getPublishedLessonsByChapterId(chapterId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取已发布课时列表失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取已发布课时列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据课程ID获取已发布的课时列表
     */
    @GetMapping("/course/{courseId}/published")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getPublishedLessonsByCourse(@PathVariable Long courseId) {
        
        log.info("获取课程已发布课时列表: courseId={}", courseId);
        
        try {
            List<LessonResponse> responses = lessonService.getPublishedLessonsByCourseId(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课程已发布课时列表失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程已发布课时列表失败: " + e.getMessage()));
        }
    }

    /**
     * 更新课时
     */
    @PutMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("更新课时请求: lessonId={}, title={}", lessonId, request.getTitle());
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            LessonResponse response = lessonService.updateLesson(lessonId, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课时更新成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("更新课时失败: lessonId={}, error={}", lessonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("更新课时失败: " + e.getMessage()));
        }
    }

    /**
     * 删除课时
     */
    @DeleteMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<String>> deleteLesson(
            @PathVariable Long lessonId,
            HttpServletRequest httpRequest) {
        
        log.info("删除课时请求: lessonId={}", lessonId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            lessonService.deleteLesson(lessonId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课时删除成功", "deleted"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("删除课时失败: lessonId={}, error={}", lessonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("删除课时失败: " + e.getMessage()));
        }
    }

    /**
     * 发布课时
     */
    @PostMapping("/{lessonId}/publish")
    public ResponseEntity<ApiResponse<String>> publishLesson(
            @PathVariable Long lessonId,
            HttpServletRequest httpRequest) {
        
        log.info("发布课时请求: lessonId={}", lessonId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            lessonService.publishLesson(lessonId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课时发布成功", "published"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("发布课时失败: lessonId={}, error={}", lessonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("发布课时失败: " + e.getMessage()));
        }
    }

    /**
     * 下架课时（转为草稿状态）
     */
    @PostMapping("/{lessonId}/unpublish")
    public ResponseEntity<ApiResponse<String>> unpublishLesson(
            @PathVariable Long lessonId,
            HttpServletRequest httpRequest) {
        
        log.info("下架课时请求: lessonId={}", lessonId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            lessonService.unpublishLesson(lessonId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("课时已下架", "unpublished"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("下架课时失败: lessonId={}, error={}", lessonId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("下架课时失败: " + e.getMessage()));
        }
    }


    /**
     * 从请求中获取当前用户信息
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
} 