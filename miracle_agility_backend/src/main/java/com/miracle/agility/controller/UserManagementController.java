package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.UserDetailDTO;
import com.miracle.agility.dto.UserInfoDTO;
import com.miracle.agility.dto.UserListItemDTO;
import com.miracle.agility.dto.UserStatisticsDTO;
import com.miracle.agility.dto.UserCourseInfoDTO;
import com.miracle.agility.entity.User;
import com.miracle.agility.entity.UserCourse;
import com.miracle.agility.service.UserCourseService;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 用户管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserService userService;
    private final UserCourseService userCourseService;

    /**
     * 获取所有用户列表（管理员）
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<UserListItemDTO>>> getUserList(HttpServletRequest httpRequest) {

        log.info("管理员获取用户列表");

        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.forbidden("无权限访问后台管理功能"));
            }

            // 获取所有用户课程关联信息
            List<UserCourse> userCourses = userCourseService.getAllUserCourses();

            // 按用户分组并整理数据
            Map<Long, List<UserCourse>> userCoursesMap = userCourses.stream()
                    .collect(Collectors.groupingBy(UserCourse::getUserId));

            // 构建返回数据
            List<UserListItemDTO> userList = userCoursesMap.entrySet().stream()
                    .map(entry -> {
                        Long userId = entry.getKey();
                        List<UserCourse> courses = entry.getValue();

                        if (!courses.isEmpty()) {
                            UserCourse firstCourse = courses.get(0);
                            
                            // 构建课程信息列表
                            List<UserCourseInfoDTO> courseList = courses.stream().map(uc -> 
                                UserCourseInfoDTO.builder()
                                    .courseId(uc.getCourseId())
                                    .courseTitle(uc.getCourse() != null ? uc.getCourse().getTitle() : "未知课程")
                                    .progress(uc.getProgress())
                                    .registrationType(uc.getRegistrationType())
                                    .createdAt(uc.getCreatedAt())
                                    .isCompleted(uc.getIsCompleted())
                                    .build()
                            ).collect(Collectors.toList());
                            
                            // 构建用户列表项
                            return UserListItemDTO.builder()
                                    .userId(userId)
                                    .nickname(firstCourse.getUser() != null ? firstCourse.getUser().getNickname() : "未知用户")
                                    .avatarUrl(firstCourse.getUser() != null ? firstCourse.getUser().getAvatarUrl() : "")
                                    .phone(firstCourse.getUser() != null ? firstCourse.getUser().getPhone() : "")
                                    .email(firstCourse.getUser() != null ? firstCourse.getUser().getEmail() : "")
                                    .courseCount(courses.size())
                                    .courses(courseList)
                                    .build();
                        }
                        return null;
                    })
                    .filter(user -> user != null)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("获取成功", userList));

        } catch (Exception e) {
            log.error("获取用户列表失败: error={}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取用户列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取用户详情和课程信息
     */
    @GetMapping("/{userId}/detail")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getUserDetail(
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {

        log.info("获取用户详情: userId={}", userId);

        try {
            // 检查管理员权限
            User currentUser = getCurrentUser(httpRequest);
            if (!isAdmin(currentUser)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.forbidden("无权限访问后台管理功能"));
            }

            // 获取用户信息
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("用户不存在"));
            }

            // 获取用户课程
            List<UserCourse> userCourses = userCourseService.getUserCourses(userId);

            // 构建用户信息DTO
            UserInfoDTO userInfoDTO = UserInfoDTO.builder()
                    .id(user.getId())
                    .nickname(user.getNickname())
                    .avatarUrl(user.getAvatarUrl())
                    .phone(user.getPhone() != null ? user.getPhone() : "")
                    .email(user.getEmail() != null ? user.getEmail() : "")
                    .role(user.getRole())
                    .level(user.getLevel())
                    .createdAt(user.getCreatedAt())
                    .build();

            // 构建课程信息列表
            List<UserCourseInfoDTO> coursesList = userCourses.stream().map(uc -> 
                UserCourseInfoDTO.builder()
                    .courseId(uc.getCourseId())
                    .courseTitle(uc.getCourse() != null ? uc.getCourse().getTitle() : "未知课程")
                    .courseCover(uc.getCourse() != null ? uc.getCourse().getCover() : "")
                    .progress(uc.getProgress())
                    .totalStudyMinutes(uc.getTotalStudyMinutes())
                    .registrationType(uc.getRegistrationType())
                    .isCompleted(uc.getIsCompleted())
                    .createdAt(uc.getCreatedAt())
                    .lastStudyTime(uc.getLastStudyTime())
                    .build()
            ).collect(Collectors.toList());

            // 构建最终返回的DTO
            UserDetailDTO userDetail = UserDetailDTO.builder()
                    .userInfo(userInfoDTO)
                    .courses(coursesList)
                    .build();

            return ResponseEntity.ok(ApiResponse.success("获取成功", userDetail));

        } catch (Exception e) {
            log.error("获取用户详情失败: userId={}, error={}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取用户详情失败: " + e.getMessage()));
        }
    }


    /**
     * 获取当前用户
     */
    private User getCurrentUser(HttpServletRequest request) {
        String accessToken = extractAccessToken(request);
        return userService.getUserByAccessToken(accessToken);
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