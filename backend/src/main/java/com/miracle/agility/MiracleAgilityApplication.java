package com.miracle.agility;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.miracle.agility.mapper")
public class MiracleAgilityApplication {

    public static void main(String[] args) {
        // 设置SSL/TLS系统属性，确保与微信API兼容
        System.setProperty("https.protocols", "TLSv1.2,TLSv1.3");
        System.setProperty("jdk.tls.client.protocols", "TLSv1.2,TLSv1.3");
        System.setProperty("com.sun.net.ssl.checkRevocation", "false");
        System.setProperty("jsse.enableSNIExtension", "false");
        
        // 在调试模式下启用SSL日志（可选）
        // System.setProperty("javax.net.debug", "ssl:handshake");
        
        System.out.println("🔧 SSL/TLS系统属性已设置: TLSv1.2, TLSv1.3");
        
        SpringApplication.run(MiracleAgilityApplication.class, args);
    }

} 