package com.miracle.agility.interceptor;

import com.miracle.agility.entity.Admin;
import com.miracle.agility.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {
    
    @Autowired
    private AdminService adminService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 允许OPTIONS请求通过
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        
        String token = request.getHeader("Admin-Token");
        if (token == null || token.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":1,\"message\":\"未登录或登录已失效\"}");
            return false;
        }
        
        Admin admin = adminService.validateToken(token);
        if (admin == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":1,\"message\":\"登录已失效，请重新登录\"}");
            return false;
        }
        
        // 将管理员信息存储到request中，供后续使用
        request.setAttribute("currentAdmin", admin);
        return true;
    }
} 