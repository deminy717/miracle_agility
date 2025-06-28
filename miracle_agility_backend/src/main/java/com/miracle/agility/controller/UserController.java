package com.miracle.agility.controller;

import com.miracle.agility.dto.LoginRequest;
import com.miracle.agility.dto.LoginResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户控制器
 */
@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * 微信小程序登录
     */
    @PostMapping("/wx-login")
    public ResponseEntity<Map<String, Object>> wxLogin(@Validated @RequestBody LoginRequest loginRequest,
                                                      HttpServletRequest request) {
        try {
            String clientIp = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            
            log.info("用户登录请求: clientIp={}, userAgent={}", clientIp, userAgent);
            
            LoginResponse response = userService.wxLogin(loginRequest, clientIp, userAgent);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "登录成功");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("用户登录失败: {}", e.getMessage(), e);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 500);
            result.put("message", e.getMessage());
            result.put("data", null);
            
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * 刷新访问令牌
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<Map<String, Object>> refreshToken(@RequestBody Map<String, String> requestBody,
                                                           HttpServletRequest request) {
        try {
            String refreshToken = requestBody.get("refreshToken");
            if (!StringUtils.hasText(refreshToken)) {
                throw new RuntimeException("刷新令牌不能为空");
            }
            
            String clientIp = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            
            LoginResponse response = userService.refreshToken(refreshToken, clientIp, userAgent);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "刷新成功");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("刷新令牌失败: {}", e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 401);
            result.put("message", e.getMessage());
            result.put("data", null);
            
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * 获取当前用户信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getUserInfo(HttpServletRequest request) {
        try {
            String accessToken = extractAccessToken(request);
            if (!StringUtils.hasText(accessToken)) {
                throw new RuntimeException("访问令牌不能为空");
            }
            
            User user = userService.getUserByAccessToken(accessToken);
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.fromUser(user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", userInfo);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("获取用户信息失败: {}", e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 401);
            result.put("message", e.getMessage());
            result.put("data", null);
            
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        try {
            String accessToken = extractAccessToken(request);
            if (StringUtils.hasText(accessToken)) {
                userService.logout(accessToken);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "登出成功");
            result.put("data", null);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("用户登出失败: {}", e.getMessage());
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 500);
            result.put("message", e.getMessage());
            result.put("data", null);
            
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * 更新用户信息 - 支持PUT和POST方法
     */
    @RequestMapping(value = "/update", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody Map<String, Object> updateRequest,
                                                         HttpServletRequest request) {
        try {
            log.info("收到用户信息更新请求: {}", updateRequest);
            
            String accessToken = extractAccessToken(request);
            if (!StringUtils.hasText(accessToken)) {
                throw new RuntimeException("访问令牌不能为空");
            }
            
            User currentUser = userService.getUserByAccessToken(accessToken);
            log.info("当前用户信息: {}", currentUser);
            
            // 更新允许的字段，并处理字段映射
            if (updateRequest.containsKey("nickname")) {
                currentUser.setNickname((String) updateRequest.get("nickname"));
            }
            if (updateRequest.containsKey("avatar")) {
                currentUser.setAvatarUrl((String) updateRequest.get("avatar"));
            }
            if (updateRequest.containsKey("gender")) {
                // 处理性别映射：male=1, female=2, secret=0
                String genderStr = (String) updateRequest.get("gender");
                if ("male".equals(genderStr)) {
                    currentUser.setGender(1);
                } else if ("female".equals(genderStr)) {
                    currentUser.setGender(2);
                } else {
                    currentUser.setGender(0);
                }
            }
            if (updateRequest.containsKey("phone")) {
                currentUser.setPhone((String) updateRequest.get("phone"));
            }
            if (updateRequest.containsKey("profession")) {
                currentUser.setProfession((String) updateRequest.get("profession"));
            }
            if (updateRequest.containsKey("email")) {
                currentUser.setEmail((String) updateRequest.get("email"));
            }
            
            // 地区信息字段
            if (updateRequest.containsKey("province")) {
                currentUser.setProvince((String) updateRequest.get("province"));
                log.info("设置用户省份: {}", updateRequest.get("province"));
            }
            if (updateRequest.containsKey("city")) {
                currentUser.setCity((String) updateRequest.get("city"));
                log.info("设置用户城市: {}", updateRequest.get("city"));
            }
            if (updateRequest.containsKey("district")) {
                currentUser.setDistrict((String) updateRequest.get("district"));
                log.info("设置用户区县: {}", updateRequest.get("district"));
            }
            
            // 其他个人信息字段
            if (updateRequest.containsKey("bio")) {
                currentUser.setBio((String) updateRequest.get("bio"));
                log.info("设置用户个人简介: {}", updateRequest.get("bio"));
            }
            if (updateRequest.containsKey("specialties")) {
                currentUser.setSpecialties((String) updateRequest.get("specialties"));
                log.info("设置用户擅长项目: {}", updateRequest.get("specialties"));
            }
            if (updateRequest.containsKey("experience")) {
                currentUser.setExperienceLevel((String) updateRequest.get("experience"));
                log.info("设置用户训练经验: {}", updateRequest.get("experience"));
            }
            
            log.info("准备更新的用户信息: {}", currentUser);
            User updatedUser = userService.updateUser(currentUser);
            log.info("更新后的用户信息: {}", updatedUser);
            
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.fromUser(updatedUser);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "更新成功");
            result.put("data", userInfo);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("更新用户信息失败: {}", e.getMessage(), e);
            log.error("请求数据: {}", updateRequest);
            log.error("异常堆栈: ", e);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 500);
            result.put("message", e.getMessage());
            result.put("data", null);
            
            return ResponseEntity.status(500).body(result);
        }
    }
    
    /**
     * 从请求中提取访问令牌
     */
    private String extractAccessToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    /**
     * 测试接口 - 用于前端连接测试
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "后端服务正常运行");
        result.put("data", "OK");
        
        return ResponseEntity.ok(result);
    }

    /**
     * 测试异常日志接口
     */
    @PostMapping("/test-exception")
    public ResponseEntity<Map<String, Object>> testException(@RequestBody Map<String, Object> requestData) {
        log.info("测试异常日志接口被调用，请求数据: {}", requestData);
        
        try {
            // 模拟一个异常
            if (requestData.containsKey("throwError") && (Boolean) requestData.get("throwError")) {
                throw new RuntimeException("这是一个测试异常，用于验证日志输出");
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "测试成功，没有异常");
            result.put("data", requestData);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("测试异常被捕获: {}", e.getMessage(), e);
            throw e; // 重新抛出，让全局异常处理器处理
        }
    }
    
    /**
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 