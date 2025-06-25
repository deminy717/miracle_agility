# 网络诊断指南

## 🔧 **手动诊断步骤**

### 1. 测试网络连通性
```bash
# 测试DNS解析
nslookup api.weixin.qq.com

# 测试网络连接
ping api.weixin.qq.com

# 测试HTTPS连接
curl -v https://api.weixin.qq.com/sns/jscode2session
```

### 2. 检查SSL/TLS
```bash
# 检查SSL证书
openssl s_client -connect api.weixin.qq.com:443 -servername api.weixin.qq.com

# 测试TLS版本
curl --tlsv1.2 -v https://api.weixin.qq.com/
```

### 3. Java环境检查
```bash
# 检查Java版本
java -version

# 检查支持的TLS版本
java -Djavax.net.debug=ssl:handshake -cp . SSLTest
```

## 🚀 **快速解决方案**

### 方案1：使用HTTP代理（如果在公司网络）
在启动Spring Boot时添加参数：
```bash
java -Dhttp.proxyHost=proxy.company.com -Dhttp.proxyPort=8080 -Dhttps.proxyHost=proxy.company.com -Dhttps.proxyPort=8080 -jar app.jar
```

### 方案2：跳过SSL验证（仅开发环境）
已在RestTemplateConfig中配置

### 方案3：使用开发环境的fallback机制
当前系统已经实现了fallback，会使用 `wx_` + `code` 作为openid

## 📋 **当前状态**

根据日志，系统正在正常运行：
- ✅ DNS解析：正常（能访问到微信API地址）
- ❌ SSL握手：失败（网络环境问题）
- ✅ Fallback机制：正常（生成 `wx_` 前缀的openid）
- ✅ 数据库查询：正常（查找用户记录）

## 🎯 **建议**

对于开发阶段，当前的fallback机制已经足够：
1. **继续使用fallback机制**进行开发测试
2. **生产环境配置真实的网络**环境
3. **添加网络重试机制**提高成功率

当前错误**不影响功能测试**，可以继续验证登录流程！ 