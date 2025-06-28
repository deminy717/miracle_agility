# Miracle Agility 功能文档

## 功能概览
本文档详细描述了Miracle Agility小程序的所有功能模块，包括用户操作流程、涉及的文件、组件调用关系等。

## 1. 主页功能模块

### 1.1 最新资讯展示
**功能描述**: 在主页展示最新的犬敏捷训练相关资讯

**操作流程**:
1. 用户打开小程序，进入主页
2. 系统自动加载最新资讯列表
3. 用户可以浏览资讯卡片
4. 点击资讯卡片进入详情页

**涉及文件**:
- `pages/home/home.js` - 主页逻辑处理
- `pages/home/home.wxml` - 主页结构布局
- `pages/home/home.wxss` - 主页样式定义
- `pages/home/home.json` - 主页配置
- `utils/api.js` - API接口调用
- `utils/mockData.js` - 模拟数据提供
- `app.js` - 全局数据存储

**方法调用关系**:
```
home.js:onLoad() 
  → loadNews() 
    → getApp().globalData.latestArticles
    → setData({newsList})

home.js:onNewsClick() 
  → wx.navigateTo('/pages/article-detail/article-detail?id=${newsId}')
```

### 1.2 点赞功能
**功能描述**: 用户可以对资讯进行点赞操作

**操作流程**:
1. 用户在资讯卡片上点击点赞按钮
2. 系统增加点赞数量
3. 触发震动反馈

**涉及文件**:
- `pages/home/home.js` - 点赞逻辑处理

**方法调用关系**:
```
home.js:onLikeClick() 
  → setData({newsList}) 
  → wx.vibrateShort()
```

### 1.3 下拉刷新
**功能描述**: 用户下拉主页可以刷新最新资讯

**操作流程**:
1. 用户在主页下拉
2. 系统重新加载资讯数据
3. 停止下拉刷新动画

**涉及文件**:
- `pages/home/home.js` - 刷新逻辑
- `pages/home/home.json` - 启用下拉刷新配置

**方法调用关系**:
```
home.js:onPullDownRefresh() 
  → loadNews() 
  → wx.stopPullDownRefresh()
```

## 2. 文章功能模块

### 2.1 文章列表浏览
**功能描述**: 用户可以浏览所有文章，支持分类筛选和分页加载

**操作流程**:
1. 用户进入文章列表页
2. 系统加载文章列表数据
3. 用户可以切换分类筛选
4. 滚动到底部自动加载更多文章

**涉及文件**:
- `pages/article-list/article-list.js` - 文章列表逻辑
- `pages/article-list/article-list.wxml` - 文章列表布局
- `pages/article-list/article-list.wxss` - 文章列表样式
- `pages/article-list/article-list.json` - 页面配置
- `utils/api.js` - API接口调用

**方法调用关系**:
```
article-list.js:onLoad() → loadArticles()
article-list.js:onReachBottom() → loadArticles()
article-list.js:onCategoryChange() → loadArticles()
article-list.js:onArticleClick() → wx.navigateTo()
```

### 2.2 文章详情查看
**功能描述**: 用户点击文章可以查看详细内容

**操作流程**:
1. 用户在文章列表或主页点击文章
2. 跳转到文章详情页
3. 系统根据文章ID加载详情内容
4. 显示文章内容、作者信息、发布时间等
5. 加载相关文章推荐

**涉及文件**:
- `pages/article-detail/article-detail.js` - 文章详情逻辑
- `pages/article-detail/article-detail.wxml` - 文章详情布局
- `pages/article-detail/article-detail.wxss` - 文章详情样式
- `pages/article-detail/article-detail.json` - 页面配置

**方法调用关系**:
```
article-detail.js:onLoad(options) 
  → loadArticle(articleId)
  → loadRelatedArticles(articleId)
  → setData({article, relatedArticles})
```

### 2.3 文章互动功能
**功能描述**: 用户可以对文章进行点赞、收藏、分享操作

**操作流程**:
- **点赞**: 点击点赞按钮，增加点赞数
- **收藏**: 点击收藏按钮，添加到个人收藏
- **分享**: 点击分享按钮，分享文章给好友

**涉及文件**:
- `pages/article-detail/article-detail.js` - 互动功能实现

**方法调用关系**:
```
article-detail.js:toggleLike() → setData({isLiked})
article-detail.js:toggleCollect() → setData({isCollected})
article-detail.js:onShareAppMessage() → return shareInfo
```

## 3. 课程功能模块

### 3.1 课程列表浏览
**功能描述**: 展示所有可用的犬敏捷训练课程

**操作流程**:
1. 用户进入课程页面
2. 系统加载课程列表
3. 显示课程封面、标题、简介、价格等信息
4. 用户可以点击课程查看详情

**涉及文件**:
- `pages/course/course.js` - 课程列表逻辑
- `pages/course/course.wxml` - 课程列表布局
- `pages/course/course.wxss` - 课程列表样式
- `pages/course/course.json` - 页面配置
- `utils/api.js` - 课程数据接口

**方法调用关系**:
```
course.js:onLoad() → loadCourses()
course.js:onCourseClick() → wx.navigateTo('/pages/course-detail/')
```

### 3.2 课程详情查看
**功能描述**: 显示课程的详细信息和章节列表

**操作流程**:
1. 用户点击课程进入详情页
2. 显示课程详细介绍、教师信息
3. 展示课程章节和课时列表
4. 用户可以开始学习或购买课程

**涉及文件**:
- `pages/course-detail/course-detail.js` - 课程详情逻辑
- `pages/course-detail/course-detail.wxml` - 课程详情布局
- `pages/course-detail/course-detail.wxss` - 课程详情样式
- `pages/course-detail/course-detail.json` - 页面配置

**方法调用关系**:
```
course-detail.js:onLoad(options) 
  → loadCourseDetail(courseId)
  → setData({course, chapters})
```

### 3.3 课程内容学习
**功能描述**: 用户学习课程的具体内容

**操作流程**:
1. 用户点击章节进入学习页面
2. 显示视频、文档等学习内容
3. 记录学习进度
4. 支持下一课、上一课导航

**涉及文件**:
- `pages/course-content/course-content.js` - 学习页面逻辑
- `pages/course-content/course-content.wxml` - 学习页面布局
- `pages/course-content/course-content.wxss` - 学习页面样式
- `pages/course-content/course-content.json` - 页面配置

**方法调用关系**:
```
course-content.js:onLoad(options) 
  → loadLessonContent(lessonId)
  → updateProgress(lessonId, progress)
```

## 4. 个人中心功能模块

### 4.1 用户信息展示
**功能描述**: 显示用户基本信息和学习统计

**操作流程**:
1. 用户进入个人中心页面
2. 显示用户头像、昵称
3. 展示学习进度、成就等信息
4. 提供设置和管理入口

**涉及文件**:
- `pages/profile/profile.js` - 个人中心逻辑
- `pages/profile/profile.wxml` - 个人中心布局
- `pages/profile/profile.wxss` - 个人中心样式
- `pages/profile/profile.json` - 页面配置

**方法调用关系**:
```
profile.js:onLoad() 
  → getUserInfo()
  → getStudyStats()
  → setData({userInfo, stats})
```

## 5. 内容发布功能模块

### 5.1 文章发布
**功能描述**: 用户可以发布犬敏捷相关的文章内容

**操作流程**:
1. 用户进入发布文章页面
2. 填写文章标题、内容、分类等信息
3. 上传封面图片
4. 预览文章效果
5. 提交发布

**涉及文件**:
- `pages/publish-article/publish-article.js` - 发布文章逻辑
- `pages/publish-article/publish-article.wxml` - 发布页面布局
- `pages/publish-article/publish-article.wxss` - 发布页面样式
- `pages/publish-article/publish-article.json` - 页面配置
- `pages/rich-text-editor/` - 富文本编辑器
- `pages/card-editor/` - 卡片式编辑器

**方法调用关系**:
```
publish-article.js:onLoad() → initEditor()
publish-article.js:onSubmit() → validateForm() → submitArticle()
publish-article.js:chooseImage() → wx.chooseImage() → uploadImage()
```

### 5.2 课程发布
**功能描述**: 教师或管理员可以发布新的训练课程

**操作流程**:
1. 进入课程发布页面
2. 填写课程基本信息
3. 添加课程章节和课时
4. 上传教学视频和资料
5. 设置课程价格和权限
6. 提交审核

**涉及文件**:
- `pages/publish-course/publish-course.js` - 发布课程逻辑
- `pages/publish-course/publish-course.wxml` - 发布页面布局
- `pages/publish-course/publish-course.wxss` - 发布页面样式
- `pages/publish-course/publish-course.json` - 页面配置

**方法调用关系**:
```
publish-course.js:onLoad() → initCourseForm()
publish-course.js:addChapter() → setData({chapters})
publish-course.js:uploadVideo() → wx.chooseVideo() → uploadFile()
publish-course.js:submitCourse() → validateCourse() → saveCourse()
```

## 6. 富文本编辑器功能

### 6.1 文本格式化
**功能描述**: 提供丰富的文本格式化选项

**操作流程**:
1. 用户在编辑器中输入文本
2. 选择文本后可以应用格式
3. 支持加粗、斜体、下划线等
4. 支持字体大小和颜色调整

**涉及文件**:
- `pages/rich-text-editor/rich-text-editor.js` - 编辑器核心逻辑
- `pages/rich-text-editor/rich-text-editor.wxml` - 编辑器界面
- `pages/rich-text-editor/rich-text-editor.wxss` - 编辑器样式

**方法调用关系**:
```
rich-text-editor.js:onFormatText(type) → applyFormat() → updateContent()
rich-text-editor.js:onColorChange() → setTextColor() → updateContent()
```

### 6.2 媒体插入
**功能描述**: 支持插入图片、视频等媒体内容

**操作流程**:
1. 用户点击插入媒体按钮
2. 选择图片或视频文件
3. 上传到服务器
4. 插入到编辑器内容中

**涉及文件**:
- `pages/rich-text-editor/rich-text-editor.js` - 媒体处理逻辑

**方法调用关系**:
```
rich-text-editor.js:insertImage() 
  → wx.chooseImage() 
  → uploadImage() 
  → insertMedia()

rich-text-editor.js:insertVideo() 
  → wx.chooseVideo() 
  → uploadVideo() 
  → insertMedia()
```

## 7. 管理员功能模块

### 7.1 内容管理
**功能描述**: 管理员可以管理所有文章和课程内容

**操作流程**:
1. 管理员登录管理后台
2. 查看待审核的内容
3. 审核通过或拒绝内容
4. 编辑或删除已发布内容

**涉及文件**:
- `pages/admin/index.js` - 管理员主页
- `pages/admin/article-manage/` - 文章管理
- `pages/admin/course-manage/` - 课程管理
- `pages/admin/article-create/` - 创建文章
- `pages/admin/course-create/` - 创建课程

**方法调用关系**:
```
admin/article-manage.js:onLoad() → loadArticleList()
admin/article-manage.js:approveArticle() → updateArticleStatus()
admin/article-manage.js:deleteArticle() → confirmDelete() → removeArticle()
```

### 7.2 用户管理
**功能描述**: 管理用户权限和信息

**操作流程**:
1. 查看用户列表
2. 修改用户权限
3. 处理用户举报
4. 用户数据统计

**涉及文件**:
- `pages/admin/user-manage/` - 用户管理页面（如果存在）

## 8. 页面导航和路由

### 8.1 TabBar导航
**功能描述**: 底部导航栏，提供主要功能入口

**配置文件**:
- `app.json` - TabBar配置

**导航结构**:
```
TabBar:
├── 主页 (pages/home/home)
├── 课程 (pages/course/course)  
└── 我的 (pages/profile/profile)
```

### 8.2 页面跳转关系
**主要跳转路径**:
```
主页 → 文章详情 → 相关文章
主页 → 文章列表 → 文章详情
课程 → 课程详情 → 课程内容
个人中心 → 发布文章 → 富文本编辑器
个人中心 → 管理后台 → 各管理页面
```

## 9. 数据流和状态管理

### 9.1 全局数据
**存储位置**: `app.js` - `globalData`

**数据内容**:
- `latestArticles` - 最新文章列表
- `userInfo` - 用户信息
- `systemInfo` - 系统信息

### 9.2 本地存储
**使用场景**:
- 用户登录状态
- 文章收藏列表
- 学习进度记录
- 用户偏好设置

**相关API**:
- `wx.setStorageSync()` - 同步存储
- `wx.getStorageSync()` - 同步读取
- `wx.removeStorageSync()` - 同步删除

## 10. 网络请求和API调用

### 10.1 API接口封装
**文件位置**: `utils/api.js`

**主要接口**:
- 用户相关: `login()`, `getUserInfo()`, `updateUserInfo()`
- 课程相关: `getCourseList()`, `getCourseDetail()`, `getLessonContent()`
- 文章相关: `getNewsList()`, `getNewsDetail()`, `likeNews()`
- 成就相关: `getAchievements()`, `unlockAchievement()`

### 10.2 Mock数据处理
**文件位置**: `utils/mockData.js`

**功能**: 开发环境提供模拟数据，便于前端开发和测试

## 11. 错误处理和用户反馈

### 11.1 网络错误处理
- 请求超时提示
- 网络连接失败提示
- 服务器错误处理

### 11.2 用户交互反馈
- Loading状态显示
- 操作成功提示
- 错误信息提示
- 震动反馈

## 12. 性能优化

### 12.1 页面加载优化
- 分页加载数据
- 图片懒加载
- 缓存机制

### 12.2 用户体验优化
- 下拉刷新
- 上拉加载更多
- 骨架屏展示
- 平滑过渡动画 