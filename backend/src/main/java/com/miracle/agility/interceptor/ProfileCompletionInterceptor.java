package com.miracle.agility.interceptor;

import com.miracle.agility.annotation.RequireCompleteProfile;
import com.miracle.agility.entity.User;
import com.miracle.agility.exception.BusinessException;
import com.miracle.agility.service.UserService;
import com.miracle.agility.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class ProfileCompletionInterceptor implements HandlerInterceptor {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 只处理带有RequireCompleteProfile注解的方法
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireCompleteProfile annotation = handlerMethod.getMethodAnnotation(RequireCompleteProfile.class);
        
        // 如果没有注解，直接通过
        if (annotation == null) {
            // 检查类级别的注解
            annotation = handlerMethod.getBeanType().getAnnotation(RequireCompleteProfile.class);
            if (annotation == null) {
                return true;
            }
        }

        // 获取token
        String token = request.getHeader("auth");
        if (token == null || token.trim().isEmpty()) {
            throw new BusinessException("请先登录");
        }

        // 去掉Bearer前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 验证token并获取用户ID
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException("登录已过期，请重新登录");
        }

        String userIdStr = jwtUtil.getUserIdFromToken(token);
        if (userIdStr == null) {
            throw new BusinessException("无效的登录信息");
        }

        // 获取用户信息
        Long userId = Long.valueOf(userIdStr);
        User user = userService.getUserInfo(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 检查用户信息是否完整
        if (!user.isProfileComplete()) {
            throw new BusinessException(annotation.message());
        }

        return true;
    }
} 