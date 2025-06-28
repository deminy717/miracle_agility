package com.miracle.agility.service.impl;

import com.miracle.agility.dto.LoginRequest;
import com.miracle.agility.dto.LoginResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.entity.UserSession;
import com.miracle.agility.mapper.UserMapper;
import com.miracle.agility.mapper.UserSessionMapper;
import com.miracle.agility.service.UserService;
import com.miracle.agility.util.JwtUtil;
import com.miracle.agility.util.WeChatUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserSessionMapper userSessionMapper;
    private final JwtUtil jwtUtil;
    private final WeChatUtil weChatUtil;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse wxLogin(LoginRequest loginRequest, String clientIp, String userAgent) {
        log.info("微信小程序登录开始, code: {}", loginRequest.getCode());

        try {
            // 1. 调用微信接口验证登录凭证
            WeChatUtil.WeChatLoginResult weChatResult = weChatUtil.code2Session(loginRequest.getCode());
            log.info("微信登录验证成功, openid: {}", weChatResult.getOpenid());

            // 2. 查询或创建用户
            User user = userMapper.selectByOpenid(weChatResult.getOpenid());
            boolean isNewUser = false;

            if (user == null) {
                // 新用户注册
                user = createNewUser(weChatResult, loginRequest);
                userMapper.insert(user);
                isNewUser = true;
                log.info("创建新用户成功, userId: {}, openid: {}", user.getId(), user.getOpenid());
            } else {
                // 更新用户信息
                updateUserInfo(user, loginRequest);
                userMapper.updateById(user);
                log.info("更新用户信息成功, userId: {}", user.getId());
            }

            // 3. 更新最后登录信息
            userMapper.updateLastLoginInfo(user.getId(),
                    LocalDateTime.now().toString(), clientIp);

            // 4. 撤销用户的旧会话
            userSessionMapper.revokeAllUserSessions(user.getId());

            // 5. 生成新的访问令牌和刷新令牌
            String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getOpenid());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getOpenid());

            // 6. 删除具有相同session_key的旧记录（避免UNIQUE约束冲突）
            userSessionMapper.deleteSessionsBySessionKey(weChatResult.getSessionKey());

            // 7. 创建新会话
            UserSession session = createUserSession(user.getId(), weChatResult.getSessionKey(),
                    accessToken, refreshToken, clientIp, userAgent, loginRequest);
            userSessionMapper.insert(session);

            // 8. 构建响应
            LoginResponse response = LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtUtil.getRemainingTime(accessToken))
                    .userInfo(LoginResponse.UserInfo.fromUser(user))
                    .isNewUser(isNewUser)
                    .build();

            log.info("用户登录成功, userId: {}, isNewUser: {}", user.getId(), isNewUser);
            return response;

        } catch (Exception e) {
            log.error("微信小程序登录失败: {}", e.getMessage(), e);
            throw new RuntimeException("登录失败: " + e.getMessage(), e);
        }
    }

    @Override
    public User getUserByAccessToken(String accessToken) {
        try {
            // 验证token有效性
            if (!jwtUtil.validateToken(accessToken)) {
                throw new RuntimeException("访问令牌无效");
            }

            // 从数据库查询会话
            UserSession session = userSessionMapper.selectByAccessToken(accessToken);
            if (session == null || !session.isValid()) {
                throw new RuntimeException("会话不存在或已过期");
            }

            // 查询用户信息
            User user = userMapper.selectById(session.getUserId());
            if (user == null || !user.isActive()) {
                throw new RuntimeException("用户不存在或已被禁用");
            }

            return user;

        } catch (Exception e) {
            log.error("根据访问令牌获取用户失败: {}", e.getMessage());
            throw new RuntimeException("获取用户信息失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginResponse refreshToken(String refreshToken, String clientIp, String userAgent) {
        try {
            // 验证刷新令牌
            if (!jwtUtil.validateToken(refreshToken)) {
                throw new RuntimeException("刷新令牌无效");
            }

            // 查询会话
            UserSession session = userSessionMapper.selectByRefreshToken(refreshToken);
            if (session == null || !"active".equals(session.getStatus())) {
                throw new RuntimeException("刷新令牌无效或已过期");
            }

            // 查询用户
            User user = userMapper.selectById(session.getUserId());
            if (user == null || !user.isActive()) {
                throw new RuntimeException("用户不存在或已被禁用");
            }

            // 生成新令牌
            String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getOpenid());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getOpenid());

            // 更新会话
            session.setAccessToken(newAccessToken);
            session.setRefreshToken(newRefreshToken);
            session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRemainingTime(newAccessToken)));
            session.setClientIp(clientIp);
            session.setUserAgent(userAgent);
            userSessionMapper.updateById(session);

            // 构建响应
            return LoginResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(jwtUtil.getRemainingTime(newAccessToken))
                    .userInfo(LoginResponse.UserInfo.fromUser(user))
                    .isNewUser(false)
                    .build();

        } catch (Exception e) {
            log.error("刷新令牌失败: {}", e.getMessage());
            throw new RuntimeException("刷新令牌失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void logout(String accessToken) {
        try {
            userSessionMapper.revokeSession(accessToken);
            log.info("用户登出成功");
        } catch (Exception e) {
            log.error("用户登出失败: {}", e.getMessage());
            throw new RuntimeException("登出失败", e);
        }
    }

    @Override
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User updateUser(User user) {
        try {
            log.info("开始更新用户信息: userId={}, user={}", user.getId(), user);
            
            int updateResult = userMapper.updateById(user);
            log.info("用户信息更新结果: userId={}, 影响行数={}", user.getId(), updateResult);
            
            if (updateResult == 0) {
                throw new RuntimeException("用户信息更新失败，没有影响任何行");
            }
            
            User updatedUser = userMapper.selectById(user.getId());
            log.info("更新后查询的用户信息: {}", updatedUser);
            
            return updatedUser;
        } catch (Exception e) {
            log.error("更新用户信息失败: userId={}, error={}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("更新用户信息失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean hasPermission(Long userId, String permission) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return false;
        }

        // 简单的权限检查逻辑，可以根据需要扩展
        switch (permission) {
            case "admin":
                return user.isAdmin();
            case "super_admin":
                return user.isSuperAdmin();
            default:
                return true; // 普通权限
        }
    }

    /**
     * 创建新用户
     */
    private User createNewUser(WeChatUtil.WeChatLoginResult weChatResult, LoginRequest loginRequest) {
        User user = new User();
        user.setOpenid(weChatResult.getOpenid());
        user.setUnionid(weChatResult.getUnionid());

        // 设置用户基本信息
        if (StringUtils.hasText(loginRequest.getNickname())) {
            user.setNickname(loginRequest.getNickname());
        } else {
            user.setNickname("小程序用户");
        }

        if (StringUtils.hasText(loginRequest.getAvatarUrl())) {
            user.setAvatarUrl(loginRequest.getAvatarUrl());
        }

        if (loginRequest.getGender() != null) {
            user.setGender(loginRequest.getGender());
        }

        user.setRole("user");
        user.setStatus("active");
        user.setLevel("新手");
        user.setExperiencePoints(0);
        user.setTotalStudyTime(0);
        user.setRegistrationSource("wechat");

        return user;
    }

    /**
     * 更新用户信息
     */
    private void updateUserInfo(User user, LoginRequest loginRequest) {
        boolean needUpdate = false;

        if (StringUtils.hasText(loginRequest.getNickname()) &&
                !loginRequest.getNickname().equals(user.getNickname())) {
            user.setNickname(loginRequest.getNickname());
            needUpdate = true;
        }

        if (StringUtils.hasText(loginRequest.getAvatarUrl()) &&
                !loginRequest.getAvatarUrl().equals(user.getAvatarUrl())) {
            user.setAvatarUrl(loginRequest.getAvatarUrl());
            needUpdate = true;
        }

        if (loginRequest.getGender() != null &&
                !loginRequest.getGender().equals(user.getGender())) {
            user.setGender(loginRequest.getGender());
            needUpdate = true;
        }

        if (needUpdate) {
            log.info("更新用户信息: userId={}", user.getId());
        }
    }

    /**
     * 创建用户会话
     */
    private UserSession createUserSession(Long userId, String sessionKey, String accessToken,
                                          String refreshToken, String clientIp, String userAgent,
                                          LoginRequest loginRequest) {
        UserSession session = new UserSession();
        session.setUserId(userId);
        session.setSessionKey(sessionKey);
        session.setAccessToken(accessToken);
        session.setRefreshToken(refreshToken);
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getRemainingTime(accessToken)));
        session.setClientIp(clientIp);
        session.setUserAgent(userAgent);
        session.setStatus("active");

        // 设置设备信息
        if (loginRequest.getDeviceModel() != null || loginRequest.getDeviceSystem() != null) {
            String deviceInfo = String.format("{\"model\":\"%s\",\"system\":\"%s\",\"version\":\"%s\",\"clientVersion\":\"%s\"}",
                    loginRequest.getDeviceModel(), loginRequest.getDeviceSystem(),
                    loginRequest.getDeviceVersion(), loginRequest.getClientVersion());
            session.setDeviceInfo(deviceInfo);
        }

        return session;
    }
}