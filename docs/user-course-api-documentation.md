# 用户课程管理和授权码系统 API 文档

本文档描述了用户课程关联和授权码功能的所有API接口。

## 版本信息
- 版本: v1.0
- 更新时间: 2024-12-19
- 状态: 新增功能

## 认证说明
所有API都需要在Header中包含用户访问令牌：
```
Authorization: Bearer {access_token}
```

## 用户管理相关接口

### 1. 获取所有用户列表（管理员）
- **URL**: `/admin/users/list`
- **方法**: GET
- **权限**: 管理员
- **描述**: 获取所有用户及其注册的课程信息

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "userId": 1,
      "nickname": "用户昵称",
      "avatarUrl": "头像URL",
      "phone": "手机号",
      "email": "邮箱",
      "courseCount": 3,
      "courses": [
        {
          "courseId": 1,
          "courseTitle": "课程标题",
          "progress": 75,
          "registrationType": "code",
          "createdAt": "2024-12-19T10:00:00",
          "isCompleted": false
        }
      ]
    }
  ]
}
```

### 2. 获取用户详情（管理员）
- **URL**: `/admin/users/{userId}/detail`
- **方法**: GET
- **权限**: 管理员
- **描述**: 获取指定用户的详细信息和课程学习情况

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userInfo": {
      "id": 1,
      "nickname": "用户昵称",
      "avatarUrl": "头像URL",
      "phone": "手机号",
      "email": "邮箱",
      "role": "user",
      "level": "新手",
      "createdAt": "2024-12-01T10:00:00"
    },
    "courses": [
      {
        "courseId": 1,
        "courseTitle": "课程标题",
        "courseCover": "课程封面",
        "progress": 75,
        "totalStudyMinutes": 180,
        "registrationType": "code",
        "isCompleted": false,
        "createdAt": "2024-12-15T10:00:00",
        "lastStudyTime": "2024-12-18T15:30:00"
      }
    ]
  }
}
```

### 3. 获取用户统计信息（管理员）
- **URL**: `/admin/users/statistics`
- **方法**: GET
- **权限**: 管理员
- **描述**: 获取用户和课程的统计数据

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalUsers": 1250,
    "totalRegistrations": 3800,
    "completedCourses": 1900,
    "completionRate": 50.0
  }
}
```

## 授权码管理相关接口

### 1. 生成课程授权码（管理员）
- **URL**: `/courses/access-codes/generate`
- **方法**: POST
- **权限**: 管理员
- **描述**: 为指定课程生成新的授权码

**请求参数**:
```json
{
  "courseId": 1,
  "description": "授权码描述",
  "usageLimit": 1,
  "validFrom": "2024-12-19T00:00:00",
  "validUntil": "2024-12-31T23:59:59"
}
```

**参数说明**:
- `courseId`: 课程ID（必填）
- `description`: 授权码描述（可选）
- `usageLimit`: 使用次数限制，null表示无限制（可选，默认1）
- `validFrom`: 有效期开始时间（可选）
- `validUntil`: 有效期结束时间（可选）

**响应示例**:
```json
{
  "code": 200,
  "message": "授权码生成成功",
  "data": {
    "id": 1,
    "code": "ABC123XY",
    "courseId": 1,
    "createdBy": 1,
    "description": "授权码描述",
    "usageLimit": 1,
    "usedCount": 0,
    "status": "active",
    "createdAt": "2024-12-19T10:00:00"
  }
}
```

### 2. 获取课程的所有授权码（管理员）
- **URL**: `/courses/access-codes/course/{courseId}`
- **方法**: GET
- **权限**: 管理员
- **描述**: 获取指定课程的所有授权码

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "code": "ABC123XY",
      "courseId": 1,
      "description": "授权码描述",
      "usageLimit": 1,
      "usedCount": 0,
      "status": "active",
      "usedByNickname": null,
      "createdByNickname": "管理员",
      "createdAt": "2024-12-19T10:00:00"
    }
  ]
}
```

### 3. 获取所有授权码（管理员）
- **URL**: `/courses/access-codes/admin/list`
- **方法**: GET
- **权限**: 管理员
- **描述**: 获取系统中的所有授权码

### 4. 兑换授权码注册课程（用户）
- **URL**: `/courses/access-codes/redeem`
- **方法**: POST
- **权限**: 已登录用户
- **描述**: 使用授权码注册课程

**请求参数**:
```json
{
  "code": "ABC123XY"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "授权码兑换成功",
  "data": {
    "message": "课程注册成功",
    "courseId": 1,
    "registrationId": 1
  }
}
```

**错误响应示例**:
```json
{
  "code": 400,
  "message": "兑换失败: 授权码不存在"
}
```

### 5. 验证授权码信息
- **URL**: `/courses/access-codes/validate/{code}`
- **方法**: GET
- **权限**: 无需认证
- **描述**: 验证授权码是否有效（不消耗使用次数）

**响应示例**:
```json
{
  "code": 200,
  "message": "授权码信息",
  "data": {
    "code": "ABC123XY",
    "courseId": 1,
    "courseTitle": "课程标题",
    "isUsable": true,
    "status": "active",
    "usageLimit": 1,
    "usedCount": 0,
    "validUntil": "2024-12-31T23:59:59"
  }
}
```

### 6. 禁用授权码（管理员）
- **URL**: `/courses/access-codes/{codeId}/disable`
- **方法**: PUT
- **权限**: 管理员
- **描述**: 禁用指定的授权码

### 7. 启用授权码（管理员）
- **URL**: `/courses/access-codes/{codeId}/enable`
- **方法**: PUT
- **权限**: 管理员
- **描述**: 启用指定的授权码

### 8. 删除授权码（管理员）
- **URL**: `/courses/access-codes/{codeId}`
- **方法**: DELETE
- **权限**: 管理员
- **描述**: 删除指定的授权码

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 授权码状态说明

| 状态 | 说明 |
|------|------|
| active | 有效，可以使用 |
| used | 已使用完毕 |
| expired | 已过期 |
| disabled | 已被禁用 |

## 注册方式说明

| 类型 | 说明 |
|------|------|
| direct | 直接注册 |
| code | 通过授权码注册 |
| gift | 赠送注册 |

## 使用示例

### 管理员生成授权码的完整流程

1. **生成授权码**:
```javascript
const response = await api.request('/courses/access-codes/generate', {
  courseId: 1,
  description: '新用户专享',
  usageLimit: 1
}, 'POST')
```

2. **分享授权码给用户**: `ABC123XY`

3. **用户兑换授权码**:
```javascript
const response = await api.request('/courses/access-codes/redeem', {
  code: 'ABC123XY'
}, 'POST')
```

### 前端集成示例

**小程序端兑换授权码**:
```javascript
// 在course页面中添加兑换功能
async redeemAccessCode(code) {
  try {
    const response = await api.request('/courses/access-codes/redeem', {
      code: code
    }, 'POST')
    
    if (response.code === 200) {
      wx.showToast({
        title: '兑换成功！',
        icon: 'success'
      })
      // 跳转到课程详情页
      wx.navigateTo({
        url: `/pages/course-detail/course-detail?id=${response.data.courseId}`
      })
    }
  } catch (error) {
    wx.showToast({
      title: error.message || '兑换失败',
      icon: 'none'
    })
  }
}
```

## 注意事项

1. **授权码唯一性**: 每个授权码都是全局唯一的8位字符串
2. **使用次数**: 授权码可以设置使用次数限制，达到限制后自动标记为已使用
3. **有效期**: 可以为授权码设置有效期，过期后无法使用
4. **重复注册**: 用户不能重复注册同一门课程
5. **权限控制**: 只有管理员可以生成和管理授权码
6. **日志记录**: 所有授权码的生成和使用都会记录详细日志

## 数据库表结构

### user_courses 表
```sql
CREATE TABLE user_courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    registration_type VARCHAR(20) DEFAULT 'direct',
    source_code_id BIGINT NULL,
    progress INT DEFAULT 0,
    -- 其他字段...
);
```

### course_access_codes 表
```sql
CREATE TABLE course_access_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL UNIQUE,
    course_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    usage_limit INT NULL,
    used_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    -- 其他字段...
);
``` 