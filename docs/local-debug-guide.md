# 本地前后端调试指南

## 概述

本指南将帮助你快速搭建 Miracle Agility 项目的本地开发调试环境，包括前端微信小程序和后端Spring Boot服务的联调。

## 环境准备

### 1. 基础软件要求

- **Java**: JDK 17 或以上
- **Maven**: 3.6 或以上  
- **MySQL**: 8.0 或以上
- **Node.js**: 16 或以上（可选，用于某些工具）
- **微信开发者工具**: 最新版本

### 2. MySQL数据库准备

```bash
# 1. 启动MySQL服务
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# 2. 登录MySQL
mysql -u root -p

# 3. 创建数据库
CREATE DATABASE miracle_agility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 4. 创建用户表（如果还没创建）
USE miracle_agility;
SOURCE /path/to/miracle_agility_backend/src/main/resources/sql/01_user_tables.sql;
```

## 后端服务启动

### 1. 配置数据库连接

编辑 `miracle_agility_backend/src/main/resources/application-dev.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/miracle_agility?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_mysql_password  # 替换为你的MySQL密码
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 2. 配置微信小程序信息

在同一文件中配置你的微信小程序信息：

```yaml
wechat:
  mini-program:
    app-id: wx1234567890abcdef  # 替换为你的AppID
    app-secret: your_app_secret_here  # 替换为你的AppSecret
    api-url: https://api.weixin.qq.com
```

**获取微信小程序配置的方法**：
1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入你的小程序管理后台
3. 在"开发" -> "开发管理" -> "开发设置"中找到AppID和AppSecret

### 3. 启动后端服务

```bash
# 方法1: 使用Maven启动
cd miracle_agility_backend
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 方法2: 使用IDE启动
# 在IDE中设置启动参数: --spring.profiles.active=dev
# 然后运行MiracleAgilityApplication.java

# 方法3: 使用命令行运行jar包
mvn clean package
java -jar target/miracle-agility-backend-1.0.0.jar --spring.profiles.active=dev
```

### 4. 验证后端启动

访问健康检查接口：
```bash
curl http://localhost:8080/api/health
```

应该返回类似：
```json
{
  "status": "UP",
  "message": "Miracle Agility Backend is running"
}
```

## 前端小程序调试

### 1. 打开微信开发者工具

1. 启动微信开发者工具
2. 导入项目，选择 `miracle_agility` 目录
3. 填入你的AppID（与后端配置一致）

### 2. 配置前端环境

前端默认运行在开发模式（使用Mock数据），需要切换到生产模式连接后端：

#### 方法1: 通过调试面板切换（推荐）

1. 在小程序中进入"我的"页面
2. **长按头像**，会弹出调试面板
3. 点击"切换环境"按钮
4. 选择"测试连接"验证后端连接

#### 方法2: 通过控制台切换

在微信开发者工具的控制台中输入：
```javascript
// 切换到生产环境（连接后端）
switchToProduction()

// 测试后端连接
testBackendConnection()

// 查看当前环境状态
getCurrentEnvironment()

// 切换回开发环境（Mock数据）
switchToDevelopment()
```

#### 方法3: 直接修改配置文件

编辑 `utils/config.js`:
```javascript
const config = {
  environment: 'production', // 改为production连接后端
  // ...其他配置
}
```

### 3. 验证前后端连接

1. **健康检查**：在调试面板中点击"测试连接"
2. **登录测试**：在调试面板中点击"快速登录测试"
3. **手动登录**：进入个人中心页面，触发登录流程

## 调试技巧

### 1. 查看调试信息

应用启动后会自动在控制台输出调试信息：
```
🛠️  Miracle Agility 调试信息
=====================================
environment: production
isDevelopment: false  
isProduction: true
baseUrl: http://localhost:8080/api
timeout: 10000
loginStatus: false
userInfo: null

📋 可用的调试命令:
- switchToProduction() : 切换到生产环境
- switchToDevelopment() : 切换到开发环境
- testBackendConnection() : 测试后端连接
- quickLoginTest() : 快速登录测试
- showDebugPanel() : 显示调试面板
- getCurrentEnvironment() : 获取环境状态
```

### 2. 网络请求调试

在微信开发者工具中：
1. 打开"Network"面板
2. 执行登录操作
3. 查看请求和响应详情

### 3. 后端日志查看

后端启动时会输出详细的调试日志：
```
2024-12-19 10:30:15 [main] INFO  c.m.a.MiracleAgilityApplication - Starting MiracleAgilityApplication
2024-12-19 10:30:16 [main] DEBUG c.m.a.config.MyBatisPlusConfig - MyBatis-Plus配置加载完成
2024-12-19 10:30:17 [main] INFO  o.s.b.w.embedded.tomcat.TomcatWebServer - Tomcat started on port(s): 8080 (http)
```

## 常见问题解决

### 1. 后端启动失败

**问题**: 数据库连接失败
```
com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure
```

**解决方案**:
1. 检查MySQL是否启动：`systemctl status mysql`
2. 验证数据库配置：用户名、密码、端口
3. 确认数据库已创建：`SHOW DATABASES;`

**问题**: 端口被占用
```
Port 8080 was already in use
```

**解决方案**:
1. 查看占用端口的进程：`lsof -i :8080`
2. 杀死进程：`kill -9 <PID>`
3. 或者修改端口：在application-dev.yml中修改`server.port`

### 2. 前端连接失败

**问题**: 无法连接后端
```
❌ 后端连接失败: fail to fetch
```

**解决方案**:
1. 确认后端服务已启动
2. 检查防火墙设置
3. 验证请求域名配置（微信开发者工具 -> 详情 -> 本地设置 -> 不校验合法域名）

**问题**: 微信登录失败
```
微信登录失败: errcode=40013, errmsg=invalid appid
```

**解决方案**:
1. 确认AppID配置正确
2. 检查AppSecret是否匹配
3. 确认小程序已发布或在开发版本中

### 3. 调试面板无法显示

**问题**: 长按头像没有反应

**解决方案**:
1. 确认已引入debug模块：`const debug = require('../../utils/debug.js')`
2. 检查控制台是否有错误信息
3. 尝试在控制台直接调用：`showDebugPanel()`

## 开发流程建议

### 1. 前端开发阶段
- 使用开发模式（Mock数据）进行UI和交互开发
- 通过`switchToDevelopment()`快速切换到Mock模式

### 2. 联调测试阶段  
- 切换到生产模式连接后端
- 使用`testBackendConnection()`验证连接
- 使用`quickLoginTest()`测试登录流程

### 3. 功能验证阶段
- 完整测试用户登录、权限、数据交互
- 检查网络请求的正确性
- 验证错误处理机制

## 高级调试技巧

### 1. 数据库直接查询

```sql
-- 查看用户表
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 查看会话表  
SELECT * FROM user_sessions WHERE status = 'active';

-- 清除测试数据
DELETE FROM user_sessions WHERE user_id = 1;
DELETE FROM users WHERE openid LIKE 'test_%';
```

### 2. JWT令牌解析

可以使用在线工具 [jwt.io](https://jwt.io) 解析JWT令牌内容。

### 3. 微信API测试

```bash
# 测试微信登录接口
curl "https://api.weixin.qq.com/sns/jscode2session?appid=YOUR_APPID&secret=YOUR_SECRET&js_code=TEST_CODE&grant_type=authorization_code"
```

## 部署准备

开发完成后，准备部署时需要：

1. **修改生产环境配置**：
   - 数据库地址改为生产数据库
   - API地址改为生产域名
   - 关闭调试模式

2. **小程序发布准备**：
   - 配置合法域名
   - 上传代码并提交审核
   - 配置服务器证书

---

通过以上步骤，你应该能够成功搭建本地开发调试环境。如有问题，请查看控制台错误信息或参考常见问题解决方案。 