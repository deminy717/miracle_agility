package com.miracle.agility.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.security.SecureRandom;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        // 配置SSL以支持微信API（TLS 1.2+）
        try {
            // 创建信任所有证书的TrustManager
            TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };

            // 明确使用TLS 1.2版本（微信服务器要求）
            SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
            sslContext.init(null, trustAllCerts, new SecureRandom());
            
            // 设置默认SSL配置
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
            
            System.out.println("✅ SSL配置成功 - 使用TLS 1.2协议");
        } catch (Exception e) {
            System.err.println("❌ SSL配置失败: " + e.getMessage());
            e.printStackTrace();
        }

        // 创建RestTemplate并设置超时和系统属性
        RestTemplate restTemplate = new RestTemplate();
        
        // 自定义请求工厂
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory() {
            @Override
            protected void prepareConnection(java.net.HttpURLConnection connection, String httpMethod) throws java.io.IOException {
                super.prepareConnection(connection, httpMethod);
                
                // 如果是HTTPS连接，确保使用正确的SSL配置
                if (connection instanceof HttpsURLConnection) {
                    HttpsURLConnection httpsConnection = (HttpsURLConnection) connection;
                    
                    try {
                        // 再次确保使用TLS 1.2
                        SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
                        sslContext.init(null, new TrustManager[]{
                            new X509TrustManager() {
                                public X509Certificate[] getAcceptedIssuers() { return null; }
                                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                            }
                        }, new SecureRandom());
                        
                        httpsConnection.setSSLSocketFactory(sslContext.getSocketFactory());
                        httpsConnection.setHostnameVerifier((hostname, session) -> true);
                    } catch (Exception e) {
                        System.err.println("HTTPS连接SSL配置失败: " + e.getMessage());
                    }
                }
            }
        };
        
        requestFactory.setConnectTimeout(15000);  // 连接超时15秒
        requestFactory.setReadTimeout(30000);     // 读取超时30秒
        restTemplate.setRequestFactory(requestFactory);

        return restTemplate;
    }
} 