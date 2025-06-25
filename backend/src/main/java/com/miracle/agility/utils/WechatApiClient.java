package com.miracle.agility.utils;

import okhttp3.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

@Component
public class WechatApiClient {

    private static final Logger logger = LoggerFactory.getLogger(WechatApiClient.class);
    
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WechatApiClient() {
        this.objectMapper = new ObjectMapper();
        this.httpClient = createHttpClient();
    }

    /**
     * 创建配置好的OkHttpClient
     */
    private OkHttpClient createHttpClient() {
        try {
            // 创建信任所有证书的TrustManager
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {}

                    @Override
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {}

                    @Override
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }
                }
            };

            // 创建SSL上下文
            SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

            // 创建SSL套接字工厂
            SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

            OkHttpClient.Builder builder = new OkHttpClient.Builder()
                    .sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0])
                    .hostnameVerifier((hostname, session) -> true)
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .retryOnConnectionFailure(true);

            logger.info("✅ OkHttp客户端初始化成功 - 支持TLS 1.2");
            return builder.build();

        } catch (Exception e) {
            logger.error("❌ OkHttp客户端初始化失败: {}", e.getMessage());
            // 如果SSL配置失败，使用默认配置
            return new OkHttpClient.Builder()
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build();
        }
    }

    /**
     * 调用微信code2session接口获取openid
     */
    public String getOpenid(String appId, String secret, String code) throws Exception {
        // 参数验证
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("微信登录code不能为空");
        }
        if (appId == null || appId.trim().isEmpty()) {
            throw new IllegalArgumentException("微信AppID不能为空");
        }
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalArgumentException("微信AppSecret不能为空");
        }

        // 构建请求URL
        String url = String.format(
            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
            appId, secret, code
        );

        logger.info("🚀 调用微信API - AppID: {}, Code: {}", appId, code);

        // 创建请求
        Request request = new Request.Builder()
                .url(url)
                .get()
                .addHeader("User-Agent", "MiracleAgility/1.0")
                .addHeader("Accept", "application/json")
                .build();

        try {
            // 发送请求
            logger.info("📡 发送HTTP请求到微信服务器...");
            Response response = httpClient.newCall(request).execute();

            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "无响应体";
                logger.error("❌ HTTP请求失败: {} - {}", response.code(), errorBody);
                throw new RuntimeException("HTTP请求失败: " + response.code());
            }

            // 获取响应内容
            String responseBody = response.body().string();
            if (responseBody == null || responseBody.trim().isEmpty()) {
                throw new RuntimeException("微信API返回空响应");
            }

            logger.info("✅ 微信API调用成功，响应长度: {} 字符", responseBody.length());
            logger.debug("📄 微信API响应: {}", responseBody);

            // 解析JSON响应
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            // 检查微信API错误码
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                String errmsg = jsonNode.has("errmsg") ? jsonNode.get("errmsg").asText() : "未知错误";
                
                String errorMessage = getWechatErrorMessage(errcode, errmsg);
                logger.error("❌ 微信API返回错误: {} - {}", errcode, errorMessage);
                throw new RuntimeException("微信登录失败: " + errorMessage);
            }

            // 提取openid
            if (!jsonNode.has("openid")) {
                logger.error("❌ 微信API响应格式异常，缺少openid字段");
                throw new RuntimeException("微信API响应格式错误");
            }

            String openid = jsonNode.get("openid").asText();
            if (openid == null || openid.trim().isEmpty()) {
                throw new RuntimeException("微信API返回空的openid");
            }

            logger.info("🎉 成功获取微信openid: {}", openid);

            // 记录session_key（如果需要）
            if (jsonNode.has("session_key")) {
                String sessionKey = jsonNode.get("session_key").asText();
                logger.debug("📝 获取到session_key（长度: {}）", sessionKey != null ? sessionKey.length() : 0);
            }

            return openid;

        } catch (Exception e) {
            logger.error("❌ 微信API调用异常: {}", e.getMessage(), e);
            throw new RuntimeException("微信登录失败: " + e.getMessage());
        }
    }

    /**
     * 测试网络连接
     */
    public boolean testConnection() {
        try {
            logger.info("🔍 测试微信API连接...");
            
            Request request = new Request.Builder()
                    .url("https://api.weixin.qq.com")
                    .head()  // 只发送HEAD请求
                    .build();

            Response response = httpClient.newCall(request).execute();
            boolean success = response.isSuccessful() || response.code() == 400 || response.code() == 401;
            
            if (success) {
                logger.info("✅ 微信API连接测试成功 - 响应码: {}", response.code());
            } else {
                logger.warn("⚠️ 微信API连接测试异常 - 响应码: {}", response.code());
            }
            
            return success;
        } catch (Exception e) {
            logger.error("❌ 微信API连接测试失败: {}", e.getMessage());
            return false;
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
            case 40163:
                return "登录凭证已被使用，请重新获取";
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
} 