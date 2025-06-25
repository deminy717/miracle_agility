package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.request.PageRequest;
import com.miracle.agility.dto.request.UpdateLessonStatusRequest;
import com.miracle.agility.dto.response.PageResponse;
import com.miracle.agility.service.CourseService;
import com.miracle.agility.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/course")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    /**
     * 获取课程列表
     */
    @GetMapping("/list")
    public ApiResponse<PageResponse<Map<String, Object>>> getCourseList(
            @RequestHeader("auth") String token,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }

            PageRequest request = new PageRequest(page, pageSize);
            PageResponse<Map<String, Object>> response = courseService.getCourseList(userId, request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("获取课程列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取课程详情
     */
    @GetMapping("/detail")
    public ApiResponse<Map<String, Object>> getCourseDetail(
            @RequestHeader("auth") String token,
            @RequestParam Long id) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }

            Map<String, Object> course = courseService.getCourseDetail(userId, id);
            if (course == null) {
                return ApiResponse.error("课程不存在");
            }
            return ApiResponse.success(course);
        } catch (Exception e) {
            return ApiResponse.error("获取课程详情失败：" + e.getMessage());
        }
    }

    /**
     * 获取课时内容
     */
    @GetMapping("/lesson")
    public ApiResponse<Map<String, Object>> getLessonContent(
            @RequestHeader("auth") String token,
            @RequestParam Long courseId,
            @RequestParam Long chapterId,
            @RequestParam Long lessonId) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }

            Map<String, Object> lesson = courseService.getLessonContent(userId, courseId, chapterId, lessonId);
            if (lesson == null) {
                return ApiResponse.error("课时不存在");
            }
            return ApiResponse.success(lesson);
        } catch (Exception e) {
            return ApiResponse.error("获取课时内容失败：" + e.getMessage());
        }
    }

    /**
     * 更新课时状态
     */
    @PostMapping("/update-status")
    public ApiResponse<Map<String, Object>> updateLessonStatus(
            @RequestHeader("auth") String token,
            @RequestBody UpdateLessonStatusRequest request) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }

            Map<String, Object> result = courseService.updateLessonStatus(userId, request);
            return ApiResponse.success(result);
        } catch (Exception e) {
            return ApiResponse.error("更新课时状态失败：" + e.getMessage());
        }
    }
} 