#!/bin/bash

echo "🚀 启动Spring Boot应用 - 优化SSL配置"

# 设置JVM SSL参数
export JAVA_OPTS="
-Dhttps.protocols=TLSv1.2,TLSv1.3 
-Djdk.tls.client.protocols=TLSv1.2,TLSv1.3
-Dcom.sun.net.ssl.checkRevocation=false
-Dtrust_all_cert=true
-Djsse.enableSNIExtension=false
-Djavax.net.debug=ssl:handshake:verbose
"

echo "JVM SSL参数: $JAVA_OPTS"

# 启动应用
mvn spring-boot:run 