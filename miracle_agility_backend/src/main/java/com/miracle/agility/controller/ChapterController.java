package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.ChapterCreateRequest;
import com.miracle.agility.dto.ChapterResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.service.ChapterService;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 章节管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/chapters")
@RequiredArgsConstructor
@Validated
public class ChapterController {

    private final ChapterService chapterService;
    private final UserService userService;

    /**
     * 创建章节
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(
            @Valid @RequestBody ChapterCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("创建章节请求: courseId={}, title={}", request.getCourseId(), request.getTitle());
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            ChapterResponse response = chapterService.createChapter(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节创建成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("创建章节失败: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("创建章节失败: " + e.getMessage()));
        }
    }

    /**
     * 获取章节详情
     */
    @GetMapping("/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapter(@PathVariable Long chapterId) {
        
        log.info("获取章节详情: chapterId={}", chapterId);
        
        try {
            ChapterResponse response = chapterService.getChapterById(chapterId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取章节详情失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取章节详情失败: " + e.getMessage()));
        }
    }

    /**
     * 根据课程ID获取章节列表
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByCourse(@PathVariable Long courseId) {
        
        log.info("获取课程章节列表: courseId={}", courseId);
        
        try {
            List<ChapterResponse> responses = chapterService.getChaptersByCourseId(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取课程章节列表失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取课程章节列表失败: " + e.getMessage()));
        }
    }

    /**
     * 根据课程ID获取已发布的章节列表
     */
    @GetMapping("/course/{courseId}/published")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getPublishedChaptersByCourse(@PathVariable Long courseId) {
        
        log.info("获取已发布章节列表: courseId={}", courseId);
        
        try {
            List<ChapterResponse> responses = chapterService.getPublishedChaptersByCourseId(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取已发布章节列表失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取已发布章节列表失败: " + e.getMessage()));
        }
    }

    /**
     * 更新章节
     */
    @PutMapping("/{chapterId}")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("更新章节请求: chapterId={}, title={}", chapterId, request.getTitle());
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            ChapterResponse response = chapterService.updateChapter(chapterId, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节更新成功", response));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("更新章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("更新章节失败: " + e.getMessage()));
        }
    }

    /**
     * 删除章节
     */
    @DeleteMapping("/{chapterId}")
    public ResponseEntity<ApiResponse<String>> deleteChapter(
            @PathVariable Long chapterId,
            HttpServletRequest httpRequest) {
        
        log.info("删除章节请求: chapterId={}", chapterId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            chapterService.deleteChapter(chapterId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节删除成功", "deleted"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("删除章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("删除章节失败: " + e.getMessage()));
        }
    }

    /**
     * 发布章节
     */
    @PostMapping("/{chapterId}/publish")
    public ResponseEntity<ApiResponse<String>> publishChapter(
            @PathVariable Long chapterId,
            HttpServletRequest httpRequest) {
        
        log.info("发布章节请求: chapterId={}", chapterId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            chapterService.publishChapter(chapterId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节发布成功", "published"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("发布章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("发布章节失败: " + e.getMessage()));
        }
    }

    /**
     * 下架章节（转为草稿状态）
     */
    @PostMapping("/{chapterId}/unpublish")
    public ResponseEntity<ApiResponse<String>> unpublishChapter(
            @PathVariable Long chapterId,
            HttpServletRequest httpRequest) {
        
        log.info("下架章节请求: chapterId={}", chapterId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            chapterService.unpublishChapter(chapterId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节已下架", "unpublished"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("下架章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("下架章节失败: " + e.getMessage()));
        }
    }

    /**
     * 归档章节
     */
    @PostMapping("/{chapterId}/archive")
    public ResponseEntity<ApiResponse<String>> archiveChapter(
            @PathVariable Long chapterId,
            HttpServletRequest httpRequest) {
        
        log.info("归档章节请求: chapterId={}", chapterId);
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            chapterService.archiveChapter(chapterId, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("章节归档成功", "archived"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("归档章节失败: chapterId={}, error={}", chapterId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("归档章节失败: " + e.getMessage()));
        }
    }

    /**
     * 更新章节排序
     */
    @PostMapping("/course/{courseId}/sort")
    public ResponseEntity<ApiResponse<String>> updateChapterSort(
            @PathVariable Long courseId,
            @RequestBody Map<String, List<Long>> request,
            HttpServletRequest httpRequest) {
        
        log.info("更新章节排序: courseId={}", courseId);
        
        try {
            List<Long> chapterIds = request.get("chapterIds");
            if (chapterIds == null || chapterIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("章节ID列表不能为空"));
            }
            
            chapterService.updateChapterSort(courseId, chapterIds);
            return ResponseEntity.ok(ApiResponse.success("章节排序更新成功", "sorted"));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("更新章节排序失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("更新章节排序失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户创建的章节列表
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getMyChapters(HttpServletRequest httpRequest) {
        
        log.info("获取我创建的章节列表");
        
        try {
            User currentUser = getCurrentUser(httpRequest);
            
            List<ChapterResponse> responses = chapterService.getChaptersByCreatedBy(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("获取成功", responses));
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("获取我创建的章节列表失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("获取我创建的章节列表失败: " + e.getMessage()));
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