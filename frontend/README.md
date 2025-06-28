# Miracle Agility 前端项目

这是 Miracle Agility（奇迹犬敏捷）微信小程序的前端代码目录。

## 目录结构

```
frontend/
├── app.js                     # 小程序入口文件
├── app.json                   # 全局配置文件
├── app.wxss                   # 全局样式文件
├── sitemap.json               # 站点地图配置
├── project.config.json        # 项目配置文件
├── project.private.config.json # 私有项目配置
├── pages/                     # 页面目录
│   ├── home/                  # 主页
│   ├── article-list/          # 文章列表
│   ├── article-detail/        # 文章详情
│   ├── course/                # 课程页面
│   ├── profile/               # 个人中心
│   ├── admin/                 # 管理后台
│   └── ...                    # 其他页面
├── utils/                     # 工具函数
│   ├── api.js                 # API接口封装
│   ├── auth.js                # 用户认证
│   ├── config.js              # 配置文件
│   ├── upload.js              # 文件上传
│   └── ...                    # 其他工具
├── static/                    # 静态资源
│   ├── images/                # 图片资源
│   └── logo.png               # 应用Logo
└── convert_icons.html         # 图标转换工具
```

## 开发说明

1. 使用微信开发者工具打开 `frontend` 目录
2. 确保已配置好后端API地址
3. 根据 `utils/config.js` 配置开发环境

## 技术栈

- 微信小程序原生开发
- JavaScript (ES6+)
- WXSS 样式
- WXML 模板

更多详细信息请参考项目根目录下的 `docs/` 文档。 