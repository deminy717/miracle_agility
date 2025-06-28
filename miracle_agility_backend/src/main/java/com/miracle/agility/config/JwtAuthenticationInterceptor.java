package com.miracle.agility.config;

import com.miracle.agility.exception.AuthenticationException;
import com.miracle.agility.service.UserService;
import com.miracle.agility.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * JWT认证拦截器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        log.debug("JWT拦截器处理请求: {} {}", method, requestURI);
        
        // 跳过登录相关接口
        if (isPublicEndpoint(requestURI)) {
            log.debug("跳过公开接口: {}", requestURI);
            return true;
        }
        
        // 提取Authorization头
        String authHeader = request.getHeader("Authorization");
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            log.warn("缺少Authorization头或格式错误: {}", authHeader);
            throw new AuthenticationException("缺少访问令牌");
        }
        
        // 提取token
        String token = authHeader.substring(7);
        
        try {
            // 验证token有效性
            if (!jwtUtil.validateToken(token)) {
                log.warn("访问令牌无效: {}", token.substring(0, Math.min(token.length(), 10)) + "...");
                throw new AuthenticationException("访问令牌无效");
            }
            
            // 检查token是否过期
            if (jwtUtil.isTokenExpired(token)) {
                log.warn("访问令牌已过期: {}", token.substring(0, Math.min(token.length(), 10)) + "...");
                throw new AuthenticationException("访问令牌已过期");
            }
            
            // 验证用户是否存在且有效
            try {
                userService.getUserByAccessToken(token);
            } catch (Exception e) {
                log.warn("用户验证失败: {}", e.getMessage());
                throw new AuthenticationException("用户验证失败");
            }
            
            log.debug("JWT验证通过，继续处理请求");
            return true;
            
        } catch (AuthenticationException e) {
            // 重新抛出认证异常，让全局异常处理器处理
            throw e;
        } catch (Exception e) {
            log.error("JWT验证异常: {}", e.getMessage());
            throw new AuthenticationException("令牌验证失败");
        }
    }
    
    /**
     * 判断是否为公开接口，不需要token验证
     */
    private boolean isPublicEndpoint(String requestURI) {
        // 登录相关接口
        if (requestURI.equals("/api/user/wx-login") || 
            requestURI.equals("/api/user/login") ||
            requestURI.equals("/api/user/refresh-token")) {
            return true;
        }
        
        // 公开课程列表接口
        if (requestURI.equals("/api/courses/public/list")) {
            return true;
        }
        
        // 静态资源
        if (requestURI.startsWith("/uploads/")) {
            return true;
        }
        
        // 健康检查等
        if (requestURI.equals("/api/health") || 
            requestURI.equals("/api/version")) {
            return true;
        }
        
        return false;
    }
} 