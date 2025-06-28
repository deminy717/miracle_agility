# 用户登录功能指南

## 概述

本文档描述了 Miracle Agility 微信小程序的用户登录功能实现，包括前端认证模块、后端API接口和数据库设计。

## 技术架构

### 前端架构
- **认证模块**: `utils/auth.js` - 处理微信登录、令牌管理、权限验证
- **API模块**: `utils/api.js` - 集成认证功能的HTTP请求封装
- **页面集成**: `pages/profile/profile.js` - 用户登录界面和状态管理

### 后端架构
- **框架**: Spring Boot + MyBatis-Plus
- **数据库**: MySQL 8.0
- **认证方式**: JWT (JSON Web Token)
- **微信集成**: 微信小程序登录API

## 数据库设计

### 核心表结构

#### 1. 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    real_name VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user' COMMENT '用户角色',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '用户状态',
    level VARCHAR(20) DEFAULT '新手' COMMENT '用户等级',
    experience_points INT DEFAULT 0 COMMENT '经验值',
    total_study_time INT DEFAULT 0 COMMENT '总学习时长(分钟)',
    last_login_time DATETIME DEFAULT NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
    registration_source VARCHAR(50) DEFAULT 'wechat' COMMENT '注册来源',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at DATETIME DEFAULT NULL COMMENT '删除时间(软删除)'
);
```

#### 2. 用户会话表 (user_sessions)
```sql
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    session_key VARCHAR(100) NOT NULL UNIQUE COMMENT '微信会话密钥',
    access_token VARCHAR(512) NOT NULL COMMENT '访问令牌',
    refresh_token VARCHAR(512) DEFAULT NULL COMMENT '刷新令牌',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    client_ip VARCHAR(45) DEFAULT NULL COMMENT '客户端IP',
    user_agent TEXT DEFAULT NULL COMMENT '用户代理信息',
    device_info JSON DEFAULT NULL COMMENT '设备信息',
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active' COMMENT '会话状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
```

## API接口设计

### 基础接口规范

所有API响应遵循统一格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 核心接口

#### 1. 微信小程序登录
**接口地址**: `POST /api/user/wx-login`

**请求参数**:
```json
{
  "code": "微信登录凭证",
  "nickname": "用户昵称(可选)",
  "avatarUrl": "头像URL(可选)", 
  "gender": 1,
  "deviceModel": "设备型号",
  "deviceSystem": "系统版本",
  "deviceVersion": "设备版本",
  "clientVersion": "客户端版本"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "访问令牌",
    "refreshToken": "刷新令牌", 
    "expiresIn": 7200,
    "isNewUser": false,
    "userInfo": {
      "id": 1,
      "openid": "微信OpenID",
      "nickname": "用户昵称",
      "avatarUrl": "头像URL",
      "role": "user",
      "status": "active",
      "level": "新手",
      "isAdmin": false,
      "isDeveloper": false
    }
  }
}
```

#### 2. 刷新访问令牌
**接口地址**: `POST /api/user/refresh-token`

**请求参数**:
```json
{
  "refreshToken": "刷新令牌"
}
```

#### 3. 获取用户信息
**接口地址**: `GET /api/user/info`

**请求头**: `Authorization: Bearer {accessToken}`

#### 4. 用户登出
**接口地址**: `POST /api/user/logout`

**请求头**: `Authorization: Bearer {accessToken}`

## 前端实现

### 认证模块核心方法

#### 微信登录
```javascript
const auth = require('../../utils/auth.js')

// 执行登录
auth.wxLogin({ withUserInfo: true })
  .then((result) => {
    console.log('登录成功:', result)
    if (result.isNewUser) {
      // 新用户处理逻辑
    }
  })
  .catch((error) => {
    console.error('登录失败:', error)
  })
```

#### 检查登录状态
```javascript
if (auth.checkLoginStatus()) {
  // 用户已登录
  const userInfo = auth.getCurrentUser()
} else {
  // 需要登录
}
```

#### 权限检查
```javascript
if (auth.hasPermission('admin')) {
  // 管理员权限
}
```

### API请求集成

所有需要认证的API请求会自动添加Authorization头：

```javascript
const api = require('../../utils/api.js')

// 自动添加认证头的请求
api.getUserInfo()  // 自动添加 Bearer token
  .then(userInfo => {
    // 处理用户信息
  })
  .catch(error => {
    // 错误处理，包括自动令牌刷新
  })
```

## 安全特性

### 令牌管理
- **访问令牌**: 2小时过期，用于API认证
- **刷新令牌**: 7天过期，用于获取新的访问令牌
- **自动刷新**: 访问令牌过期时自动使用刷新令牌获取新令牌

### 会话管理
- 支持多设备登录
- 登出时撤销所有会话
- 定期清理过期会话

### 数据安全
- 密码使用SHA256+盐值加密
- JWT令牌包含用户ID和OpenID
- 所有敏感操作记录操作日志

## 环境配置

### application.yml 配置
```yaml
# 微信小程序配置
wechat:
  mini-program:
    app-id: ${WECHAT_APP_ID:your_app_id}
    app-secret: ${WECHAT_APP_SECRET:your_app_secret}
    api-url: https://api.weixin.qq.com

# JWT配置  
jwt:
  secret: ${JWT_SECRET:miracle_agility_jwt_secret_key_2024}
  access-token-expiration: 7200 # 2小时（秒）
  refresh-token-expiration: 604800 # 7天（秒）
```

### 环境变量
```bash
# 微信小程序配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 数据库配置
MYSQL_URL=jdbc:mysql://localhost:3306/miracle_agility
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password
```

## 部署说明

### 数据库初始化
```bash
# 执行SQL脚本
mysql -u root -p < miracle_agility_backend/src/main/resources/sql/01_user_tables.sql
```

### 后端启动
```bash
cd miracle_agility_backend
mvn spring-boot:run
```

### 小程序配置
在微信开发者工具中配置：
1. 设置服务器域名
2. 配置业务域名
3. 上传代码并发布

## 测试指南

### 单元测试
```bash
# 运行所有测试
mvn test

# 运行特定测试
mvn test -Dtest=UserServiceTest
```

### 接口测试
使用Postman或curl测试API接口：

```bash
# 登录测试
curl -X POST http://localhost:8080/api/user/wx-login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code","nickname":"测试用户"}'

# 获取用户信息测试  
curl -X GET http://localhost:8080/api/user/info \
  -H "Authorization: Bearer {access_token}"
```

## 常见问题

### Q1: 微信登录失败怎么办？
A: 检查微信小程序配置，确保APP_ID和APP_SECRET正确配置。

### Q2: JWT令牌过期如何处理？
A: 前端会自动使用刷新令牌获取新的访问令牌，无需用户重新登录。

### Q3: 如何切换开发和生产环境？
A: 在`utils/config.js`中配置不同的环境参数，或使用环境变量。

## 更新日志

### v1.0.0 (2024-12-19)
- 实现微信小程序登录功能
- 集成JWT令牌认证
- 完成用户权限管理
- 添加会话管理机制
- 支持自动令牌刷新

---

更多技术细节请参考：
- [API文档](./api-documentation.md)
- [数据库设计](./database-schema.md)
- [技术架构](./technical-architecture.md) 