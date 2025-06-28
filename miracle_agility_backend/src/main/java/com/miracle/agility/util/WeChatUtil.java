package com.miracle.agility.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * 微信API工具类
 */
@Slf4j
@Component
public class WeChatUtil {
    
    @Value("${wechat.mini-program.app-id}")
    private String appId;
    
    @Value("${wechat.mini-program.app-secret}")
    private String appSecret;
    
    @Value("${wechat.mini-program.api-url}")
    private String apiUrl;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public WeChatUtil() {
        this.webClient = WebClient.builder().build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 微信小程序登录凭证校验
     */
    public WeChatLoginResult code2Session(String code) {
        try {
            String url = String.format("%s/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                    apiUrl, appId, appSecret, code);
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            log.info("微信登录响应: {}", response);
            
            JsonNode jsonNode = objectMapper.readTree(response);
            
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.get("errmsg").asText();
                log.error("微信登录失败: errcode={}, errmsg={}", errcode, errmsg);
                throw new RuntimeException("微信登录失败: " + errmsg);
            }
            
            WeChatLoginResult result = new WeChatLoginResult();
            result.setOpenid(jsonNode.get("openid").asText());
            result.setSessionKey(jsonNode.get("session_key").asText());
            
            if (jsonNode.has("unionid")) {
                result.setUnionid(jsonNode.get("unionid").asText());
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("调用微信登录接口失败: {}", e.getMessage(), e);
            throw new RuntimeException("微信登录失败", e);
        }
    }
    
    /**
     * 微信登录结果
     */
    public static class WeChatLoginResult {
        private String openid;
        private String sessionKey;
        private String unionid;
        
        // Getters and Setters
        public String getOpenid() {
            return openid;
        }
        
        public void setOpenid(String openid) {
            this.openid = openid;
        }
        
        public String getSessionKey() {
            return sessionKey;
        }
        
        public void setSessionKey(String sessionKey) {
            this.sessionKey = sessionKey;
        }
        
        public String getUnionid() {
            return unionid;
        }
        
        public void setUnionid(String unionid) {
            this.unionid = unionid;
        }
    }
} 