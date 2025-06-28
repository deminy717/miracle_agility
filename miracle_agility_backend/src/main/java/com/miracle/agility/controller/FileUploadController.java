package com.miracle.agility.controller;

import com.miracle.agility.entity.User;
import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 文件上传控制器
 */
@Slf4j
@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final UserService userService;
    
    // 从配置文件读取上传路径和访问域名
    @Value("${file.upload.path:/uploads/}")
    private String uploadPath;
    
    @Value("${file.access.domain:http://localhost:8080}")
    private String accessDomain;

    /**
     * 上传图片文件
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            HttpServletRequest request) {
        
        log.info("上传图片请求: fileName={}, size={}, category={}", 
                file.getOriginalFilename(), file.getSize(), category);
        
        try {
            // 验证用户权限
            User currentUser = getCurrentUser(request);
            
            // 验证文件类型
            if (!isValidImageFile(file)) {
                return createErrorResponse("不支持的图片格式，请上传JPG、PNG、GIF或WebP格式的图片");
            }
            
            // 验证文件大小 (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return createErrorResponse("图片文件过大，请上传小于10MB的图片");
            }
            
            // 保存文件
            String fileName = saveFile(file, "images", category);
            String fileUrl = generateFileUrl(fileName, "images", category);
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("originalName", file.getOriginalFilename());
            result.put("size", file.getSize());
            result.put("category", category);
            result.put("uploadTime", LocalDateTime.now());
            result.put("uploadBy", currentUser.getId());
            
            log.info("图片上传成功: url={}", fileUrl);
            return createSuccessResponse("图片上传成功", result);
            
        } catch (Exception e) {
            log.error("图片上传失败: {}", e.getMessage(), e);
            return createErrorResponse("图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 上传视频文件
     */
    @PostMapping("/video")
    public ResponseEntity<Map<String, Object>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            HttpServletRequest request) {
        
        log.info("上传视频请求: fileName={}, size={}, category={}", 
                file.getOriginalFilename(), file.getSize(), category);
        
        try {
            // 验证用户权限
            User currentUser = getCurrentUser(request);
            
            // 验证文件类型
            if (!isValidVideoFile(file)) {
                return createErrorResponse("不支持的视频格式，请上传MP4、AVI、MOV或M4V格式的视频");
            }
            
            // 验证文件大小 (100MB)
            if (file.getSize() > 100 * 1024 * 1024) {
                return createErrorResponse("视频文件过大，请上传小于100MB的视频");
            }
            
            // 保存文件
            String fileName = saveFile(file, "videos", category);
            String fileUrl = generateFileUrl(fileName, "videos", category);
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("originalName", file.getOriginalFilename());
            result.put("size", file.getSize());
            result.put("category", category);
            result.put("uploadTime", LocalDateTime.now());
            result.put("uploadBy", currentUser.getId());
            
            log.info("视频上传成功: url={}", fileUrl);
            return createSuccessResponse("视频上传成功", result);
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("视频上传失败: {}", e.getMessage(), e);
            return createErrorResponse("视频上传失败: " + e.getMessage());
        }
    }

    /**
     * 上传通用文件
     */
    @PostMapping("/file")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            @RequestParam(value = "fileType", defaultValue = "document") String fileType,
            HttpServletRequest request) {
        
        log.info("上传文件请求: fileName={}, size={}, category={}, fileType={}", 
                file.getOriginalFilename(), file.getSize(), category, fileType);
        
        try {
            // 验证用户权限
            User currentUser = getCurrentUser(request);
            
            // 验证文件大小 (50MB)
            if (file.getSize() > 50 * 1024 * 1024) {
                return createErrorResponse("文件过大，请上传小于50MB的文件");
            }
            
            // 保存文件
            String fileName = saveFile(file, fileType, category);
            String fileUrl = generateFileUrl(fileName, fileType, category);
            
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileUrl);
            result.put("originalName", file.getOriginalFilename());
            result.put("size", file.getSize());
            result.put("category", category);
            result.put("fileType", fileType);
            result.put("uploadTime", LocalDateTime.now());
            result.put("uploadBy", currentUser.getId());
            
            log.info("文件上传成功: url={}", fileUrl);
            return createSuccessResponse("文件上传成功", result);
            
        } catch (AuthenticationException authenticationException) {
            throw authenticationException;
        } catch (Exception e) {
            log.error("文件上传失败: {}", e.getMessage(), e);
            return createErrorResponse("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 保存文件到服务器
     */
    private String saveFile(MultipartFile file, String fileType, String category) throws IOException {
        // 创建目录结构: uploads/fileType/category/yyyy/MM/dd/
        String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        
        // 获取绝对路径
        File uploadDir = new File(uploadPath);
        if (!uploadDir.isAbsolute()) {
            // 如果是相对路径，转换为绝对路径
            uploadDir = new File(System.getProperty("user.dir"), uploadPath);
        }
        
        String dirPath = uploadDir.getAbsolutePath() + File.separator + 
                        fileType + File.separator + category + File.separator + 
                        datePath.replace("/", File.separator) + File.separator;
        
        File dir = new File(dirPath);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            log.info("创建目录: {}, 结果: {}", dirPath, created);
        }
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        
        // 保存文件
        File targetFile = new File(dir, fileName);
        file.transferTo(targetFile);
        
        log.info("文件保存成功: {}", targetFile.getAbsolutePath());
        
        // 返回相对路径（用于URL访问）
        return fileType + "/" + category + "/" + datePath + "/" + fileName;
    }

    /**
     * 生成文件访问URL
     */
    private String generateFileUrl(String fileName, String fileType, String category) {
        // 注意：由于设置了context-path为/api，所以静态资源的访问路径不需要/api前缀
        // 但是在Spring Boot中，静态资源映射会自动处理context-path
        return accessDomain + "/api/uploads/" + fileName;
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex != -1 ? filename.substring(lastDotIndex + 1).toLowerCase() : "";
    }

    /**
     * 验证图片文件类型
     */
    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) return false;
        
        return contentType.startsWith("image/") && 
               (contentType.equals("image/jpeg") || 
                contentType.equals("image/png") || 
                contentType.equals("image/gif") || 
                contentType.equals("image/webp"));
    }

    /**
     * 验证视频文件类型
     */
    private boolean isValidVideoFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) return false;
        
        return contentType.startsWith("video/") && 
               (contentType.equals("video/mp4") || 
                contentType.equals("video/avi") || 
                contentType.equals("video/quicktime") || 
                contentType.equals("video/x-msvideo"));
    }

    /**
     * 创建成功响应
     */
    private ResponseEntity<Map<String, Object>> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    /**
     * 创建错误响应
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        return ResponseEntity.badRequest().body(response);
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