package com.miracle.agility.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.miracle.agility.dto.request.LoginRequest;
import com.miracle.agility.dto.request.UpdateProfileRequest;
import com.miracle.agility.dto.response.LoginResponse;
import com.miracle.agility.entity.User;
import com.miracle.agility.mapper.UserMapper;
import com.miracle.agility.utils.JwtUtil;
import com.miracle.agility.utils.WechatApiClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WechatApiClient wechatApiClient;

    // 微信小程序配置（请替换为你的实际配置）
    @Value("${wechat.appid:your_app_id}")
    private String appId;

    @Value("${wechat.secret:your_app_secret}")
    private String appSecret;



    /**
     * 用户登录
     */
    public LoginResponse login(LoginRequest request) {
        logger.info("用户登录请求 - code: {}, userInfo: {}", 
                   request.getCode(), 
                   request.getUserInfo() != null ? request.getUserInfo().getNickName() : "null");
        
        String openid;
        
        try {
            // 使用新的OkHttp客户端调用微信API
            openid = wechatApiClient.getOpenid(appId, appSecret, request.getCode());
            logger.info("✅ 成功获取到微信openid: {}", openid);
        } catch (Exception e) {
            logger.warn("⚠️ 调用微信API失败，使用fallback方式: {}", e.getMessage());
            // 如果微信API调用失败，使用fallback方式
            openid = "wx_" + request.getCode();
        }
        
        // 查找用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("wx_openid", openid);
        User user = userMapper.selectOne(queryWrapper);
        
        // 如果用户不存在
        if (user == null) {
            // 检查是否提供了用户信息
            if (request.getUserInfo() == null || 
                request.getUserInfo().getNickName() == null || 
                request.getUserInfo().getAvatarUrl() == null) {
                logger.warn("新用户但未提供用户信息 - openid: {}", openid);
                throw new RuntimeException("用户不存在，需要提供用户信息进行注册");
            }
            
            // 创建新用户
            logger.info("创建新用户 - openid: {}, nickName: {}", 
                       openid, request.getUserInfo().getNickName());
            user = new User(openid, request.getUserInfo().getNickName(), request.getUserInfo().getAvatarUrl());
            userMapper.insert(user);
        } else {
            // 用户已存在，直接登录
            logger.info("用户已存在，直接登录 - userId: {}, nickName: {}", user.getId(), user.getNickName());
            
            // 如果提供了新的用户信息，更新用户信息
            if (request.getUserInfo() != null && 
                request.getUserInfo().getNickName() != null && 
                request.getUserInfo().getAvatarUrl() != null) {
                logger.info("更新现有用户信息 - userId: {}, nickName: {}", 
                           user.getId(), request.getUserInfo().getNickName());
                user.setNickName(request.getUserInfo().getNickName());
                user.setAvatarUrl(request.getUserInfo().getAvatarUrl());
                user.setUpdateTime(LocalDateTime.now());
                userMapper.updateById(user);
            }
        }
        
        // 生成token
        String token = jwtUtil.generateToken(user.getId().toString());
        
        logger.info("用户登录成功 - userId: {}, token已生成", user.getId());
        return new LoginResponse(token, user.getId().toString(), user.getNickName(), user.getAvatarUrl());
    }

    /**
     * 调用微信API获取openid - 根据2025年最新文档优化
     */
    private String getOpenidFromWechat(String code) throws Exception {
        // 参数验证
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("微信登录code不能为空");
        }
        
        if (appId == null || appId.equals("your_app_id") || appId.trim().isEmpty()) {
            throw new IllegalArgumentException("微信AppID未配置或配置错误");
        }
        
        if (appSecret == null || appSecret.equals("your_secret_here") || appSecret.trim().isEmpty()) {
            throw new IllegalArgumentException("微信AppSecret未配置或配置错误");
        }
        
        // 微信API URL - 使用最新的接口格式
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            appId, appSecret, code
        );
        
        logger.info("🚀 调用微信API - AppID: {}, Code: {}", appId, code);
        
        try {
            // 网络连接前置检查
            logger.info("🔍 开始网络诊断...");
            
            // 1. DNS解析测试
            try {
                java.net.InetAddress address = java.net.InetAddress.getByName("api.weixin.qq.com");
                logger.info("✅ DNS解析成功: {} -> {}", "api.weixin.qq.com", address.getHostAddress());
            } catch (Exception e) {
                logger.error("❌ DNS解析失败: {}", e.getMessage());
                throw new RuntimeException("DNS解析失败，请检查网络连接");
            }
            
            // 2. 调用微信API
            logger.info("📡 发起HTTP请求到微信服务器...");
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("微信API返回空响应");
            }
            
            logger.info("✅ 微信API调用成功，响应长度: {} 字符", response.length());
            logger.debug("📄 微信API完整响应: {}", response);
            
            // 3. 解析JSON响应
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // 4. 检查微信API错误码
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.has("errmsg") ? jsonNode.get("errmsg").asText() : "未知错误";
                
                // 根据最新文档处理不同错误码
                String errorMessage = getWechatErrorMessage(errcode, errmsg);
                logger.error("❌ 微信API返回错误: {} - {}", errcode, errorMessage);
                throw new RuntimeException("微信登录失败: " + errorMessage);
            }
            
            // 5. 提取openid
            if (!jsonNode.has("openid")) {
                logger.error("❌ 微信API响应格式异常，缺少openid字段");
                throw new RuntimeException("微信API响应格式错误");
            }
            
            String openid = jsonNode.get("openid").asText();
            if (openid == null || openid.trim().isEmpty()) {
                throw new RuntimeException("微信API返回空的openid");
            }
            
            logger.info("🎉 成功获取微信openid: {}", openid);
            
            // 6. 记录session_key（如果需要解密用户信息）
            if (jsonNode.has("session_key")) {
                String sessionKey = jsonNode.get("session_key").asText();
                logger.debug("📝 获取到session_key（长度: {}）", sessionKey != null ? sessionKey.length() : 0);
            }
            
            return openid;
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            return handleNetworkException(e);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            logger.error("❌ HTTP客户端错误: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("微信API调用失败: " + e.getStatusCode());
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            logger.error("❌ 微信服务器错误: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("微信服务器暂时不可用: " + e.getStatusCode());
        } catch (Exception e) {
            logger.error("❌ 微信API调用异常: {}", e.getMessage(), e);
            throw new RuntimeException("微信登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据微信错误码返回友好的错误信息
     */
    private String getWechatErrorMessage(int errcode, String errmsg) {
        switch (errcode) {
            case -1:
                return "微信系统繁忙，请稍后重试";
            case 40029:
                return "登录凭证已失效，请重新登录";
            case 45011:
                return "登录频率过快，请稍后重试";
            case 40226:
                return "高风险用户，登录被拦截";
            case 40013:
                return "微信AppID配置错误";
            case 40125:
                return "微信AppSecret配置错误";
            default:
                return errmsg != null ? errmsg : "未知错误(错误码: " + errcode + ")";
        }
    }
    
    /**
     * 处理网络异常
     */
    private String handleNetworkException(org.springframework.web.client.ResourceAccessException e) throws RuntimeException {
        Throwable rootCause = e.getRootCause();
        
        if (rootCause instanceof javax.net.ssl.SSLHandshakeException) {
            logger.error("❌ SSL握手失败: {}", e.getMessage());
            logger.error("🔧 建议: 1.检查系统时间 2.检查网络防火墙 3.尝试重启应用");
            throw new RuntimeException("SSL连接失败，请检查网络环境");
            
        } else if (rootCause instanceof java.net.ConnectException) {
            logger.error("❌ 连接超时: {}", e.getMessage());
            logger.error("🔧 建议: 1.检查网络连接 2.检查防火墙设置 3.检查代理配置");
            throw new RuntimeException("网络连接超时，请检查网络");
            
        } else if (rootCause instanceof java.net.UnknownHostException) {
            logger.error("❌ DNS解析失败: {}", e.getMessage());
            logger.error("🔧 建议: 1.检查DNS设置 2.检查网络连接 3.尝试使用其他DNS");
            throw new RuntimeException("DNS解析失败，请检查网络设置");
            
        } else if (rootCause instanceof java.net.SocketTimeoutException) {
            logger.error("❌ 读取超时: {}", e.getMessage());
            throw new RuntimeException("网络读取超时，请重试");
            
        } else {
            logger.error("❌ 网络访问异常: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            throw new RuntimeException("网络访问失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户信息
     */
    public User getUserInfo(Long userId) {
        return userMapper.selectById(userId);
    }

    /**
     * 根据token获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (jwtUtil.validateToken(token)) {
            return Long.valueOf(jwtUtil.getUserIdFromToken(token));
        }
        return null;
    }

    /**
     * 更新用户信息
     */
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        
        // 更新自定义昵称和头像
        user.setCustomNickname(request.getCustomNickname());
        user.setCustomAvatar(request.getCustomAvatar());
        
        // 检查是否完善了所有必要信息
        boolean isComplete = request.getCustomNickname() != null && 
                           !request.getCustomNickname().trim().isEmpty() &&
                           request.getCustomAvatar() != null && 
                           !request.getCustomAvatar().trim().isEmpty();
        
        user.setProfileCompleted(isComplete);
        user.setUpdateTime(LocalDateTime.now());
        
        // 更新数据库
        userMapper.updateById(user);
        
        logger.info("用户信息更新成功 - userId: {}, 完善状态: {}", userId, isComplete);
        
        return user;
    }
    
    /**
     * 检查微信配置是否有效
     */
    public boolean isWechatConfigValid() {
        try {
            if (appId == null || appId.equals("your_app_id") || appId.trim().isEmpty()) {
                logger.warn("❌ 微信AppID未配置");
                return false;
            }
            
            if (appSecret == null || appSecret.equals("your_secret_here") || appSecret.trim().isEmpty()) {
                logger.warn("❌ 微信AppSecret未配置");
                return false;
            }
            
            logger.info("✅ 微信配置检查通过 - AppID: {}", appId);
            return true;
        } catch (Exception e) {
            logger.error("❌ 微信配置检查异常: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 测试微信网络连接
     */
    public boolean testWechatNetwork() {
        try {
            logger.info("🔍 测试微信网络连接...");
            
            // 测试DNS解析
            java.net.InetAddress address = java.net.InetAddress.getByName("api.weixin.qq.com");
            logger.info("✅ DNS解析成功: {} -> {}", "api.weixin.qq.com", address.getHostAddress());
            
            // 使用OkHttp客户端测试连接
            boolean connected = wechatApiClient.testConnection();
            if (connected) {
                logger.info("✅ OkHttp连接测试成功");
                return true;
            } else {
                logger.warn("⚠️ OkHttp连接测试失败");
                return false;
            }
            
        } catch (Exception e) {
            logger.error("❌ 网络连接测试失败: {}", e.getMessage());
            return false;
        }
    }
} 