package com.miracle.agility.controller;

import com.miracle.agility.common.ApiResponse;
import com.miracle.agility.entity.Admin;
import com.miracle.agility.service.AdminService;
import com.miracle.agility.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            if (username == null || username.trim().isEmpty()) {
                return ApiResponse.error("用户名不能为空");
            }
            
            if (password == null || password.trim().isEmpty()) {
                return ApiResponse.error("密码不能为空");
            }
            
            Map<String, Object> result = adminService.login(username, password);
            return ApiResponse.success(result);
            
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 管理员退出登录
     */
    @PostMapping("/logout")
    public ApiResponse<String> logout(HttpServletRequest request) {
        try {
            String token = request.getHeader("Admin-Token");
            if (token != null) {
                adminService.logout(token);
            }
            return ApiResponse.success("退出成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 获取当前管理员信息
     */
    @GetMapping("/current")
    public ApiResponse<Admin> getCurrentAdmin(HttpServletRequest request) {
        try {
            Admin admin = (Admin) request.getAttribute("currentAdmin");
            return ApiResponse.success(admin);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 修改密码
     */
    @PostMapping("/changePassword")
    public ApiResponse<String> changePassword(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            Admin currentAdmin = (Admin) httpRequest.getAttribute("currentAdmin");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            if (oldPassword == null || oldPassword.trim().isEmpty()) {
                return ApiResponse.error("原密码不能为空");
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ApiResponse.error("新密码不能为空");
            }
            
            if (newPassword.length() < 6) {
                return ApiResponse.error("新密码长度不能少于6位");
            }
            
            adminService.changePassword(currentAdmin.getId(), oldPassword, newPassword);
            return ApiResponse.success("密码修改成功");
            
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 上传单个文件
     */
    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            String fileUrl = fileUploadService.uploadFile(file, category);
            return ApiResponse.success(fileUrl);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 批量上传文件
     */
    @PostMapping("/upload/batch")
    public ApiResponse<List<String>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        try {
            List<String> fileUrls = fileUploadService.uploadFiles(files, category);
            return ApiResponse.success(fileUrls);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 删除文件
     */
    @DeleteMapping("/file")
    public ApiResponse<String> deleteFile(@RequestParam("url") String fileUrl) {
        try {
            boolean deleted = fileUploadService.deleteFile(fileUrl);
            if (deleted) {
                return ApiResponse.success("文件删除成功");
            } else {
                return ApiResponse.error("文件删除失败");
            }
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * 创建管理员（仅超级管理员可用）
     */
    @PostMapping("/create")
    public ApiResponse<Admin> createAdmin(@RequestBody Admin admin, HttpServletRequest request) {
        try {
            Admin currentAdmin = (Admin) request.getAttribute("currentAdmin");
            
            // 检查权限：只有超级管理员可以创建管理员
            if (!"SUPER_ADMIN".equals(currentAdmin.getRole())) {
                return ApiResponse.error("权限不足，只有超级管理员可以创建新管理员");
            }
            
            Admin newAdmin = adminService.createAdmin(admin);
            // 不返回密码
            newAdmin.setPassword(null);
            return ApiResponse.success(newAdmin);
            
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 