# Miracle Agility API 接口文档

## API 概览
本文档描述了Miracle Agility小程序的所有API接口，包括请求参数、响应格式、错误处理等。

### 接口分类
1. **用户相关接口** - 用户登录、信息获取、更新等
2. **课程相关接口** - 课程列表、详情、内容、进度等
3. **文章/资讯相关接口** - 文章列表、详情、互动等
4. **内容发布接口** - 发布文章、课程等
5. **文件上传接口** - 图片、视频上传
6. **成就系统接口** - 成就列表、解锁等
7. **统计数据接口** - 学习统计等
8. **管理员接口** - 内容管理、用户管理、系统管理等
9. **收藏和学习记录接口** - 收藏列表、学习记录、进度等
10. **搜索接口** - 全局搜索、搜索建议等
11. **通知和消息接口** - 通知列表、已读标记等
12. **反馈和举报接口** - 用户反馈、内容举报等
13. **支付相关接口** - 订单创建、状态查询等
14. **富文本编辑器接口** - 草稿保存、管理等
15. **授权码管理接口** - 课程授权码生成、查看、管理等

## 基础配置

### 接口地址
- **开发环境**: 使用Mock数据，无需真实接口
- **测试环境**: `https://test-api.miracle-agility.com`
- **生产环境**: `https://api.miracle-agility.com`

### 请求格式
- **Content-Type**: `application/json`
- **请求方法**: 主要使用 `POST`，部分使用 `GET`
- **认证方式**: Header中携带 `auth` 字段

### 响应格式
```json
{
  "error": 0,          // 错误码，0表示成功
  "message": "success", // 响应消息
  "body": {}           // 响应数据
}
```

### 错误码说明
- `0`: 请求成功
- `400`: 参数错误
- `401`: 需要登录
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 1. 用户相关接口

### 1.1 用户登录
**接口地址**: `/user/login`  
**请求方法**: `POST`  
**是否需要认证**: 否

**请求参数**:
```json
{
  "code": "string"  // 微信登录凭证
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "登录成功",
  "body": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
      "nickname": "用户昵称",
      "avatar": "https://wx.qlogo.cn/mmopen/...",
      "role": "user"  // user/admin/teacher
    }
  }
}
```

### 1.2 获取用户信息
**接口地址**: `/user/info`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**: 无

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "https://wx.qlogo.cn/mmopen/...",
    "role": "user",
    "studyStats": {
      "totalCourses": 5,
      "completedCourses": 2,
      "totalStudyTime": 3600,
      "achievements": 8
    }
  }
}
```

### 1.3 更新用户信息
**接口地址**: `/user/update`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "nickname": "string",  // 可选
  "avatar": "string"     // 可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "更新成功",
  "body": {}
}
```

## 2. 课程相关接口

### 2.1 获取课程列表
**接口地址**: `/course/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "page": 1,          // 页码，默认1
  "limit": 10,        // 每页数量，默认10
  "category": "string" // 课程分类，可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "犬敏捷基础训练",
        "description": "适合初学者的基础敏捷训练课程",
        "cover": "https://example.com/cover.jpg",
        "teacher": "张教练",
        "price": 299.00,
        "originalPrice": 399.00,
        "duration": "6周",
        "level": "初级",
        "studentCount": 128,
        "rating": 4.8,
        "tags": ["基础", "入门", "实用"],
        "createdAt": "2024-03-01T00:00:00Z"
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

### 2.2 获取课程详情
**接口地址**: `/course/detail`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "courseId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "id": 1,
    "title": "犬敏捷基础训练",
    "description": "详细的课程介绍...",
    "cover": "https://example.com/cover.jpg",
    "teacher": {
      "id": 1,
      "name": "张教练",
      "avatar": "https://example.com/teacher.jpg",
      "bio": "资深犬敏捷训练师，10年教学经验"
    },
    "price": 299.00,
    "chapters": [
      {
        "id": 1,
        "title": "第一章：基础概念",
        "lessons": [
          {
            "id": 1,
            "title": "什么是犬敏捷运动",
            "duration": 600,
            "type": "video",
            "isFree": true
          }
        ]
      }
    ],
    "requirements": ["6个月以上健康犬只", "基础服从训练"],
    "objectives": ["掌握基础敏捷技能", "提升犬只协调性"],
    "isPurchased": false,
    "progress": 0
  }
}
```

### 2.3 获取课时内容
**接口地址**: `/lesson/content`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "lessonId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "id": 1,
    "title": "什么是犬敏捷运动",
    "content": {
      "type": "video",
      "videoUrl": "https://example.com/video.mp4",
      "transcript": "课程文字稿...",
      "materials": [
        {
          "title": "课程资料",
          "url": "https://example.com/material.pdf"
        }
      ]
    },
    "exercises": [
      {
        "question": "犬敏捷运动起源于哪个国家？",
        "options": ["美国", "英国", "德国", "法国"],
        "answer": 1
      }
    ]
  }
}
```

### 2.4 更新学习进度
**接口地址**: `/lesson/progress`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "lessonId": 1,
  "progress": 80  // 学习进度百分比
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "进度已更新",
  "body": {}
}
```

## 3. 文章/资讯相关接口

### 3.1 获取文章列表
**接口地址**: `/news/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "category": "string"  // 文章分类，可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "春季敏捷训练营即将开始！",
        "summary": "为期6周的专业训练课程...",
        "cover": "https://example.com/cover.jpg",
        "category": "训练技巧",
        "author": "张教练",
        "publishTime": "2024-03-15T08:00:00Z",
        "readCount": 328,
        "likeCount": 56,
        "isLiked": false,
        "isCollected": false
      }
    ],
    "total": 50,
    "hasMore": true
  }
}
```

### 3.2 获取文章详情
**接口地址**: `/news/detail`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "newsId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "id": 1,
    "title": "春季敏捷训练营即将开始！",
    "content": "<p>详细的文章内容...</p>",
    "cover": "https://example.com/cover.jpg",
    "category": "训练技巧",
    "author": {
      "id": 1,
      "name": "张教练",
      "avatar": "https://example.com/avatar.jpg"
    },
    "publishTime": "2024-03-15T08:00:00Z",
    "readCount": 329,
    "likeCount": 56,
    "isLiked": false,
    "isCollected": false,
    "tags": ["训练", "春季", "基础"],
    "relatedArticles": [
      {
        "id": 2,
        "title": "相关文章标题",
        "cover": "https://example.com/cover2.jpg"
      }
    ]
  }
}
```

### 3.3 文章点赞
**接口地址**: `/news/like`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "newsId": 1,
  "action": "like"  // like/unlike
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "操作成功",
  "body": {
    "likeCount": 57,
    "isLiked": true
  }
}
```

### 3.4 文章收藏
**接口地址**: `/news/collect`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "newsId": 1,
  "action": "collect"  // collect/uncollect
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "收藏成功",
  "body": {
    "isCollected": true
  }
}
```

## 4. 内容发布接口

### 4.1 发布文章
**接口地址**: `/content/article/create`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "title": "文章标题",
  "content": "<p>文章内容...</p>",
  "summary": "文章摘要",
  "cover": "https://example.com/cover.jpg",
  "category": "训练技巧",
  "tags": ["标签1", "标签2"],
  "status": "draft"  // draft/published
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "发布成功",
  "body": {
    "id": 123,
    "status": "published"
  }
}
```

### 4.2 发布课程
**接口地址**: `/content/course/create`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "title": "课程标题",
  "description": "课程描述",
  "cover": "https://example.com/cover.jpg",
  "price": 299.00,
  "level": "初级",
  "duration": "6周",
  "chapters": [
    {
      "title": "章节标题",
      "lessons": [
        {
          "title": "课时标题",
          "type": "video",
          "content": "课时内容"
        }
      ]
    }
  ]
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "课程创建成功",
  "body": {
    "id": 456,
    "status": "pending"
  }
}
```

## 5. 文件上传接口

### 5.1 图片上传
**接口地址**: `/upload/image`  
**请求方法**: `POST`  
**是否需要认证**: 是  
**Content-Type**: `multipart/form-data`

**请求参数**:
- `file`: 图片文件
- `type`: 上传类型 (avatar/cover/content)

**响应数据**:
```json
{
  "error": 0,
  "message": "上传成功",
  "body": {
    "url": "https://example.com/images/uploaded.jpg",
    "filename": "uploaded.jpg",
    "size": 102400
  }
}
```

### 5.2 视频上传
**接口地址**: `/upload/video`  
**请求方法**: `POST`  
**是否需要认证**: 是  
**Content-Type**: `multipart/form-data`

**请求参数**:
- `file`: 视频文件
- `type`: 上传类型 (lesson/demo)

**响应数据**:
```json
{
  "error": 0,
  "message": "上传成功",
  "body": {
    "url": "https://example.com/videos/uploaded.mp4",
    "thumbnail": "https://example.com/thumbnails/uploaded.jpg",
    "duration": 300,
    "size": 10485760
  }
}
```

## 6. 成就系统接口

### 6.1 获取成就列表
**接口地址**: `/achievement/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**: 无

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": [
    {
      "id": 1,
      "title": "初学者",
      "description": "完成第一个课程",
      "icon": "https://example.com/achievement1.png",
      "isUnlocked": true,
      "unlockedAt": "2024-03-15T10:00:00Z"
    }
  ]
}
```

### 6.2 解锁成就
**接口地址**: `/achievement/unlock`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "achievementId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "成就解锁成功",
  "body": {
    "achievement": {
      "id": 1,
      "title": "初学者",
      "description": "完成第一个课程"
    }
  }
}
```

## 7. 统计数据接口

### 7.1 获取学习统计
**接口地址**: `/stats/study`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**: 无

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "totalCourses": 5,
    "completedCourses": 2,
    "totalStudyTime": 3600,
    "studyDays": 15,
    "achievements": 8,
    "weeklyStats": [
      {
        "date": "2024-03-11",
        "studyTime": 120
      }
    ]
  }
}
```

## 8. 管理员接口

### 8.1 内容审核
**接口地址**: `/admin/content/review`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "contentId": 1,
  "contentType": "article",  // article/course
  "action": "approve",       // approve/reject
  "reason": "审核意见"
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "审核完成",
  "body": {}
}
```

### 8.2 获取待审核内容
**接口地址**: `/admin/content/pending`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "type": "article",  // article/course/all
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "type": "article",
        "title": "待审核文章标题",
        "author": "作者名称",
        "createdAt": "2024-03-15T08:00:00Z",
        "status": "pending"
      }
    ],
    "total": 10
  }
}
```

### 8.3 文章管理
**接口地址**: `/admin/article/list`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "status": "all",  // all/published/draft/pending/rejected
  "category": "string",  // 可选
  "keyword": "string"    // 搜索关键词，可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "author": "作者名称",
        "category": "训练技巧",
        "status": "published",
        "readCount": 328,
        "likeCount": 56,
        "createdAt": "2024-03-15T08:00:00Z",
        "updatedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 50,
    "hasMore": true
  }
}
```

### 8.4 删除文章
**接口地址**: `/admin/article/delete`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "articleId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "删除成功",
  "body": {}
}
```

### 8.5 课程管理
**接口地址**: `/admin/course/list`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "status": "all",  // all/published/draft/pending/rejected
  "level": "string", // 课程级别，可选
  "keyword": "string" // 搜索关键词，可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "犬敏捷基础训练",
        "teacher": "张教练",
        "level": "初级",
        "price": 299.00,
        "studentCount": 128,
        "status": "published",
        "createdAt": "2024-03-01T00:00:00Z",
        "updatedAt": "2024-03-01T10:00:00Z"
      }
    ],
    "total": 25,
    "hasMore": true
  }
}
```

### 8.6 删除课程
**接口地址**: `/admin/course/delete`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "courseId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "删除成功",
  "body": {}
}
```

### 8.7 章节管理
**接口地址**: `/admin/chapter/list`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "courseId": 1,
  "page": 1,
  "limit": 20
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "第一章：基础概念",
        "courseId": 1,
        "sortOrder": 1,
        "lessonCount": 5,
        "createdAt": "2024-03-01T00:00:00Z"
      }
    ],
    "total": 8
  }
}
```

### 8.8 创建章节
**接口地址**: `/admin/chapter/create`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "courseId": 1,
  "title": "章节标题",
  "description": "章节描述",
  "sortOrder": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "章节创建成功",
  "body": {
    "id": 123,
    "title": "章节标题",
    "courseId": 1,
    "sortOrder": 1
  }
}
```

### 8.9 编辑章节
**接口地址**: `/admin/chapter/update`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "chapterId": 1,
  "title": "更新的章节标题",
  "description": "更新的章节描述",
  "sortOrder": 2
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "章节更新成功",
  "body": {}
}
```

### 8.10 删除章节
**接口地址**: `/admin/chapter/delete`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "chapterId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "章节删除成功",
  "body": {}
}
```

### 8.11 课时管理
**接口地址**: `/admin/lesson/list`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "chapterId": 1,
  "page": 1,
  "limit": 20
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "title": "什么是犬敏捷运动",
        "chapterId": 1,
        "type": "video",
        "duration": 600,
        "sortOrder": 1,
        "isFree": true,
        "createdAt": "2024-03-01T00:00:00Z"
      }
    ],
    "total": 15
  }
}
```

### 8.12 创建课时
**接口地址**: `/admin/lesson/create`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "chapterId": 1,
  "title": "课时标题",
  "type": "video",  // video/text/audio
  "content": "课时内容",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 600,
  "sortOrder": 1,
  "isFree": false
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "课时创建成功",
  "body": {
    "id": 456,
    "title": "课时标题",
    "chapterId": 1
  }
}
```

### 8.13 编辑课时
**接口地址**: `/admin/lesson/update`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "lessonId": 1,
  "title": "更新的课时标题",
  "content": "更新的课时内容",
  "videoUrl": "https://example.com/new_video.mp4",
  "duration": 720,
  "isFree": true
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "课时更新成功",
  "body": {}
}
```

### 8.14 删除课时
**接口地址**: `/admin/lesson/delete`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "lessonId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "课时删除成功",
  "body": {}
}
```

### 8.15 用户管理
**接口地址**: `/admin/user/list`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "page": 1,
  "limit": 20,
  "role": "all",  // all/user/teacher/admin
  "keyword": "string"  // 搜索关键词，可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "nickname": "用户昵称",
        "avatar": "https://wx.qlogo.cn/mmopen/...",
        "role": "user",
        "status": "active",  // active/banned
        "totalCourses": 5,
        "totalStudyTime": 3600,
        "createdAt": "2024-01-15T08:00:00Z",
        "lastLoginAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 1000,
    "hasMore": true
  }
}
```

### 8.16 更新用户角色
**接口地址**: `/admin/user/role`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "userId": 1,
  "role": "teacher"  // user/teacher/admin
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "角色更新成功",
  "body": {}
}
```

### 8.17 封禁/解封用户
**接口地址**: `/admin/user/status`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**:
```json
{
  "userId": 1,
  "status": "banned",  // active/banned
  "reason": "封禁原因"
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "用户状态更新成功",
  "body": {}
}
```

### 8.18 系统统计
**接口地址**: `/admin/stats/overview`  
**请求方法**: `POST`  
**是否需要认证**: 是（需要管理员权限）

**请求参数**: 无

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "userStats": {
      "totalUsers": 1000,
      "newUsersToday": 25,
      "activeUsers": 800
    },
    "contentStats": {
      "totalArticles": 150,
      "totalCourses": 25,
      "pendingReviews": 8
    },
    "businessStats": {
      "totalRevenue": 50000.00,
      "totalOrders": 500,
      "averageOrderValue": 100.00
    }
  }
}
```

## 9. 收藏和学习记录接口

### 9.1 获取收藏列表
**接口地址**: `/user/collection/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "type": "article",  // article/course/all
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "type": "article",
        "title": "文章标题",
        "cover": "https://example.com/cover.jpg",
        "collectedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 20,
    "hasMore": true
  }
}
```

### 9.2 获取学习记录
**接口地址**: `/user/study/history`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "courseId": 1,
        "courseTitle": "犬敏捷基础训练",
        "lessonId": 5,
        "lessonTitle": "跨栏训练技巧",
        "progress": 80,
        "lastStudyAt": "2024-03-15T14:30:00Z"
      }
    ],
    "total": 15,
    "hasMore": true
  }
}
```

### 9.3 获取学习进度
**接口地址**: `/user/study/progress`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "courseId": 1
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "courseId": 1,
    "totalLessons": 20,
    "completedLessons": 8,
    "totalProgress": 40,
    "totalStudyTime": 1800,
    "lessons": [
      {
        "lessonId": 1,
        "progress": 100,
        "studyTime": 300,
        "completedAt": "2024-03-10T10:00:00Z"
      }
    ]
  }
}
```

## 10. 搜索接口

### 10.1 全局搜索
**接口地址**: `/search/global`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "keyword": "敏捷训练",
  "type": "all",  // all/article/course
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "搜索成功",
  "body": {
    "articles": [
      {
        "id": 1,
        "title": "春季敏捷训练营即将开始！",
        "summary": "为期6周的专业训练课程...",
        "cover": "https://example.com/cover.jpg",
        "category": "训练技巧"
      }
    ],
    "courses": [
      {
        "id": 1,
        "title": "犬敏捷基础训练",
        "cover": "https://example.com/cover.jpg",
        "teacher": "张教练",
        "price": 299.00
      }
    ],
    "total": {
      "articles": 15,
      "courses": 5
    }
  }
}
```

### 10.2 搜索建议
**接口地址**: `/search/suggest`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "keyword": "敏捷"
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "suggestions": [
      "敏捷训练",
      "敏捷比赛",
      "敏捷器材",
      "敏捷技巧"
    ]
  }
}
```

## 11. 通知和消息接口

### 11.1 获取通知列表
**接口地址**: `/notification/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "type": "all",  // all/system/course/article
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "id": 1,
        "type": "system",
        "title": "系统维护通知",
        "content": "系统将于今晚22:00-24:00进行维护",
        "isRead": false,
        "createdAt": "2024-03-15T08:00:00Z"
      }
    ],
    "unreadCount": 5,
    "total": 20,
    "hasMore": true
  }
}
```

### 11.2 标记通知已读
**接口地址**: `/notification/read`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "notificationId": 1  // 可选，不传则全部标记已读
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "标记成功",
  "body": {}
}
```

## 12. 反馈和举报接口

### 12.1 提交反馈
**接口地址**: `/feedback/submit`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "type": "bug",  // bug/suggestion/complaint/other
  "title": "反馈标题",
  "content": "反馈内容",
  "images": ["https://example.com/image1.jpg"],  // 可选
  "contact": "联系方式"  // 可选
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "反馈提交成功",
  "body": {
    "feedbackId": 123
  }
}
```

### 12.2 举报内容
**接口地址**: `/report/submit`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "targetType": "article",  // article/course/user
  "targetId": 1,
  "reason": "spam",  // spam/inappropriate/copyright/other
  "description": "举报描述"
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "举报提交成功",
  "body": {
    "reportId": 456
  }
}
```

## 13. 支付相关接口

### 13.1 创建订单
**接口地址**: `/order/create`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "courseId": 1,
  "paymentMethod": "wechat"  // wechat/alipay
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "订单创建成功",
  "body": {
    "orderId": "ORDER_20240315_123456",
    "amount": 299.00,
    "paymentInfo": {
      "appId": "wx1234567890",
      "timeStamp": "1710480000",
      "nonceStr": "random_string",
      "package": "prepay_id=wx123456789",
      "signType": "RSA",
      "paySign": "signature"
    }
  }
}
```

### 13.2 查询订单状态
**接口地址**: `/order/status`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "orderId": "ORDER_20240315_123456"
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "查询成功",
  "body": {
    "orderId": "ORDER_20240315_123456",
    "status": "paid",  // pending/paid/failed/refunded
    "amount": 299.00,
    "courseId": 1,
    "createdAt": "2024-03-15T10:00:00Z",
    "paidAt": "2024-03-15T10:05:00Z"
  }
}
```

### 13.3 获取订单列表
**接口地址**: `/order/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "status": "all",  // all/pending/paid/failed/refunded
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "orderId": "ORDER_20240315_123456",
        "courseTitle": "犬敏捷基础训练",
        "amount": 299.00,
        "status": "paid",
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 5,
    "hasMore": false
  }
}
```

## 14. 富文本编辑器接口

### 14.1 保存草稿
**接口地址**: `/editor/draft/save`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "type": "article",  // article/course
  "title": "草稿标题",
  "content": "<p>草稿内容...</p>",
  "draftId": 123  // 可选，更新现有草稿时传入
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "草稿保存成功",
  "body": {
    "draftId": 123,
    "savedAt": "2024-03-15T10:00:00Z"
  }
}
```

### 14.2 获取草稿列表
**接口地址**: `/editor/draft/list`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "type": "all",  // all/article/course
  "page": 1,
  "limit": 10
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": {
    "list": [
      {
        "draftId": 123,
        "type": "article",
        "title": "草稿标题",
        "updatedAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 8,
    "hasMore": false
  }
}
```

### 14.3 删除草稿
**接口地址**: `/editor/draft/delete`  
**请求方法**: `POST`  
**是否需要认证**: 是

**请求参数**:
```json
{
  "draftId": 123
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "草稿删除成功",
  "body": {}
}
```

## Mock数据配置

### Mock数据文件位置
`utils/mockData.js`

### Mock数据结构
```javascript
const mockData = {
  '/user/login': {
    error: 0,
    message: '登录成功',
    body: { /* 用户数据 */ }
  },
  // 其他接口的Mock数据...
}
```

### Mock数据使用
在开发环境中，`utils/api.js` 会自动使用Mock数据，无需配置真实的API地址。

## 错误处理

### 客户端错误处理
1. **网络错误**: 显示"网络连接失败"提示
2. **超时错误**: 显示"请求超时，请重试"提示
3. **认证错误**: 清除本地token，跳转到登录页面
4. **权限错误**: 显示"权限不足"提示
5. **业务错误**: 显示服务器返回的错误信息

### 错误处理代码示例
```javascript
// utils/api.js 中的错误处理
if (error === 0) {
  // 请求成功
  resolve(body)
} else if (error === 401) {
  // 需要登录
  wx.removeStorageSync('token')
  wx.showToast({ title: '请重新登录', icon: 'none' })
} else if (error === 500) {
  // 系统异常
  wx.showToast({ title: '系统异常，请稍后重试', icon: 'error' })
} else {
  // 业务异常
  wx.showToast({ title: message || '请求失败', icon: 'none' })
}
```

## 接口调用示例

### 在页面中调用API
```javascript
const api = require('../../utils/api.js')

Page({
  data: {
    articles: []
  },
  
  onLoad() {
    this.loadArticles()
  },
  
  async loadArticles() {
    try {
      wx.showLoading({ title: '加载中...' })
      
      const result = await api.getNewsList(1, 10)
      
      this.setData({
        articles: result.list
      })
      
    } catch (error) {
      console.error('加载文章失败:', error)
    } finally {
      wx.hideLoading()
    }
  }
})
```

### 课程学习页面调用示例
```javascript
// pages/course-content/course-content.js
const api = require('../../utils/api.js')

Page({
  data: {
    lesson: null,
    progress: 0
  },
  
  async onLoad(options) {
    const { lessonId } = options
    await this.loadLessonContent(lessonId)
  },
  
  async loadLessonContent(lessonId) {
    try {
      const result = await api.getLessonContent(lessonId)
      this.setData({ lesson: result })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  
  async updateProgress(progress) {
    try {
      await api.updateLessonProgress(this.data.lesson.id, progress)
      this.setData({ progress })
    } catch (error) {
      console.error('更新进度失败:', error)
    }
  }
})
```

### 管理员页面调用示例
```javascript
// pages/admin/article-manage/article-manage.js
const api = require('../../../utils/api.js')

Page({
  data: {
    articles: [],
    page: 1,
    hasMore: true
  },
  
  async onLoad() {
    await this.loadArticles()
  },
  
  async loadArticles() {
    if (!this.data.hasMore) return
    
    try {
      const result = await api.adminGetArticleList(this.data.page, 10)
      
      this.setData({
        articles: this.data.page === 1 ? result.list : [...this.data.articles, ...result.list],
        page: this.data.page + 1,
        hasMore: result.hasMore
      })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  
  async approveArticle(articleId) {
    try {
      await api.reviewContent(articleId, 'article', 'approve')
      wx.showToast({ title: '审核通过', icon: 'success' })
      await this.refreshList()
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },
  
  async refreshList() {
    this.setData({ page: 1, hasMore: true, articles: [] })
    await this.loadArticles()
  }
})
```

### 富文本编辑器调用示例
```javascript
// pages/rich-text-editor/rich-text-editor.js
const api = require('../../utils/api.js')

Page({
  data: {
    content: '',
    draftId: null
  },
  
  async saveDraft() {
    try {
      const result = await api.saveDraft('article', this.data.title, this.data.content, this.data.draftId)
      
      this.setData({ draftId: result.draftId })
      wx.showToast({ title: '草稿已保存', icon: 'success' })
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },
  
  async uploadImage() {
    try {
      const res = await wx.chooseImage({ count: 1 })
      const result = await api.uploadImage(res.tempFilePaths[0], 'content')
      
      // 插入图片到编辑器
      this.insertImage(result.url)
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
  }
})
```

### 搜索功能调用示例
```javascript
// pages/search/search.js
const api = require('../../utils/api.js')

Page({
  data: {
    keyword: '',
    results: {
      articles: [],
      courses: []
    },
    suggestions: []
  },
  
  async onSearch(keyword) {
    if (!keyword.trim()) return
    
    try {
      wx.showLoading({ title: '搜索中...' })
      
      const result = await api.globalSearch(keyword, 'all', 1, 10)
      
      this.setData({
        keyword,
        results: result
      })
    } catch (error) {
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },
  
  async getSuggestions(keyword) {
    if (!keyword.trim()) {
      this.setData({ suggestions: [] })
      return
    }
    
    try {
      const result = await api.getSearchSuggestions(keyword)
      this.setData({ suggestions: result.suggestions })
    } catch (error) {
      console.error('获取搜索建议失败:', error)
    }
  }
})
```

## 接口测试

### 使用微信开发者工具测试
1. 在Network面板查看请求和响应
2. 使用Console面板调试API调用
3. 检查Mock数据是否正确返回

### 测试建议
1. 测试正常流程和异常流程
2. 测试网络异常情况
3. 测试不同用户权限的接口访问
4. 测试分页和搜索功能

## 15. 授权码管理相关接口

### 15.1 生成授权码

**接口地址**：`/api/courses/access-codes/generate`
**请求方式**：POST
**说明**：为指定课程生成新的授权码

**请求参数**：
```json
{
  "courseId": 1,
  "description": "快速授权码(24小时)",
  "usageLimit": 1,
  "validHours": 24,
  "validDays": 7,
  "validUntil": "2024-12-25T00:00:00.000Z",
  "codeMethod": "base32"
}
```

**参数说明**：
- `courseId`：课程ID（必填）
- `description`：授权码描述（可选）
- `usageLimit`：使用次数限制，默认为1（可选）
- `validHours`：有效小时数（可选）
- `validDays`：有效天数（可选）
- `validUntil`：具体过期时间（可选）
- `codeMethod`：编码方式（可选，默认base32）

**编码方式说明**：

#### 5种编码方式对比

| 编码方式 | 格式 | 字符集 | 特点 | 推荐场景 |
|---------|------|--------|------|----------|
| **base32** ⭐ | `A7K9M2N8` | 去除混淆字符的32字符集 | 用户友好，无0/O/1/I混淆 | **通用推荐** |
| **timestampRandom** | `K7M9A2N8` | 36字符集(0-9,A-Z) | 带时间信息，保证唯一性 | 需要追溯生成时间 |
| **base36** | `A7K9M2N8` | 36字符集(0-9,A-Z) | 标准随机，包含所有字符 | 不在意混淆字符 |
| **grouped** | `A7K9-M2N8` | 去除混淆字符+分隔符 | 分组显示，便于阅读输入 | 用户手动输入较多 |
| **withChecksum** | `A7K9M2N8` | 去除混淆字符+校验位 | 最后一位是校验位 | 需要防输入错误 |

**字符集详细说明**：
- **标准36字符集**：`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- **用户友好32字符集**：`23456789ABCDEFGHJKLMNPQRSTUVWXYZ`（去除0,1,O,I）

**编码方式选择建议**：

1. **base32（推荐）**：
   - ✅ 去除易混淆字符（0/O、1/I/l）
   - ✅ 8位固定长度，简洁明了
   - ✅ 高随机性，32^8 ≈ 1万亿种组合
   - ✅ 用户体验最佳
   - 📱 **最适合微信小程序用户输入**

2. **timestampRandom（唯一性保证）**：
   - ✅ 前4位包含时间信息，理论上永不重复
   - ✅ 可追溯生成时间
   - ⚠️ 包含可能混淆的字符
   - 🎯 **适合需要时间追溯的场景**

3. **grouped（易读性）**：
   - ✅ 4-4分组，便于人工阅读
   - ✅ 用户友好字符集
   - ⚠️ 长度增加到9位（含分隔符）
   - 📋 **适合需要频繁人工操作的场景**

4. **withChecksum（防错性）**：
   - ✅ 最后一位校验码可检测输入错误
   - ✅ 7位随机码+1位校验码
   - ⚠️ 实际随机位数减少
   - 🔒 **适合对准确性要求极高的场景**

5. **base36（标准随机）**：
   - ✅ 标准做法，兼容性好
   - ✅ 最大字符集，最高随机性
   - ❌ 包含混淆字符，用户体验较差
   - 🔧 **适合系统内部使用，不面向用户**

**推荐配置**：
- **常规使用**：`codeMethod: "base32"`
- **高并发场景**：`codeMethod: "timestampRandom"`
- **用户输入较多**：`codeMethod: "grouped"`
- **安全要求高**：`codeMethod: "withChecksum"`

### 15.2 获取课程的所有授权码（管理员）
**接口地址**: `/courses/access-codes/course/{courseId}`  
**请求方法**: `GET`  
**是否需要认证**: 是（需要管理员权限）

**功能描述**: 获取指定课程的所有授权码，包括使用情况和用户信息

**请求参数**: 无（courseId在URL中）

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": [
    {
      "id": 1,
      "code": "ABC123XY",
      "courseId": 1,
      "description": "快速授权码(24小时)",
      "status": "active",
      "usageLimit": 1,
      "usedCount": 0,
      "validUntil": "2024-12-21T10:30:00.000Z",
      "createdAt": "2024-12-20T10:30:00.000Z",
      "createdBy": 1,
      "usedBy": null,
      "usedAt": null,
      "usedByUserName": null
    },
    {
      "id": 2,
      "code": "DEF456UV",
      "courseId": 1,
      "description": "授权码(7天有效)",
      "status": "used",
      "usageLimit": 1,
      "usedCount": 1,
      "validUntil": "2024-12-27T15:20:00.000Z",
      "createdAt": "2024-12-19T15:20:00.000Z",
      "createdBy": 1,
      "usedBy": 3,
      "usedAt": "2024-12-20T09:15:00.000Z",
      "usedByUserName": "张三"
    }
  ]
}
```

### 15.3 获取所有授权码（管理员）
**接口地址**: `/courses/access-codes/admin/list`  
**请求方法**: `GET`  
**是否需要认证**: 是（需要管理员权限）

**功能描述**: 获取系统中的所有授权码

**响应数据**:
```json
{
  "error": 0,
  "message": "获取成功",
  "body": [
    {
      "id": 1,
      "code": "ABC123XY",
      "courseId": 1,
      "courseTitle": "犬敏捷入门基础",
      "description": "快速授权码(24小时)",
      "status": "active",
      "usageLimit": 1,
      "usedCount": 0,
      "validUntil": "2024-12-21T10:30:00.000Z",
      "createdAt": "2024-12-20T10:30:00.000Z"
    }
  ]
}
```

### 15.4 兑换授权码注册课程（用户）
**接口地址**: `/courses/access-codes/redeem`  
**请求方法**: `POST`  
**是否需要认证**: 是

**功能描述**: 使用授权码注册课程

**请求参数**:
```json
{
  "code": "ABC123XY"  // 授权码
}
```

**响应数据**:
```json
{
  "error": 0,
  "message": "授权码兑换成功",
  "body": {
    "message": "课程注册成功",
    "courseId": 1,
    "registrationId": 456
  }
}
```

**错误响应**:
```json
{
  "error": 400,
  "message": "兑换失败: 授权码不存在"
}
```

### 15.5 验证授权码信息
**接口地址**: `/courses/access-codes/validate/{code}`  
**请求方法**: `GET`  
**是否需要认证**: 否

**功能描述**: 验证授权码是否有效（不消耗使用次数）

**响应数据**:
```json
{
  "error": 0,
  "message": "授权码信息",
  "body": {
    "code": "ABC123XY",
    "courseId": 1,
    "courseTitle": "犬敏捷入门基础",
    "isUsable": true,
    "status": "active",
    "usageLimit": 1,
    "usedCount": 0,
    "validUntil": "2024-12-21T10:30:00.000Z"
  }
}
```

### 15.6 禁用授权码（管理员）
**接口地址**: `/courses/access-codes/{codeId}/disable`  
**请求方法**: `PUT`  
**是否需要认证**: 是（需要管理员权限）

**功能描述**: 禁用指定的授权码

### 15.7 启用授权码（管理员）
**接口地址**: `/courses/access-codes/{codeId}/enable`  
**请求方法**: `PUT`  
**是否需要认证**: 是（需要管理员权限）

**功能描述**: 启用指定的授权码

### 15.8 删除授权码（管理员）
**接口地址**: `/courses/access-codes/{codeId}`  
**请求方法**: `DELETE`  
**是否需要认证**: 是（需要管理员权限）

**功能描述**: 删除指定的授权码

## 授权码状态说明

| 状态 | 说明 |
|------|------|
| active | 有效，可以使用 |
| used | 已使用，无法再次使用 |
| expired | 已过期，无法使用 |
| disabled | 已禁用，无法使用 |

## 授权码使用流程

### 管理员生成授权码的完整流程

1. **生成授权码**:
```javascript
const response = await api.generateAccessCode({
  courseId: 1,
  description: '快速授权码(24小时)',
  usageLimit: 1,
  validUntil: '2024-12-21T10:30:00.000Z'
})
```

2. **分享授权码给用户**: `ABC123XY`

3. **用户兑换授权码**:
```javascript
const response = await api.redeemAccessCode('ABC123XY')
```

### 小程序端授权码管理示例

**小程序端兑换授权码**:
```javascript
// 用户兑换授权码
async redeemAccessCode(code) {
  try {
    const response = await api.redeemAccessCode(code)
    
    if (response.success) {
      wx.showToast({
        title: '课程注册成功',
        icon: 'success'
      })
      
      // 跳转到课程页面
      wx.navigateTo({
        url: `/pages/course-detail/course-detail?id=${response.courseId}`
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

**管理员生成授权码**:
```javascript
// 管理员生成授权码
async generateAccessCode(courseId, options) {
  try {
    const response = await api.generateAccessCode({
      courseId,
      description: options.description,
      usageLimit: options.usageLimit || 1,
      validUntil: options.validUntil
    })
    
    // 显示生成的授权码
    wx.showModal({
      title: '授权码生成成功',
      content: `新授权码：${response.code}`,
      confirmText: '复制授权码',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: response.code,
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' })
            }
          })
        }
      }
    })
  } catch (error) {
    wx.showToast({
      title: error.message || '生成失败',
      icon: 'none'
    })
  }
}
```

## 授权码功能特性

1. **授权码唯一性**: 每个授权码都是全局唯一的8位字符串
2. **使用次数**: 授权码可以设置使用次数限制，达到限制后自动标记为已使用
3. **有效期**: 可以为授权码设置有效期，过期后无法使用
4. **状态管理**: 支持启用/禁用授权码，灵活控制访问
5. **权限控制**: 只有管理员可以生成和管理授权码
6. **日志记录**: 所有授权码的生成和使用都会记录详细日志
7. **用户追踪**: 记录授权码的使用者信息和使用时间 