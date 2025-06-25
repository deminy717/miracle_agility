package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.dto.request.LoginRequest;
import com.miracle.agility.dto.request.UpdateProfileRequest;
import com.miracle.agility.dto.response.LoginResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return ApiResponse.success(response);
        } catch (Exception e) {
            return ApiResponse.error("登录失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/info")
    public ApiResponse<User> getUserInfo(@RequestHeader("auth") String token) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }
            
            User user = userService.getUserInfo(userId);
            if (user == null) {
                return ApiResponse.error("用户不存在");
            }
            
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败：" + e.getMessage());
        }
    }

    /**
     * 用户退出登录
     */
    @PostMapping("/logout")
    public ApiResponse<String> logout(@RequestHeader(value = "auth", required = false) String token) {
        // 前端负责清除本地存储的token
        // 这里可以添加将token加入黑名单的逻辑（如果需要的话）
        return ApiResponse.success("退出登录成功");
    }

    /**
     * 更新用户信息
     */
    @PostMapping("/profile")
    public ApiResponse<User> updateProfile(@RequestHeader("auth") String token, 
                                          @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }
            
            User updatedUser = userService.updateProfile(userId, request);
            if (updatedUser == null) {
                return ApiResponse.error("更新用户信息失败");
            }
            
            return ApiResponse.success(updatedUser);
        } catch (Exception e) {
            return ApiResponse.error("更新用户信息失败：" + e.getMessage());
        }
    }

    /**
     * 检查用户信息完整性
     */
    @GetMapping("/profile/status")
    public ApiResponse<ProfileStatus> getProfileStatus(@RequestHeader("auth") String token) {
        try {
            Long userId = userService.getUserIdFromToken(token);
            if (userId == null) {
                return ApiResponse.unauthorized();
            }
            
            User user = userService.getUserInfo(userId);
            if (user == null) {
                return ApiResponse.error("用户不存在");
            }
            
            ProfileStatus status = new ProfileStatus();
            status.setProfileCompleted(user.isProfileComplete());
            status.setNeedCustomNickname(user.getCustomNickname() == null || user.getCustomNickname().trim().isEmpty());
            status.setNeedCustomAvatar(user.getCustomAvatar() == null || user.getCustomAvatar().trim().isEmpty());
            status.setDisplayNickname(user.getDisplayNickname());
            status.setDisplayAvatar(user.getDisplayAvatar());
            
            return ApiResponse.success(status);
        } catch (Exception e) {
            return ApiResponse.error("获取用户状态失败：" + e.getMessage());
        }
    }

    /**
     * 测试微信API配置
     */
    @GetMapping("/test-wechat-config")
    public ResponseEntity<ApiResponse<Object>> testWechatConfig() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 检查微信配置
            if (userService.isWechatConfigValid()) {
                result.put("config", "✅ 微信配置有效");
            } else {
                result.put("config", "❌ 微信配置无效");
            }
            
            // 测试网络连接
            if (userService.testWechatNetwork()) {
                result.put("network", "✅ 网络连接正常");
            } else {
                result.put("network", "❌ 网络连接失败");
            }
            
                         return ResponseEntity.ok(ApiResponse.success(result));
         } catch (Exception e) {
             Map<String, Object> error = new HashMap<>();
             error.put("error", e.getMessage());
             return ResponseEntity.ok(ApiResponse.error("配置测试失败: " + e.getMessage()));
        }
    }

    /**
     * 用户信息状态类
     */
    public static class ProfileStatus {
        private Boolean profileCompleted;
        private Boolean needCustomNickname;
        private Boolean needCustomAvatar;
        private String displayNickname;
        private String displayAvatar;
        
        // Getters and Setters
        public Boolean getProfileCompleted() { return profileCompleted; }
        public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }
        
        public Boolean getNeedCustomNickname() { return needCustomNickname; }
        public void setNeedCustomNickname(Boolean needCustomNickname) { this.needCustomNickname = needCustomNickname; }
        
        public Boolean getNeedCustomAvatar() { return needCustomAvatar; }
        public void setNeedCustomAvatar(Boolean needCustomAvatar) { this.needCustomAvatar = needCustomAvatar; }
        
        public String getDisplayNickname() { return displayNickname; }
        public void setDisplayNickname(String displayNickname) { this.displayNickname = displayNickname; }
        
        public String getDisplayAvatar() { return displayAvatar; }
        public void setDisplayAvatar(String displayAvatar) { this.displayAvatar = displayAvatar; }
    }
} 