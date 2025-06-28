package com.miracle.agility.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web配置类
 * 配置静态资源映射和拦截器
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtAuthenticationInterceptor jwtAuthenticationInterceptor;

    @Value("${file.upload.path:./data/uploads/}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取绝对路径
        File uploadDir = new File(uploadPath);
        if (!uploadDir.isAbsolute()) {
            uploadDir = new File(System.getProperty("user.dir"), uploadPath);
        }
        String absolutePath = uploadDir.getAbsolutePath() + File.separator;
        
        // 配置文件上传路径的静态资源映射
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath);
        
        // 配置新的文件上传目录映射
        File fileUploadDir = new File("uploads/files/");
        if (!fileUploadDir.isAbsolute()) {
            fileUploadDir = new File(System.getProperty("user.dir"), "uploads/files/");
        }
        String fileUploadPath = fileUploadDir.getAbsolutePath() + File.separator;
        
        registry.addResourceHandler("/uploads/files/**")
                .addResourceLocations("file:" + fileUploadPath);
        
        // 日志输出配置信息
        System.out.println("静态资源映射配置:");
        System.out.println("URL映射: /uploads/**");
        System.out.println("文件路径: file:" + absolutePath);
        System.out.println("文件上传映射: /uploads/files/**");
        System.out.println("文件上传路径: file:" + fileUploadPath);
        System.out.println("当前工作目录: " + System.getProperty("user.dir"));
    }

    /**
     * 配置拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        System.out.println("注册JWT认证拦截器");
        registry.addInterceptor(jwtAuthenticationInterceptor)
                .addPathPatterns("/api/**")  // 拦截所有API请求
                .excludePathPatterns(
                    "/api/user/wx-login",      // 排除微信登录
                    "/api/user/login",         // 排除普通登录
                    "/api/user/refresh-token", // 排除刷新token
                    "/api/courses/public/list", // 排除公开课程列表
                    "/api/health",             // 排除健康检查
                    "/api/version"             // 排除版本信息
                );
    }
} 