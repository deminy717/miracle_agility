# Miracle Agility 前端项目结构文档

## 项目概述
Miracle Agility（奇迹犬敏捷）是一个专注于犬类敏捷训练的微信小程序，为用户提供课程学习、资讯阅读、内容发布等功能。

## 目录结构

```
miracle_agility/
├── app.js                          # 应用入口文件
├── app.json                        # 全局配置文件
├── app.wxss                        # 全局样式文件
├── project.config.json             # 项目配置文件
├── project.private.config.json     # 私有项目配置
├── sitemap.json                    # 站点地图配置
├── README.md                       # 项目说明文档
│
├── pages/                          # 页面目录
│   ├── home/                       # 主页
│   │   ├── home.js                 # 页面逻辑
│   │   ├── home.json               # 页面配置
│   │   ├── home.wxml               # 页面结构
│   │   └── home.wxss               # 页面样式
│   │
│   ├── index/                      # 启动页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   │
│   ├── course/                     # 课程列表页
│   │   ├── course.js
│   │   ├── course.json
│   │   ├── course.wxml
│   │   └── course.wxss
│   │
│   ├── course-detail/              # 课程详情页
│   │   ├── course-detail.js
│   │   ├── course-detail.json
│   │   ├── course-detail.wxml
│   │   └── course-detail.wxss
│   │
│   ├── course-content/             # 课程内容页
│   │   ├── course-content.js
│   │   ├── course-content.json
│   │   ├── course-content.wxml
│   │   └── course-content.wxss
│   │
│   ├── article-list/               # 文章列表页
│   │   ├── article-list.js
│   │   ├── article-list.json
│   │   ├── article-list.wxml
│   │   └── article-list.wxss
│   │
│   ├── article-detail/             # 文章详情页
│   │   ├── article-detail.js
│   │   ├── article-detail.json
│   │   ├── article-detail.wxml
│   │   └── article-detail.wxss
│   │
│   ├── profile/                    # 个人中心页
│   │   ├── profile.js
│   │   ├── profile.json
│   │   ├── profile.wxml
│   │   └── profile.wxss
│   │
│   ├── publish-article/            # 发布文章页
│   │   ├── publish-article.js
│   │   ├── publish-article.json
│   │   ├── publish-article.wxml
│   │   └── publish-article.wxss
│   │
│   ├── publish-course/             # 发布课程页
│   │   ├── publish-course.js
│   │   ├── publish-course.json
│   │   ├── publish-course.wxml
│   │   └── publish-course.wxss
│   │
│   ├── publish-content/            # 发布内容页
│   │   ├── publish-content.js
│   │   ├── publish-content.json
│   │   ├── publish-content.wxml
│   │   └── publish-content.wxss
│   │
│   ├── rich-text-editor/          # 富文本编辑器
│   │   ├── rich-text-editor.js
│   │   ├── rich-text-editor.json
│   │   ├── rich-text-editor.wxml
│   │   └── rich-text-editor.wxss
│   │
│   ├── card-editor/               # 卡片式编辑器
│   │   ├── card-editor.js
│   │   ├── card-editor.json
│   │   ├── card-editor.wxml
│   │   └── card-editor.wxss
│   │
│   ├── admin-home/                # 管理员主页
│   │   ├── admin-home.js
│   │   ├── admin-home.json
│   │   ├── admin-home.wxml
│   │   └── admin-home.wxss
│   │
│   ├── developer-home/            # 开发者主页
│   │   ├── developer-home.js
│   │   ├── developer-home.json
│   │   ├── developer-home.wxml
│   │   └── developer-home.wxss
│   │
│   ├── logs/                      # 日志页面
│   │   ├── logs.js
│   │   ├── logs.json
│   │   ├── logs.wxml
│   │   └── logs.wxss
│   │
│   └── admin/                     # 管理员功能模块
│       ├── index.js               # 管理员入口
│       ├── index.json
│       ├── index.wxml
│       ├── index.wxss
│       │
│       ├── course-manage/         # 课程管理
│       │   ├── course-manage.js
│       │   ├── course-manage.json
│       │   ├── course-manage.wxml
│       │   └── course-manage.wxss
│       │
│       ├── course-create/         # 创建课程
│       │   ├── course-create.js
│       │   ├── course-create.json
│       │   ├── course-create.wxml
│       │   └── course-create.wxss
│       │
│       ├── course-edit/           # 编辑课程
│       │   ├── course-edit.js
│       │   ├── course-edit.json
│       │   ├── course-edit.wxml
│       │   └── course-edit.wxss
│       │
│       ├── chapter-manage/        # 章节管理
│       │   ├── chapter-manage.js
│       │   ├── chapter-manage.json
│       │   ├── chapter-manage.wxml
│       │   └── chapter-manage.wxss
│       │
│       ├── chapter-create/        # 创建章节
│       │   ├── chapter-create.js
│       │   ├── chapter-create.json
│       │   ├── chapter-create.wxml
│       │   └── chapter-create.wxss
│       │
│       ├── chapter-edit/          # 编辑章节
│       │   ├── chapter-edit.js
│       │   ├── chapter-edit.json
│       │   ├── chapter-edit.wxml
│       │   └── chapter-edit.wxss
│       │
│       ├── lesson-create/         # 创建课时
│       │   ├── lesson-create.js
│       │   ├── lesson-create.json
│       │   ├── lesson-create.wxml
│       │   └── lesson-create.wxss
│       │
│       ├── lesson-edit/           # 编辑课时
│       │   ├── lesson-edit.js
│       │   ├── lesson-edit.json
│       │   ├── lesson-edit.wxml
│       │   └── lesson-edit.wxss
│       │
│       ├── article-manage/        # 文章管理
│       │   ├── article-manage.js
│       │   ├── article-manage.json
│       │   ├── article-manage.wxml
│       │   └── article-manage.wxss
│       │
│       ├── article-create/        # 创建文章
│       │   ├── article-create.js
│       │   ├── article-create.json
│       │   ├── article-create.wxml
│       │   └── article-create.wxss
│       │
│       ├── article-edit/          # 编辑文章
│       │   ├── article-edit.js
│       │   ├── article-edit.json
│       │   ├── article-edit.wxml
│       │   └── article-edit.wxss
│       │
│       └── upload/                # 文件上传
│           ├── upload.js
│           ├── upload.json
│           ├── upload.wxml
│           └── upload.wxss
│
├── utils/                         # 工具函数目录
│   ├── api.js                     # API接口封装
│   ├── config.js                  # 配置文件
│   ├── util.js                    # 通用工具函数
│   └── mockData.js                # 模拟数据
│
├── static/                        # 静态资源目录
│   ├── logo.png                   # 应用Logo
│   └── images/                    # 图片资源
│       └── icon/                  # 图标资源
│           ├── home.png           # 主页图标
│           ├── home-active.png    # 主页激活图标
│           ├── course.png         # 课程图标
│           ├── course-active.png  # 课程激活图标
│           ├── profile.png        # 个人中心图标
│           └── profile-active.png # 个人中心激活图标
│
├── docs/                          # 文档目录
│   ├── project-structure.md       # 项目结构文档
│   ├── feature-documentation.md   # 功能文档
│   ├── api.md                     # API文档
│   ├── requirements.md            # 需求文档
│   ├── environment-config.md      # 环境配置文档
│   ├── admin-system-guide.md      # 管理系统指南
│   ├── rich-text-editor-guide.md  # 富文本编辑器指南
│   ├── rich-text-editor-readme.md # 富文本编辑器说明
│   ├── card-editor-guide.md       # 卡片编辑器指南
│   ├── video-solution-guide.md    # 视频解决方案指南
│   └── video-image-fix-guide.md   # 视频图片修复指南
│
├── prototype/                     # 原型文件（如果有）
│
├── .vscode/                       # VS Code配置
├── .idea/                         # WebStorm配置
├── .cursor/                       # Cursor编辑器配置
└── .git/                          # Git版本控制
```

## 核心文件说明

### 应用级文件
- **app.js**: 应用生命周期管理，全局数据存储
- **app.json**: 页面路由配置，TabBar配置，权限配置
- **app.wxss**: 全局样式定义

### 页面文件结构
每个页面包含四个文件：
- **.js**: 页面逻辑和数据处理
- **.json**: 页面配置（标题、导航等）
- **.wxml**: 页面结构和布局
- **.wxss**: 页面样式

### 工具函数
- **api.js**: 网络请求封装，Mock数据处理
- **config.js**: 环境配置，API地址配置
- **util.js**: 通用工具函数
- **mockData.js**: 开发环境模拟数据

### 静态资源
- **static/**: 存放图片、图标等静态资源
- **images/icon/**: TabBar图标和功能图标

## 技术栈
- **框架**: 微信小程序原生开发
- **样式**: WXSS（类似CSS）
- **数据绑定**: 微信小程序数据绑定机制
- **网络请求**: wx.request API
- **存储**: wx.storage API
- **组件**: 微信小程序内置组件

## 开发环境
- **开发工具**: 微信开发者工具
- **代码编辑器**: VS Code / WebStorm / Cursor
- **版本控制**: Git
- **调试**: 微信开发者工具调试面板

## 部署配置
- **开发环境**: 本地开发，使用Mock数据
- **测试环境**: 微信小程序测试版
- **生产环境**: 微信小程序正式版 