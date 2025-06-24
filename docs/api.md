# 犬敏捷俱乐部小程序API文档

## 接口规范

### 请求规范
- 请求方式默认为POST，除非有明确说明
- header中必须设置auth，值为当前登录后保存的token值
- 请求参数使用JSON格式，即使参数为空，也需要使用{}代替

### 返回格式
```json
{
  "error": 0,
  "body": {},
  "message": ""
}
```

- error=0: 表示没有任何异常
- error=500: 表示系统异常，需要弹出系统异常的错误
- error=401: 表示需要登录
- error: 其它值表示业务异常，直接弹出message内容
- body: 返回的数据对象

## 接口列表

### 用户相关

#### 用户登录
- 接口核心功能描述: 通过微信登录获取用户信息和token
- 接口地址: /user/login
- 方法: POST
- 需要登录: 否
- 请求参数:
```json
{
  "code": "微信登录凭证",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "用户头像"
  }
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "token": "用户身份令牌",
    "userId": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "用户头像"
  },
  "message": ""
}
```

#### 获取用户信息
- 接口核心功能描述: 获取当前登录用户的详细信息
- 接口地址: /user/info
- 方法: GET
- 需要登录: 是
- 请求参数: 无
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "userId": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "用户头像",
    "gender": "性别",
    "phone": "手机号",
    "coursesCount": "已购课程数",
    "completedCount": "已完成课程数"
  },
  "message": ""
}
```

### 首页相关

#### 获取首页资讯列表
- 接口核心功能描述: 获取首页显示的资讯列表
- 接口地址: /home/articles
- 方法: GET
- 需要登录: 否
- 请求参数:
```json
{
  "page": 1,
  "pageSize": 10
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "title": "文章标题",
        "desc": "文章简介",
        "coverImage": "封面图片URL",
        "publishTime": "发布时间",
        "views": 1255
      }
    ]
  },
  "message": ""
}
```

#### 获取首页视频列表
- 接口核心功能描述: 获取首页显示的视频列表
- 接口地址: /home/videos
- 方法: GET
- 需要登录: 否
- 请求参数:
```json
{
  "page": 1,
  "pageSize": 10
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "total": 50,
    "list": [
      {
        "id": 1,
        "title": "视频标题",
        "coverImage": "封面图片URL",
        "duration": "12:30",
        "publishTime": "发布时间"
      }
    ]
  },
  "message": ""
}
```

### 文章详情

#### 获取文章详情
- 接口核心功能描述: 获取文章的详细内容
- 接口地址: /article/detail
- 方法: GET
- 需要登录: 否
- 请求参数:
```json
{
  "id": "文章ID"
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "id": 1,
    "title": "文章标题",
    "author": "作者",
    "publishTime": "发布时间",
    "views": 1255,
    "content": "文章HTML内容",
    "tags": ["标签1", "标签2"]
  },
  "message": ""
}
```

### 课程相关

#### 获取课程列表
- 接口核心功能描述: 获取用户的课程列表
- 接口地址: /course/list
- 方法: GET
- 需要登录: 是
- 请求参数:
```json
{
  "page": 1,
  "pageSize": 10
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "total": 20,
    "list": [
      {
        "id": 1,
        "title": "课程标题",
        "desc": "课程简介",
        "coverImage": "封面图片URL",
        "lessonCount": 12,
        "progress": 35
      }
    ]
  },
  "message": ""
}
```

#### 获取课程详情
- 接口核心功能描述: 获取课程的详细信息和章节列表
- 接口地址: /course/detail
- 方法: GET
- 需要登录: 是
- 请求参数:
```json
{
  "id": "课程ID"
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "id": 1,
    "title": "课程标题",
    "desc": "课程简介",
    "coverImage": "封面图片URL",
    "lessonCount": 12,
    "progress": 35,
    "chapters": [
      {
        "id": 1,
        "title": "章节标题",
        "lessons": [
          {
            "id": 1,
            "title": "课时标题",
            "duration": "15:00",
            "status": "completed/learning/unlearned",
            "statusText": "已完成/学习中/未学习"
          }
        ]
      }
    ]
  },
  "message": ""
}
```

#### 获取课时内容
- 接口核心功能描述: 获取课程课时的详细内容
- 接口地址: /course/lesson
- 方法: GET
- 需要登录: 是
- 请求参数:
```json
{
  "courseId": "课程ID",
  "chapterId": "章节ID",
  "lessonId": "课时ID"
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "id": 1,
    "title": "课时标题",
    "chapterTitle": "章节标题",
    "duration": "15:00",
    "completed": false,
    "videoUrl": "视频URL",
    "videoPoster": "视频封面",
    "content": "课程HTML内容",
    "images": ["图片URL1", "图片URL2"],
    "prevLessonId": 0,
    "nextLessonId": 2
  },
  "message": ""
}
```

#### 更新课时状态
- 接口核心功能描述: 更新课时的学习状态
- 接口地址: /course/update-status
- 方法: POST
- 需要登录: 是
- 请求参数:
```json
{
  "courseId": "课程ID",
  "lessonId": "课时ID",
  "completed": true
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "success": true,
    "progress": 40
  },
  "message": ""
}
```

### 视频相关

#### 获取视频详情
- 接口核心功能描述: 获取视频的详细信息
- 接口地址: /video/detail
- 方法: GET
- 需要登录: 否
- 请求参数:
```json
{
  "id": "视频ID"
}
```
- 响应类型: JSON
- 返回值:
```json
{
  "error": 0,
  "body": {
    "id": 1,
    "title": "视频标题",
    "desc": "视频描述",
    "coverImage": "封面图片URL",
    "videoUrl": "视频URL",
    "duration": "12:30",
    "publishTime": "发布时间",
    "views": 1255,
    "related": [
      {
        "id": 2,
        "title": "相关视频标题",
        "coverImage": "封面图片URL",
        "duration": "08:45"
      }
    ]
  },
  "message": ""
}
```
