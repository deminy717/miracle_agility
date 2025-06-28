# 课时系统开发文档

## 项目概述

本文档记录了Miracle Agility微信小程序课时系统的完整开发过程，包括数据库设计、后端API开发、前端界面改造等。

## 数据结构设计

### 新的数据层次结构
```
Course (课程) → Chapter (章节) → Lesson (课时) → LessonCard (课时卡片)
```

### 实体关系
- **Course**: 课程主体
- **Chapter**: 章节，属于某个课程
- **Lesson**: 课时，属于某个章节和课程
- **LessonCard**: 课时内容卡片，属于某个课时

## 后端开发

### 1. 实体类 (Entity)

#### Lesson.java
- 课时主体实体
- 包含基本信息：标题、描述、时长、状态等
- 支持视频、缩略图等多媒体字段
- 包含学习统计：学习人数、完成人数
- 业务方法：发布、归档、统计等

#### LessonCard.java  
- 课时内容卡片实体
- 支持多种卡片类型：video、text、image、highlight、quiz、audio
- 针对不同类型提供专用字段
- JSON字段存储复杂数据：重点列表、测验数据

### 2. 数据传输对象 (DTO)

#### LessonCreateRequest.java
- 课时创建请求DTO
- 包含课时基本信息
- 嵌套LessonCardRequest用于创建课时卡片
- 数据验证注解

#### LessonResponse.java
- 课时响应DTO
- 使用Builder模式构建
- 嵌套LessonCardResponse用于返回卡片数据
- 提供静态方法fromEntity进行转换

### 3. 数据访问层 (Mapper)

#### LessonMapper.java
- 继承BaseMapper，提供基础CRUD操作
- 使用MyBatis-Plus注解

#### LessonCardMapper.java  
- 课时卡片数据访问
- 继承BaseMapper

### 4. 业务逻辑层 (Service)

#### LessonService.java
- 课时业务接口
- 定义所有课时相关操作方法

#### LessonServiceImpl.java
- 课时业务实现类
- 完整的CRUD操作
- 事务管理
- 状态管理：发布、归档
- 统计功能
- 排序管理
- 课时卡片关联管理

### 5. 控制器层 (Controller)

#### LessonController.java
- RESTful API接口
- 统一异常处理
- 认证验证
- 日志记录
- 响应格式统一

## API接口设计

### 基础CRUD
- `POST /api/lessons/create` - 创建课时
- `GET /api/lessons/{lessonId}` - 获取课时详情
- `PUT /api/lessons/{lessonId}` - 更新课时
- `DELETE /api/lessons/{lessonId}` - 删除课时

### 查询接口
- `GET /api/lessons/chapter/{chapterId}` - 获取章节课时列表
- `GET /api/lessons/course/{courseId}` - 获取课程课时列表
- `GET /api/lessons/chapter/{chapterId}/published` - 获取已发布课时
- `GET /api/lessons/my` - 获取我创建的课时

### 状态管理
- `POST /api/lessons/{lessonId}/publish` - 发布课时
- `POST /api/lessons/{lessonId}/archive` - 归档课时

### 排序管理
- `POST /api/lessons/chapter/{chapterId}/sort` - 更新课时排序

### 统计接口
- `GET /api/lessons/chapter/{chapterId}/stats` - 获取章节课时统计
- `GET /api/lessons/course/{courseId}/stats` - 获取课程课时统计

### 学习追踪
- `POST /api/lessons/{lessonId}/study` - 记录学习
- `POST /api/lessons/{lessonId}/completion` - 记录完成

## 数据库设计

### lessons表结构
```sql
CREATE TABLE `lessons` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `chapter_id` bigint NOT NULL,
    `course_id` bigint NOT NULL,
    `title` varchar(200) NOT NULL,
    `description` text,
    `sort_order` int DEFAULT 0,
    `status` varchar(20) DEFAULT 'draft',
    `duration_minutes` int DEFAULT NULL,
    `lesson_card_count` int DEFAULT 0,
    `video_url` varchar(500) DEFAULT NULL,
    `video_duration` varchar(50) DEFAULT NULL,
    `thumbnail_url` varchar(500) DEFAULT NULL,
    `study_count` int DEFAULT 0,
    `completion_count` int DEFAULT 0,
    `created_by` bigint NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `published_at` timestamp NULL DEFAULT NULL,
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    -- 索引定义
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### lesson_cards表结构
```sql
CREATE TABLE `lesson_cards` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `lesson_id` bigint NOT NULL,
    `chapter_id` bigint DEFAULT NULL,
    `course_id` bigint DEFAULT NULL,
    `card_type` varchar(50) NOT NULL,
    `title` varchar(200) DEFAULT NULL,
    `content` longtext,
    `sort_order` int DEFAULT 0,
    -- 多媒体字段
    `video_url` varchar(500) DEFAULT NULL,
    `image_url` varchar(500) DEFAULT NULL,
    `audio_url` varchar(500) DEFAULT NULL,
    -- JSON字段
    `highlight_points` text,
    `quiz_data` text,
    `extra_data` text,
    -- 状态字段
    `status` varchar(20) DEFAULT 'active',
    `is_required` tinyint(1) DEFAULT 0,
    `completion_required` tinyint(1) DEFAULT 0,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    -- 索引定义
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 前端开发

### 页面改造

#### card-editor页面
- 原内容编辑器改造为课时创建页面
- 支持课时基本信息输入
- 支持课时类型和难度选择
- 集成课时卡片编辑功能
- 表单验证和错误处理

#### 章节管理页面
- 绿色按钮功能调整：从"新增子章节"改为"新增课时"
- 跳转参数修改：`type=lesson`
- 按钮事件优化：使用catchtap防止冒泡

### API调用封装

#### utils/api.js新增方法
```javascript
// 课时相关API
getLessonsByChapterId: (chapterId) => request(`/api/lessons/chapter/${chapterId}`, {}, 'GET'),
getLessonsByCourseId: (courseId) => request(`/api/lessons/course/${courseId}`, {}, 'GET'),
createLesson: (lessonData) => request('/api/lessons/create', lessonData, 'POST'),
updateLesson: (lessonId, lessonData) => request(`/api/lessons/${lessonId}`, lessonData, 'PUT'),
deleteLesson: (lessonId) => request(`/api/lessons/${lessonId}`, {}, 'DELETE'),
// ... 其他方法
```

## 技术特性

### 后端技术特性
1. **分层架构**: Controller → Service → Mapper
2. **数据验证**: JSR-303注解验证
3. **事务管理**: @Transactional注解
4. **软删除**: deleted_at字段
5. **审计字段**: created_at, updated_at自动管理
6. **JSON支持**: 复杂数据JSON存储
7. **统一响应**: ApiResponse包装
8. **异常处理**: 统一异常捕获和处理

### 前端技术特性
1. **表单验证**: 客户端验证
2. **错误处理**: Toast提示
3. **加载状态**: Loading和错误状态管理
4. **事件优化**: catchtap防止冒泡
5. **数据绑定**: 双向数据绑定
6. **路由传参**: 页面间数据传递

## 部署说明

### 数据库部署
1. 执行SQL脚本创建表结构
2. 配置数据库连接
3. 检查索引创建情况

### 后端部署
1. 确保所有依赖项正确引入
2. 配置数据库连接信息
3. 启动应用验证接口

### 前端部署
1. 更新API配置
2. 测试页面功能
3. 验证数据流

## 测试建议

### 单元测试
- Service层业务逻辑测试
- Mapper层数据访问测试
- DTO转换测试

### 集成测试
- API接口测试
- 数据库事务测试
- 异常处理测试

### 前端测试
- 页面功能测试
- 表单验证测试
- 错误处理测试

## 后续优化

### 性能优化
1. 数据库查询优化
2. 缓存策略添加
3. 分页查询实现
4. 批量操作优化

### 功能扩展
1. 课时内容富文本编辑器增强
2. 视频播放进度追踪
3. 学习报告和分析
4. 社交功能集成

### 安全加固
1. 权限控制细化
2. 数据加密存储
3. API访问限制
4. 审计日志完善

## 总结

本次开发成功实现了完整的课时系统，包括：
- 完善的数据模型设计
- 健壮的后端API实现
- 用户友好的前端界面
- 完整的业务流程支持

系统架构清晰，代码质量良好，为后续功能扩展奠定了坚实基础。 