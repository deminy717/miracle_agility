# 课时系统简化版开发文档

## 概述

根据LessonController的删改，课时系统已简化为核心功能，移除了统计、学习追踪等高级功能。

## 删改后的API接口列表

### 保留的接口 (8个)

1. **POST /api/lessons/create** - 创建课时
2. **GET /api/lessons/{lessonId}** - 获取课时详情
3. **GET /api/lessons/chapter/{chapterId}** - 根据章节ID获取课时列表
4. **GET /api/lessons/course/{courseId}** - 根据课程ID获取课时列表
5. **GET /api/lessons/chapter/{chapterId}/published** - 根据章节ID获取已发布的课时列表
6. **PUT /api/lessons/{lessonId}** - 更新课时
7. **DELETE /api/lessons/{lessonId}** - 删除课时
8. **POST /api/lessons/{lessonId}/publish** - 发布课时

### 删除的接口 (7个)

1. ~~POST /api/lessons/{lessonId}/archive~~ - 归档课时
2. ~~POST /api/lessons/chapter/{chapterId}/sort~~ - 更新课时排序
3. ~~GET /api/lessons/my~~ - 获取我创建的课时列表
4. ~~GET /api/lessons/chapter/{chapterId}/stats~~ - 获取章节课时统计信息
5. ~~GET /api/lessons/course/{courseId}/stats~~ - 获取课程课时统计信息
6. ~~POST /api/lessons/{lessonId}/study~~ - 记录课时学习
7. ~~POST /api/lessons/{lessonId}/completion~~ - 记录课时完成

## 数据库结构变化

### lessons表 - 移除字段

- ~~study_count~~ - 学习人数
- ~~completion_count~~ - 完成人数
- ~~archived状态~~ - 状态只保留 draft, published

### lesson_cards表 - 无变化

课时卡片表保持完整功能，支持多种卡片类型。

## 实体类变化

### Lesson.java - 简化

```java
// 移除的字段
- private Integer studyCount;
- private Integer completionCount;

// 移除的方法
- public boolean isArchived()
- public void archive()
- public void incrementStudyCount()
- public void incrementCompletionCount()

// 简化的状态
private String status; // 只支持 "draft", "published"
```

### LessonResponse.java - 简化

```java
// 移除的字段
- private Integer studyCount;
- private Integer completionCount;
```

## 前端变化

### 章节管理页面

- 移除了学习人数、完成人数的显示
- 保留了课时的基本管理功能

### 课时详情页面

- 移除了学习统计信息
- 保留了课时基本信息和内容卡片展示

## 数据库执行结果

✅ **成功创建表结构**
- `lessons` 表：3条示例数据
- `lesson_cards` 表：5条示例数据

✅ **成功创建索引**
- 章节-状态-排序复合索引
- 课程-状态-排序复合索引
- 课时卡片-类型-排序复合索引

## 核心功能保留

1. **课时CRUD** - 创建、读取、更新、删除
2. **状态管理** - 草稿、发布状态切换
3. **内容管理** - 支持多种类型的课时卡片
4. **层级关系** - 课程→章节→课时→卡片的完整层级
5. **查询功能** - 按章节、课程查询课时列表

## 简化带来的好处

1. **降低复杂度** - 移除了不必要的统计和追踪功能
2. **提升性能** - 减少了数据库字段和计算开销
3. **易于维护** - 代码结构更清晰，功能更聚焦
4. **快速迭代** - 核心功能稳定，便于后续扩展

## 后续扩展建议

如果需要恢复统计功能，可以考虑：
1. 单独创建学习记录表
2. 使用缓存存储统计数据
3. 异步计算统计信息

---

**更新时间**: 2024年12月
**版本**: 简化版 v1.0 