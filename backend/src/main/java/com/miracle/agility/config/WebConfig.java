package com.miracle.agility.config;

import com.miracle.agility.interceptor.ProfileCompletionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ProfileCompletionInterceptor profileCompletionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(profileCompletionInterceptor)
                .addPathPatterns("/api/**")  // 拦截所有API请求
                .excludePathPatterns(
                    "/api/user/login",       // 排除登录接口
                    "/api/user/info",        // 排除获取用户信息接口
                    "/api/user/profile",     // 排除更新用户信息接口
                    "/api/user/logout"       // 排除退出登录接口
                );
    }
} 