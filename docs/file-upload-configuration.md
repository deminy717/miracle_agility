# 文件上传功能配置说明

## 概述
本文档说明了 Miracle Agility 项目的文件上传功能配置和使用方法。

## 目录结构

### 上传目录位置
```
miracle_agility_backend/
├── data/
│   └── uploads/
│       ├── .gitkeep
│       ├── images/        # 图片文件
│       ├── videos/        # 视频文件
│       └── documents/     # 文档文件
└── src/
    └── main/
        └── resources/
            └── application.yml
```

### 自动创建的子目录结构
文件上传时会自动创建按日期分类的目录：
```
data/uploads/images/chapter/2025/06/27/xxx.jpg
data/uploads/videos/course/2025/06/27/xxx.mp4
data/uploads/documents/general/2025/06/27/xxx.pdf
```

## 配置说明

### 1. Spring Boot 配置 (application.yml)
```yaml
# 文件上传配置
file:
  upload:
    path: ./data/uploads/        # 相对于后端项目根目录
  access:
    domain: http://localhost:8080   # 文件访问域名

# Spring 文件上传限制
spring:
  servlet:
    multipart:
      max-file-size: 100MB      # 单个文件最大大小
      max-request-size: 200MB   # 请求最大大小
      enabled: true
      file-size-threshold: 0
```

### 2. 静态资源映射 (WebConfig.java)
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射 /uploads/** 到文件系统路径
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}
```

## API 接口

### 1. 图片上传
```http
POST /api/upload/image
Content-Type: multipart/form-data

参数:
- file: 图片文件 (必需)
- category: 分类 (可选，默认: general)

支持格式: JPG, PNG, GIF, WebP
最大大小: 10MB

响应:
{
  "code": 200,
  "message": "图片上传成功",
  "data": {
    "url": "http://localhost:8080/uploads/images/chapter/2025/06/27/xxx.jpg",
    "originalName": "example.jpg",
    "size": 123456,
    "category": "chapter",
    "uploadTime": "2025-06-27T21:30:00",
    "uploadBy": 5
  }
}
```

### 2. 视频上传
```http
POST /api/upload/video
Content-Type: multipart/form-data

参数:
- file: 视频文件 (必需)
- category: 分类 (可选，默认: general)

支持格式: MP4, AVI, MOV, M4V
最大大小: 100MB
```

### 3. 通用文件上传
```http
POST /api/upload/file
Content-Type: multipart/form-data

参数:
- file: 文件 (必需)
- category: 分类 (可选，默认: general)
- fileType: 文件类型 (可选，默认: document)

最大大小: 50MB
```

## 文件访问

### URL 格式
上传成功后，文件可通过以下URL访问：
```
http://localhost:8080/uploads/{fileType}/{category}/{yyyy}/{MM}/{dd}/{filename}
```

例如：
```
http://localhost:8080/uploads/images/chapter/2025/06/27/586a6ead80f347108c38fdca87a1580f.jpg
```

### 文件命名规则
- 使用 UUID 生成唯一文件名
- 保留原始文件扩展名
- 格式：`{32位UUID}.{扩展名}`

## 安全配置

### 1. 文件类型验证
- **图片**：仅允许 image/jpeg, image/png, image/gif, image/webp
- **视频**：仅允许 video/mp4, video/avi, video/quicktime, video/x-msvideo
- **其他文件**：根据需要配置白名单

### 2. 文件大小限制
- 图片：最大 10MB
- 视频：最大 100MB
- 其他文件：最大 50MB

### 3. 权限控制
- 所有上传操作都需要用户登录
- 通过 JWT Token 验证用户身份
- 记录上传者ID和上传时间

## 故障排除

### 1. 文件上传失败
**错误**: `java.io.FileNotFoundException: /data/uploads/... (No such file or directory)`

**解决方案**:
1. 确认 `miracle_agility_backend/data/uploads/` 目录存在
2. 检查目录权限是否可写
3. 确认配置文件中的路径设置正确

### 2. 文件访问404
**错误**: 上传成功但无法通过URL访问文件

**解决方案**:
1. 确认 `WebConfig.java` 静态资源映射配置正确
2. 检查文件是否真正保存到指定位置
3. 确认服务器端口和域名配置

### 3. 文件大小超限
**错误**: `Maximum upload size exceeded`

**解决方案**:
1. 调整 `application.yml` 中的文件大小限制
2. 检查 Tomcat 或其他服务器的上传限制
3. 前端也需要相应调整文件大小检查

## 开发建议

### 1. 本地开发
- 使用相对路径配置，便于不同开发者环境
- 在 `.gitignore` 中排除上传文件，避免提交到版本控制

### 2. 生产部署
- 考虑使用专门的文件存储服务（如OSS、COS等）
- 配置CDN加速文件访问
- 定期清理过期或无效文件

### 3. 性能优化
- 对大文件启用分片上传
- 实现文件压缩和格式转换
- 添加文件缓存策略

## 测试验证

### 1. 手动测试
```bash
# 使用 curl 测试图片上传
curl -X POST \
  http://localhost:8080/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "category=test"
```

### 2. 验证文件访问
上传成功后，通过返回的URL验证文件是否可以正常访问。

---

## 总结

文件上传功能现在配置为：
- ✅ 使用项目相对路径 `./data/uploads/`
- ✅ 自动创建目录结构
- ✅ 支持多种文件类型
- ✅ 配置文件大小限制
- ✅ 实现权限验证
- ✅ 提供静态文件访问

配置完成后，文件上传功能应该可以正常工作，不再出现 `FileNotFoundException` 错误。 