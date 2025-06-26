# 故障排除指南

## 概述

本文档提供了 Miracle Agility 项目常见问题的诊断和解决方案，帮助开发者快速定位和解决技术问题。

## 🔍 环境配置问题

### 问题1：环境切换无效，仍显示Mock数据

#### 症状
- 已将 `utils/config.js` 中的 `environment` 设置为 `'production'`
- 但前端仍然显示模拟数据，不调用后端API

#### 原因分析
1. **小程序缓存问题**: 配置文件修改后没有生效
2. **模块缓存**: require缓存导致配置不更新
3. **全局状态污染**: app.js中的mock状态仍然存在
4. **API URL配置错误**: baseUrl配置重复或错误

#### 解决步骤

##### 步骤1：强制清除缓存
```javascript
// 在微信开发者工具控制台执行
const debug = require('./utils/debug.js')
debug.logDebugInfo()
```

##### 步骤2：检查环境配置
```javascript
// 确认当前环境状态
const config = require('./utils/config.js')
console.log('当前环境:', config.environment)
console.log('是否开发模式:', config.isDevelopment())
console.log('API配置:', config.getCurrentConfig())
```

##### 步骤3：强制切换环境
```javascript
// 强制切换到生产模式
const debug = require('./utils/debug.js')
debug.switchToProduction()
```

##### 步骤4：清除小程序缓存
1. 微信开发者工具 → 工具 → 清除缓存 → 清除所有缓存
2. 重新编译项目
3. 清除模拟登录数据

##### 步骤5：验证配置
确保以下配置正确：

**utils/config.js**:
```javascript
environment: 'production',
production: {
  baseUrl: 'http://localhost:8080', // 不包含 /api
  timeout: 10000
}
```

**API调用**:
```javascript
// API方法应包含 /api 前缀
wxLogin: (loginData) => request('/api/user/wx-login', loginData, 'POST', false)
```

### 问题2：登录后跳转到课程页面

#### 症状
- 点击登录按钮后跳转到课程页面
- 没有停留在个人中心页面

#### 原因分析
- profile页面的 `showLoginRequired` 方法配置了跳转逻辑

#### 解决方案
已修复：取消登录时不跳转，保持在当前页面

### 问题3：后端连接失败

#### 症状
- 前端请求显示网络连接失败
- 控制台显示连接超时或拒绝连接

#### 诊断步骤

##### 检查后端服务状态
```bash
# 检查8080端口是否被占用
lsof -i :8080

# 启动后端服务
cd miracle_agility_backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

##### 测试后端连接
```javascript
// 在小程序控制台测试
const debug = require('./utils/debug.js')
debug.testBackendConnection()
```

##### 检查API接口
```bash
# 直接测试后端接口
curl -X GET http://localhost:8080/api/user/test
```

## 🚀 登录认证问题

### 问题1：微信登录失败

#### 常见错误码
- **40013**: AppID或AppSecret错误
- **40125**: code无效或已过期
- **-1**: 系统繁忙

#### 解决方案

##### 检查微信配置
确保 `application.yml` 中的微信配置正确：
```yaml
miracle:
  wechat:
    mini-program:
      app-id: wx48dc282ebc13fd32
      app-secret: d1869569a8cb366debbbc0c97a39e8f3
```

##### 测试登录流程
```javascript
// 在profile页面测试登录
const auth = require('../../utils/auth.js')
auth.wxLogin({ withUserInfo: true })
  .then(result => console.log('登录成功:', result))
  .catch(error => console.error('登录失败:', error))
```

### 问题2：Token过期或无效

#### 症状
- API请求返回401错误
- 用户需要重新登录

#### 自动解决机制
系统已实现自动token刷新：
1. 检测到401错误时自动调用刷新接口
2. 刷新成功后重新发起原请求
3. 刷新失败时清除登录状态

### 问题3：Session Key重复约束冲突

#### 症状
- 退出登录后重新登录时出现错误：`Duplicate entry for key 'user_sessions.session_key'`
- 错误来自UserSessionMapper.insert方法
- 微信小程序在短时间内返回相同的session_key

#### 原因分析
微信小程序的session_key在短时间内可能重复，而数据库表对session_key设置了UNIQUE约束。登录流程中存在的问题：
1. `revokeAllUserSessions`方法只是将状态改为'revoked'，但没有删除记录
2. 相同的session_key记录仍然存在于数据库中
3. 新会话插入时触发UNIQUE约束冲突

#### 解决方案

##### 方法1：运行自动修复脚本（推荐）
```bash
cd miracle_agility_backend
./scripts/fix_session_key_duplicate.sh
```

##### 方法2：手动清理重复记录

**步骤1：检查重复记录**
```sql
USE miracle_agility;

-- 查看重复的session_key
SELECT session_key, COUNT(*) as count
FROM user_sessions 
GROUP BY session_key 
HAVING COUNT(*) > 1;
```

**步骤2：清理重复记录**
```sql
-- 删除重复记录，保留最新的
DELETE us1 FROM user_sessions us1
INNER JOIN user_sessions us2 
WHERE us1.session_key = us2.session_key 
  AND us1.id < us2.id;

-- 清理过期会话
DELETE FROM user_sessions 
WHERE status IN ('expired', 'revoked') 
  AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

**步骤3：运行数据库迁移**
```bash
mysql -u root -p miracle_agility < src/main/resources/sql/migrations/003_fix_session_key_duplicate.sql
```

#### 验证修复
```bash
# 重启后端服务
cd miracle_agility_backend
mvn spring-boot:run

# 测试登录流程：登录 -> 退出 -> 重新登录
# 确认不再出现session_key重复错误
```

#### 预防措施
后端代码已修改为在插入新会话前自动删除相同session_key的旧记录，防止此问题再次发生。

## 📱 页面显示问题

### 问题1：页面数据不更新

#### 原因分析
- 环境切换后页面缓存旧数据
- onShow生命周期没有重新加载

#### 解决方案
```javascript
// 强制刷新当前页面
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
if (currentPage && currentPage.onShow) {
  currentPage.onShow()
}
```

### 问题2：用户信息显示错误

#### 检查全局状态
```javascript
// 检查全局用户信息
const app = getApp()
console.log('全局登录状态:', app.globalData.isLoggedIn)
console.log('全局用户信息:', app.globalData.userInfo)
```

#### 检查本地存储
```javascript
// 检查本地存储
console.log('本地Token:', wx.getStorageSync('accessToken'))
console.log('本地用户信息:', wx.getStorageSync('userInfo'))
```

## 🔧 开发工具问题

### 问题1：控制台调试命令不可用

#### 解决方案
确保在微信开发者工具的 Console 面板中执行：
```javascript
// 可用的调试命令
const debug = require('./utils/debug.js')
debug.logDebugInfo()           // 显示详细调试信息
debug.switchToProduction()     // 切换到生产模式
debug.switchToDevelopment()    // 切换到开发模式
debug.testBackendConnection()  // 测试后端连接
debug.quickLoginTest()         // 快速登录测试
debug.showDebugPanel()         // 显示调试面板
```

### 问题2：热重载不生效

#### 解决方案
1. 保存文件后等待编译完成
2. 如果不生效，手动点击"编译"按钮
3. 严重情况下重启微信开发者工具

## 🔧 后端问题

### 问题1：数据库字段长度不足错误

#### 症状
- 登录时出现错误：`Data too long for column 'access_token' at row 1`
- JWT token无法正确保存到数据库
- 用户登录失败，显示数据库错误

#### 原因分析
JWT token的长度通常会超过200个字符，特别是包含用户信息和较长的密钥时。原始的`access_token VARCHAR(200)`字段长度不足以存储完整的JWT token。

#### 解决方案

##### 方法1：运行迁移脚本（推荐）
```bash
# 连接到MySQL数据库
mysql -u root -p miracle_agility

# 运行迁移脚本
source miracle_agility_backend/src/main/resources/sql/migrations/001_fix_user_sessions_token_length.sql
```

##### 方法2：手动修改数据库结构
```sql
USE miracle_agility;

-- 修改字段长度
ALTER TABLE user_sessions 
MODIFY COLUMN access_token VARCHAR(512) NOT NULL COMMENT '访问令牌',
MODIFY COLUMN refresh_token VARCHAR(512) DEFAULT NULL COMMENT '刷新令牌';

-- 验证修改结果
DESCRIBE user_sessions;
```

##### 方法3：删除并重建表（谨慎使用）
```sql
-- 备份现有数据（如果需要）
CREATE TABLE user_sessions_backup AS SELECT * FROM user_sessions;

-- 删除旧表
DROP TABLE user_sessions;

-- 重新创建表（使用新的表结构）
source miracle_agility_backend/src/main/resources/sql/01_user_tables.sql
```

#### 验证修复
```bash
# 重启后端服务
cd miracle_agility_backend
mvn spring-boot:run

# 测试登录功能
# 在小程序中尝试登录，应该不再出现数据截断错误
```

### 问题2：MyBatis-Plus软删除SQL语法错误

#### 症状
- 登录时出现SQL语法错误：`You have an error in your SQL syntax`
- 错误SQL形如：`WHERE id=? AND deleted_at=`（deleted_at后面缺少值）
- 错误来自UserMapper.updateById方法

#### 原因分析
MyBatis-Plus的全局逻辑删除配置与LocalDateTime类型的deleted_at字段不兼容，导致生成的SQL语法错误。具体问题：
1. 配置了`logic-delete-value: now()`，但now()函数在此处不能正确工作
2. `@TableLogic`注解与LocalDateTime类型字段的配合有问题
3. MyBatis-Plus尝试生成包含deleted_at条件的SQL时语法错误

#### 解决方案

##### 方法1：运行自动修复脚本（推荐）
```bash
cd miracle_agility_backend
./scripts/fix_mybatis_soft_delete.sh
```

##### 方法2：手动修复配置文件

**步骤1：修改application.yml**
```yaml
# MyBatis-Plus配置
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.miracle.agility.entity
  global-config:
    db-config:
      id-type: auto  # 移除逻辑删除相关配置
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: false
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

**步骤2：修改User实体类**
```java
// 注释掉@TableLogic注解
// @TableLogic
@TableField("deleted_at")
@JsonIgnore
private LocalDateTime deletedAt;
```

**步骤3：运行数据库迁移**
```bash
mysql -u root -p miracle_agility < src/main/resources/sql/migrations/002_fix_mybatis_plus_soft_delete.sql
```

#### 验证修复
```bash
# 重启后端服务
cd miracle_agility_backend
mvn spring-boot:run

# 检查日志确认没有SQL语法错误
# 测试用户登录功能
```

### 问题3：数据库连接失败

#### 检查数据库配置
```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/miracle_agility
    username: root
    password: your_password
```

#### 验证数据库服务
```bash
# 检查MySQL服务状态
brew services list | grep mysql

# 启动MySQL服务
brew services start mysql
```

### 问题4：依赖冲突

#### Maven清理重新构建
```bash
cd miracle_agility_backend
mvn clean install
mvn spring-boot:run
```

## 📋 快速诊断清单

### 环境检查
- [ ] 确认 `config.js` 中 `environment` 设置正确
- [ ] 确认 `baseUrl` 配置无重复路径
- [ ] 清除了微信开发者工具缓存
- [ ] 重新编译了项目

### 后端检查
- [ ] 后端服务在8080端口正常运行
- [ ] 数据库连接正常
- [ ] API接口可以正常访问
- [ ] 微信配置正确

### 前端检查
- [ ] 页面生命周期函数正常执行
- [ ] API请求使用正确的认证头
- [ ] 用户状态管理正常
- [ ] 页面显示符合预期

### 登录检查
- [ ] 微信登录流程完整
- [ ] Token管理正常
- [ ] 权限验证有效
- [ ] 自动刷新机制工作

## 🆘 紧急处理

### 快速恢复开发环境
```javascript
// 紧急重置为开发模式
const app = getApp()
app.switchEnvironment('development')
app.forceDeveloperMode()
```

### 强制清理所有状态
```javascript
// 清理所有缓存和状态
wx.clearStorageSync()
const app = getApp()
app.globalData.isLoggedIn = false
app.globalData.userInfo = null
```

## 📞 获取帮助

### 日志收集
当遇到无法解决的问题时，请提供以下信息：

1. **环境信息**
```javascript
const debug = require('./utils/debug.js')
debug.logDebugInfo()
```

2. **错误日志**
- 控制台错误信息
- 网络请求失败信息
- 后端日志（如有）

3. **操作步骤**
- 详细的复现步骤
- 预期结果和实际结果

### 联系方式
- 技术支持：[技术负责人]
- 项目文档：查看 `docs/` 目录
- 问题反馈：提交Issue到项目仓库

---

*本指南持续更新中，如遇到新问题请及时反馈以完善文档。*

## 4. 登录交互问题

### 问题描述
首次登录时，点击登录按钮后需要第二次点击才能成功登录，用户体验不佳。

### 原因分析
- 登录成功后有1秒延迟才重新加载用户信息
- 页面状态更新不及时，导致用户界面显示滞后
- 用户可能误以为第一次点击无效

### 解决方案

#### 代码修复
1. **优化profile页面登录逻辑** (`pages/profile/profile.js`)：
```javascript
// 修改前
setTimeout(() => {
  this.loadUserInfo()
}, 1000)

// 修改后
// 立即更新登录状态
this.setData({
  isLogin: true,
  userInfo: result.data.userInfo
})

// 检查用户状态和初始化菜单
this.checkUserStatus(result.data.userInfo)
this.initMenuItems()

// 延迟重新加载用户信息（确保完整性）
setTimeout(() => {
  this.loadUserInfo()
}, 500)  // 减少延迟时间
```

2. **优化课程页面登录逻辑** (`pages/course/course.js`)：
```javascript
// 立即更新登录状态
this.setData({
  isLogin: true,
  userInfo: result.data.userInfo
})

// 立即加载课程列表
this.loadCourseList()

// 延迟重新检查登录状态（确保完整性）
setTimeout(() => {
  this.checkLoginStatus()
}, 500)
```

#### 修复效果
- 登录成功后立即更新页面状态
- 减少用户等待时间
- 提升登录体验的流畅度

---

## 5. 环境切换URL错误

### 问题描述
长按头像切换环境进行测试时，出现网络请求失败错误：
```
{errno: 600009, errMsg: "request:fail invalid url "/api/user/wx-login""}
```

### 原因分析
- 环境切换后，`baseUrl`配置可能为空或undefined
- 请求URL拼接时变成相对路径 "/api/user/wx-login"
- 缺少有效性检查导致请求失败

### 解决方案

#### 1. 修复auth.js登录请求
```javascript
// 检查配置有效性
const currentConfig = config.getCurrentConfig()
const baseUrl = currentConfig ? currentConfig.baseUrl : null

if (!baseUrl) {
  console.error('baseUrl配置无效:', currentConfig)
  reject(new Error('网络配置错误，请检查环境设置'))
  return
}

// 构建完整的请求URL
const requestUrl = `${baseUrl}/api/user/wx-login`
console.log('登录请求URL:', requestUrl)
```

#### 2. 改进环境切换逻辑
```javascript
// 验证配置有效性
const currentConfig = config.getCurrentConfig()
if (!currentConfig || !currentConfig.baseUrl) {
  wx.showModal({
    title: '配置错误',
    content: '生产环境配置无效，请检查 utils/config.js 中的 baseUrl 设置',
    showCancel: false
  })
  return null
}
```

#### 3. 优化调试面板界面
- 使用ActionSheet提供更清晰的操作选项
- 显示当前环境状态和API地址
- 提供快速测试功能

#### 使用方法
1. **切换环境**：长按用户头像 → 选择"切换到生产环境"
2. **测试连接**：在调试面板中选择"测试后端连接"
3. **快速登录**：选择"快速登录测试"验证登录流程

#### 注意事项
- 确保 `utils/config.js` 中配置了正确的 `baseUrl`
- 生产环境切换前请确认后端服务可用
- 环境切换会清除当前登录状态，需要重新登录

--- 

## 6. 环境配置优化

### 问题描述
原有的环境配置设计存在混淆，development和production的命名不够清晰，用户模式切换功能受限。

### 新的环境设计

#### 环境类型
- **Mock模式** (`config.environment = 'mock'`)：使用本地Mock数据，支持用户类型切换
- **生产模式** (`config.environment = 'production'`)：使用真实API，同样支持用户类型切换

#### 主要改进
1. **环境命名更清晰**：
   - `development` → `mock`（更直观地表示数据来源）
   - `production` 保持不变（表示真实API环境）

2. **用户模式切换统一**：
   - 两种环境都支持管理员、开发者、普通用户模式切换
   - 长按头像可以进行用户类型切换和访问调试面板

3. **配置方法更新**：
   ```javascript
   // 新方法
   config.isMock()       // 判断是否为Mock模式
   config.isProduction() // 判断是否为生产模式
   
   // 兼容旧方法
   config.isDevelopment() // 等同于 config.isMock()
   ```

#### 使用方式

**在Mock模式下**：
- 长按头像 → 选择用户类型（普通用户/管理员/开发者）
- 长按头像 → 调试面板 → 切换到生产环境

**在生产模式下**：
- 长按头像 → 选择用户类型（如有权限）
- 长按头像 → 调试面板 → 切换到Mock模式/测试连接

#### 配置文件示例
```javascript
// utils/config.js
const config = {
  environment: 'production', // 或 'mock'
  
  apiConfig: {
    mock: {
      baseUrl: '',
      timeout: 5000,
      description: 'Mock数据模式'
    },
    production: {
      baseUrl: 'http://localhost:8080',
      timeout: 10000,
      description: '生产环境API'
    }
  }
}
```

#### 用户类型切换功能
现在两种环境下都可以进行用户类型切换：
1. **普通用户**：基础功能访问权限
2. **管理员**：额外的管理功能菜单
3. **开发者**：包含管理员权限 + 开发工具

--- 

## 7. 个人中心登录状态显示问题

### 问题描述
- 退出登录按钮始终显示，无论是否已登录
- 未登录状态下无法进行登录操作
- 选择"暂不登录"后停留在个人页面，无法返回

### 原因分析
- profile页面缺少登录状态的条件渲染
- 模板中没有根据`isLogin`状态显示不同内容
- 缺少未登录状态下的登录入口

### 解决方案

#### 1. 修改页面模板结构
```xml
<!-- 已登录状态 -->
<view wx:if="{{isLogin}}" class="logged-in-content">
  <!-- 用户信息、统计数据、功能菜单等 -->
  <button class="logout-btn" bindtap="onLogout">退出登录</button>
</view>

<!-- 未登录状态 -->
<view wx:else class="not-logged-in-content">
  <view class="login-prompt">
    <button class="login-btn" bindtap="onWechatLogin">微信一键登录</button>
    <button class="skip-btn" bindtap="onSkipLogin">暂不登录</button>
  </view>
  <!-- 访客功能菜单 -->
</view>
```

#### 2. 添加登录相关方法
- `onWechatLogin()`: 微信一键登录
- `onSkipLogin()`: 跳转到主页
- `mockLogin()`: Mock模式下的模拟登录

#### 3. 初始化登录状态
确保页面数据中正确设置：
```javascript
data: {
  isLogin: false, // 默认未登录
  userInfo: null,
  // ...其他数据
}
```

---

## 8. Mock模式课程数据无法加载

### 问题描述
Mock模式下课程列表请求失败：
```
Error: Mock data not found for /api/course/list
```

### 原因分析
- `mockData.js`中的`getMockData`方法无法正确匹配带`/api`前缀的URL
- API调用路径为`/api/course/list`，但Mock数据路径为`/course/list`
- URL匹配逻辑不完善

### 解决方案

#### 1. 修复URL匹配逻辑
```javascript
getMockData(url, data = {}, method = 'GET') {
  // 去除URL前缀，统一处理
  let cleanUrl = url
  if (url.startsWith('/api/')) {
    cleanUrl = url.replace('/api', '')
  }
  
  // 使用cleanUrl进行数据匹配
  if (cleanUrl.startsWith('/course/')) {
    return this.course[cleanUrl] || null
  }
  // ...其他匹配逻辑
}
```

#### 2. 增强调试信息
```javascript
if (mockResponse !== null && mockResponse !== undefined) {
  console.log(`[MOCK] 响应:`, mockResponse)
  resolve(mockResponse)
} else {
  console.error(`[MOCK] 未找到数据: ${url}`)
  console.log('[MOCK] 可用的课程路径:', Object.keys(mockData.course))
  reject(new Error(`Mock data not found for ${url}`))
}
```

#### 3. 验证Mock数据结构
确保`mockData.js`中包含正确的课程数据：
```javascript
course: {
  '/course/list': [
    {
      id: 1,
      title: '犬敏捷入门基础',
      isEnrolled: true,
      // ...其他字段
    }
  ]
}
```

#### 修复效果
- Mock模式下课程列表正常加载
- 支持带`/api`前缀和不带前缀的URL
- 提供详细的调试信息便于排查问题

--- 

## 9. 退出登录URL错误

### 问题描述
退出登录时出现URL错误：
```
{errno: 600009, errMsg: "request:fail invalid url "undefined/user/logout""}
```

### 原因分析
- `auth.js`中的`logout`方法直接使用了错误的配置属性`config.baseUrl`
- 应该使用`config.getCurrentConfig().baseUrl`获取正确的baseUrl
- 没有处理Mock模式下的退出登录逻辑
- 缺少baseUrl有效性检查

### 解决方案

#### 1. 修复logout方法中的URL配置
```javascript
function logout() {
  return new Promise((resolve, reject) => {
    // 在Mock模式下直接清除本地信息，不发送网络请求
    if (config.isMock()) {
      console.log('Mock模式：直接清除登录信息')
      clearLoginInfo()
      resolve()
      return
    }
    
    const accessToken = getAccessToken()
    
    if (accessToken) {
      // 检查配置有效性
      const currentConfig = config.getCurrentConfig()
      const baseUrl = currentConfig ? currentConfig.baseUrl : null
      
      if (!baseUrl) {
        console.warn('baseUrl配置无效，直接清除本地登录信息')
        clearLoginInfo()
        resolve()
        return
      }
      
      const logoutUrl = `${baseUrl}/api/user/logout`
      // ...发送请求
    }
  })
}
```

#### 2. 修复refreshAccessToken方法
同样需要修复刷新令牌方法中的URL配置问题：
```javascript
function refreshAccessToken() {
  // 检查配置有效性
  const currentConfig = config.getCurrentConfig()
  const baseUrl = currentConfig ? currentConfig.baseUrl : null
  
  if (!baseUrl) {
    console.error('refreshAccessToken: baseUrl配置无效')
    reject(new Error('网络配置错误，请检查环境设置'))
    return
  }
  
  const refreshUrl = `${baseUrl}/api/user/refresh-token`
  // ...发送请求
}
```

#### 3. 优化页面退出登录逻辑
在页面中添加更好的错误处理和状态更新：
```javascript
onLogout() {
  wx.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        wx.showLoading({ title: '退出中...' })
        
        if (config.isMock()) {
          // Mock模式处理
          // ...清除本地数据和更新页面状态
        } else {
          // 生产模式处理
          auth.logout()
            .then(() => {
              // 更新页面状态
            })
            .catch((error) => {
              // 即使退出请求失败，也清除本地数据
            })
        }
      }
    }
  })
}
```

#### 修复效果
- Mock模式下直接清除本地信息，不发送网络请求
- 生产模式下正确构建退出登录URL
- 添加配置有效性检查，避免undefined URL
- 即使网络请求失败也能正常清除本地登录状态
- 提供更好的用户反馈和错误处理

--- 