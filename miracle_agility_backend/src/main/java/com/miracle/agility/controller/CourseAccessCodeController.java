package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.entity.CourseAccessCode;
import com.miracle.agility.entity.User;
import com.miracle.agility.entity.UserCourse;
import com.miracle.agility.service.CourseAccessCodeService;
import com.miracle.agility.service.UserCourseService;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 课程授权码控制器
 */
@Slf4j
@RestController
@RequestMapping("/courses/access-codes")
@RequiredArgsConstructor
public class CourseAccessCodeController {

    private final CourseAccessCodeService courseAccessCodeService;
    private final UserCourseService userCourseService;
    private final UserService userService;

    /**
     * 生成课程授权码（管理员）
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<CourseAccessCode>> generateAccessCode(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        
        log.info("生成课程授权码请求: {}", request);
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限生成授权码"));
            }
            
            Long courseId = Long.valueOf(request.get("courseId").toString());
            String description = (String) request.get("description");
            Integer usageLimit = request.get("usageLimit") != null ? 
                Integer.valueOf(request.get("usageLimit").toString()) : 1;
            
            // 处理有效期
            LocalDateTime validFrom = null;
            LocalDateTime validUntil = null;
            
            if (request.get("validFrom") != null) {
                validFrom = LocalDateTime.parse(request.get("validFrom").toString());
            }
            if (request.get("validUntil") != null) {
                validUntil = LocalDateTime.parse(request.get("validUntil").toString());
            }
            
            CourseAccessCode accessCode = courseAccessCodeService.generateAccessCode(
                courseId, currentUser.getId(), description, validFrom, validUntil, usageLimit
            );
            
            return ResponseEntity.ok(ApiResponse.success("授权码生成成功", accessCode));
            
        } catch (Exception e) {
            log.error("生成授权码失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("生成授权码失败: " + e.getMessage()));
        }
    }

    /**
     * 获取课程的所有授权码（管理员）
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<CourseAccessCode>>> getCourseAccessCodes(
            @PathVariable Long courseId,
            HttpServletRequest httpRequest) {
        
        log.info("获取课程{}的授权码列表", courseId);
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限查看授权码"));
            }
            
            List<CourseAccessCode> accessCodes = courseAccessCodeService.getCourseAccessCodes(courseId);
            return ResponseEntity.ok(ApiResponse.success("获取成功", accessCodes));
            
        } catch (Exception e) {
            log.error("获取课程授权码失败: courseId={}, error={}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取授权码失败: " + e.getMessage()));
        }
    }

    /**
     * 获取所有授权码（管理员）
     */
    @GetMapping("/admin/list")
    public ResponseEntity<ApiResponse<List<CourseAccessCode>>> getAllAccessCodes(HttpServletRequest httpRequest) {
        
        log.info("获取所有授权码列表");
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限查看授权码"));
            }
            
            List<CourseAccessCode> accessCodes = courseAccessCodeService.getAllAccessCodes();
            return ResponseEntity.ok(ApiResponse.success("获取成功", accessCodes));
            
        } catch (Exception e) {
            log.error("获取所有授权码失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("获取授权码失败: " + e.getMessage()));
        }
    }

    /**
     * 兑换授权码注册课程（用户）
     */
    @PostMapping("/redeem")
    public ResponseEntity<ApiResponse<Map<String, Object>>> redeemAccessCode(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        String code = request.get("code");
        log.info("用户兑换授权码: {}", code);
        
        try {
            // 获取当前用户
            User currentUser = getCurrentUser(httpRequest);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
            }
            
            // 通过授权码注册课程
            UserCourse userCourse = userCourseService.registerCourseByCode(currentUser.getId(), code);
            
            Map<String, Object> result = new HashMap(){{
                put("message", "课程注册成功");
                put("courseId", userCourse.getCourseId());
                put("registrationId", userCourse.getId());
            }};

            
            return ResponseEntity.ok(ApiResponse.success("授权码兑换成功", result));
            
        } catch (Exception e) {
            log.error("兑换授权码失败: code={}, error={}", code, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("兑换失败: " + e.getMessage()));
        }
    }

    /**
     * 验证授权码（不使用，仅查询）
     */
    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateAccessCode(@PathVariable String code) {
        
        log.info("验证授权码: {}", code);
        
        try {
            CourseAccessCode accessCode = courseAccessCodeService.getByCode(code);
            
            if (accessCode == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("授权码不存在"));
            }
            
            Map<String, Object> result = new HashMap(){{
                put("code", accessCode.getCode());
                put("courseId", accessCode.getCourseId());
                put("courseTitle", accessCode.getCourse() != null ? accessCode.getCourse().getTitle() : "未知课程");
                put("isUsable", accessCode.isUsable());
                put("status", accessCode.getStatus());
                put("usageLimit", accessCode.getUsageLimit());
                put("usedCount", accessCode.getUsedCount());
                put("validUntil", accessCode.getValidUntil());
            }};
            
            return ResponseEntity.ok(ApiResponse.success("授权码信息", result));
            
        } catch (Exception e) {
            log.error("验证授权码失败: code={}, error={}", code, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("验证失败: " + e.getMessage()));
        }
    }

    /**
     * 禁用授权码（管理员）
     */
    @PutMapping("/{codeId}/disable")
    public ResponseEntity<ApiResponse<String>> disableAccessCode(
            @PathVariable Long codeId,
            HttpServletRequest httpRequest) {
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限操作授权码"));
            }
            
            courseAccessCodeService.disableAccessCode(codeId);
            return ResponseEntity.ok(ApiResponse.success("授权码已禁用", null));
            
        } catch (Exception e) {
            log.error("禁用授权码失败: codeId={}, error={}", codeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("禁用失败: " + e.getMessage()));
        }
    }

    /**
     * 启用授权码（管理员）
     */
    @PutMapping("/{codeId}/enable")
    public ResponseEntity<ApiResponse<String>> enableAccessCode(
            @PathVariable Long codeId,
            HttpServletRequest httpRequest) {
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限操作授权码"));
            }
            
            courseAccessCodeService.enableAccessCode(codeId);
            return ResponseEntity.ok(ApiResponse.success("授权码已启用", null));
            
        } catch (Exception e) {
            log.error("启用授权码失败: codeId={}, error={}", codeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("启用失败: " + e.getMessage()));
        }
    }

    /**
     * 删除授权码（管理员）
     */
    @DeleteMapping("/{codeId}")
    public ResponseEntity<ApiResponse<String>> deleteAccessCode(
            @PathVariable Long codeId,
            HttpServletRequest httpRequest) {
        
        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.forbidden("无权限操作授权码"));
            }
            
            courseAccessCodeService.deleteAccessCode(codeId);
            return ResponseEntity.ok(ApiResponse.success("授权码已删除", null));
            
        } catch (Exception e) {
            log.error("删除授权码失败: codeId={}, error={}", codeId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("删除失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户
     */
    private User getCurrentUser(HttpServletRequest request) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return null;
        }
        try {
            return userService.getUserByAccessToken(accessToken);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 提取访问令牌
     */
    private String extractAccessToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * 检查是否为管理员
     */
    private boolean isAdmin(User user) {
        return user != null && ("admin".equals(user.getRole()) || "super_admin".equals(user.getRole()));
    }
} 