package com.miracle.agility.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileUploadService {
    
    @Value("${app.upload.path:/tmp/uploads}")
    private String uploadPath;
    
    @Value("${app.upload.domain:http://localhost:8080}")
    private String uploadDomain;
    
    // 允许的图片格式
    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "bmp", "webp"
    );
    
    // 允许的视频格式
    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList(
        "mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"
    );
    
    // 允许的文档格式
    private static final List<String> DOCUMENT_EXTENSIONS = Arrays.asList(
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"
    );
    
    // 最大文件大小限制
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
    
    /**
     * 上传文件
     */
    public String uploadFile(MultipartFile file, String category) {
        if (file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("文件名不能为空");
        }
        
        // 获取文件扩展名
        String extension = getFileExtension(originalFilename);
        
        // 验证文件类型和大小
        validateFile(file, extension, category);
        
        try {
            // 创建目录结构：uploads/category/yyyy/MM/dd/
            String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String relativePath = category + "/" + dateFolder;
            String fullPath = uploadPath + "/" + relativePath;
            
            // 确保目录存在
            File directory = new File(fullPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // 生成唯一文件名
            String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;
            String filePath = fullPath + "/" + filename;
            
            // 保存文件
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());
            
            // 返回访问URL
            return uploadDomain + "/uploads/" + relativePath + "/" + filename;
            
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量上传文件
     */
    public List<String> uploadFiles(MultipartFile[] files, String category) {
        return Arrays.stream(files)
            .map(file -> uploadFile(file, category))
            .collect(Collectors.toList());
    }
    
    /**
     * 删除文件
     */
    public boolean deleteFile(String fileUrl) {
        try {
            if (fileUrl.startsWith(uploadDomain)) {
                String relativePath = fileUrl.substring(uploadDomain.length());
                if (relativePath.startsWith("/uploads/")) {
                    String fullPath = uploadPath + relativePath.substring("/uploads".length());
                    File file = new File(fullPath);
                    if (file.exists()) {
                        return file.delete();
                    }
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }
    
    /**
     * 验证文件类型和大小
     */
    private void validateFile(MultipartFile file, String extension, String category) {
        long fileSize = file.getSize();
        
        switch (category.toLowerCase()) {
            case "images":
            case "image":
                if (!IMAGE_EXTENSIONS.contains(extension)) {
                    throw new RuntimeException("不支持的图片格式，仅支持: " + String.join(", ", IMAGE_EXTENSIONS));
                }
                if (fileSize > MAX_IMAGE_SIZE) {
                    throw new RuntimeException("图片文件大小不能超过 10MB");
                }
                break;
                
            case "videos":
            case "video":
                if (!VIDEO_EXTENSIONS.contains(extension)) {
                    throw new RuntimeException("不支持的视频格式，仅支持: " + String.join(", ", VIDEO_EXTENSIONS));
                }
                if (fileSize > MAX_VIDEO_SIZE) {
                    throw new RuntimeException("视频文件大小不能超过 100MB");
                }
                break;
                
            case "documents":
            case "document":
                if (!DOCUMENT_EXTENSIONS.contains(extension)) {
                    throw new RuntimeException("不支持的文档格式，仅支持: " + String.join(", ", DOCUMENT_EXTENSIONS));
                }
                if (fileSize > MAX_DOCUMENT_SIZE) {
                    throw new RuntimeException("文档文件大小不能超过 50MB");
                }
                break;
                
            default:
                // 通用文件验证，合并所有允许的格式
                boolean isValidExtension = IMAGE_EXTENSIONS.contains(extension) ||
                    VIDEO_EXTENSIONS.contains(extension) ||
                    DOCUMENT_EXTENSIONS.contains(extension);
                
                if (!isValidExtension) {
                    throw new RuntimeException("不支持的文件格式");
                }
                break;
        }
    }
} 