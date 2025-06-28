# Miracle Agility 数据库设置指南

## 概述
本文档提供了Miracle Agility项目数据库的完整设置步骤，包括MySQL数据库创建、表结构建立和初始数据导入。

## 环境要求
- MySQL 8.0 或更高版本
- 数据库字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

## 1. 数据库创建

### 1.1 连接MySQL
```bash
mysql -u root -p
```

### 1.2 创建数据库
```sql
-- 创建数据库
CREATE DATABASE miracle_agility 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE miracle_agility;

-- 验证数据库字符集
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'miracle_agility';
```

### 1.3 创建数据库用户（可选）
```sql
-- 创建专用用户
CREATE USER 'miracle_user'@'localhost' IDENTIFIED BY 'miracle_password_2024';

-- 授权
GRANT ALL PRIVILEGES ON miracle_agility.* TO 'miracle_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```

## 2. 表结构建立

### 2.1 执行建表脚本

项目中提供了完整的SQL建表脚本，按以下顺序执行：

#### 方式一：使用项目SQL文件
```bash
# 进入项目后端目录
cd miracle_agility_backend/src/main/resources/sql

# 按顺序执行SQL文件
mysql -u root -p miracle_agility < 01_user_tables.sql
mysql -u root -p miracle_agility < 02_course_tables.sql
mysql -u root -p miracle_agility < 03_chapter_tables.sql
```

#### 方式二：手动执行（逐个执行）

**步骤1：创建用户相关表**
```sql
-- 切换到数据库
USE miracle_agility;

-- 创建用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(64) UNIQUE NOT NULL COMMENT '微信openid',
    unionid VARCHAR(64) COMMENT '微信unionid',
    nickname VARCHAR(100) NOT NULL COMMENT '用户昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    gender TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    birthday DATE COMMENT '生日',
    city VARCHAR(50) COMMENT '城市',
    province VARCHAR(50) COMMENT '省份',
    country VARCHAR(50) COMMENT '国家',
    role ENUM('user', 'teacher', 'admin') DEFAULT 'user' COMMENT '用户角色',
    status ENUM('active', 'banned', 'inactive') DEFAULT 'active' COMMENT '用户状态',
    total_study_time INT DEFAULT 0 COMMENT '总学习时长(分钟)',
    total_courses INT DEFAULT 0 COMMENT '已购买课程数',
    completed_courses INT DEFAULT 0 COMMENT '已完成课程数',
    study_days INT DEFAULT 0 COMMENT '累计学习天数',
    current_streak INT DEFAULT 0 COMMENT '连续学习天数',
    last_login_at TIMESTAMP COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    INDEX idx_openid (openid),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建用户会话表
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    token VARCHAR(255) NOT NULL COMMENT '访问令牌',
    refresh_token VARCHAR(255) COMMENT '刷新令牌',
    device_type VARCHAR(50) COMMENT '设备类型',
    device_id VARCHAR(100) COMMENT '设备ID',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';
```

**步骤2：创建课程相关表**
```sql
-- 创建课程表
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID',
    title VARCHAR(200) NOT NULL COMMENT '课程标题',
    description TEXT COMMENT '课程描述',
    cover VARCHAR(500) COMMENT '封面图片URL',
    teacher_id BIGINT COMMENT '教师ID',
    teacher_name VARCHAR(100) COMMENT '教师姓名',
    category VARCHAR(50) COMMENT '课程分类',
    level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' COMMENT '课程级别',
    price DECIMAL(10,2) DEFAULT 0.00 COMMENT '课程价格',
    original_price DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
    duration_minutes INT DEFAULT 0 COMMENT '总时长(分钟)',
    chapter_count INT DEFAULT 0 COMMENT '章节数量',
    student_count INT DEFAULT 0 COMMENT '学生数量',
    rating DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
    rating_count INT DEFAULT 0 COMMENT '评分人数',
    tags JSON COMMENT '标签数组',
    requirements JSON COMMENT '学习要求',
    objectives JSON COMMENT '学习目标',
    status ENUM('draft', 'pending', 'published', 'rejected', 'archived') DEFAULT 'draft' COMMENT '状态',
    is_free BOOLEAN DEFAULT FALSE COMMENT '是否免费',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_by BIGINT COMMENT '创建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_level (level),
    INDEX idx_status (status),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
```

**步骤3：创建章节和内容卡片表**
```sql
-- 创建章节表
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '章节ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    description TEXT NOT NULL COMMENT '章节描述',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft' COMMENT '章节状态',
    duration_minutes INT DEFAULT 0 COMMENT '预计学习时长(分钟)',
    content_card_count INT DEFAULT 0 COMMENT '内容卡片数量',
    created_by BIGINT COMMENT '创建者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间(软删除)',
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节表';

-- 创建章节内容卡片表
CREATE TABLE chapter_content_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '卡片ID',
    chapter_id BIGINT NOT NULL COMMENT '章节ID',
    card_type ENUM('video', 'text', 'image', 'highlight') NOT NULL COMMENT '卡片类型',
    title VARCHAR(200) COMMENT '卡片标题',
    content LONGTEXT COMMENT '文本内容',
    sort_order INT DEFAULT 0 COMMENT '卡片排序',
    
    -- 视频相关字段
    video_url VARCHAR(1000) COMMENT '视频URL',
    video_duration VARCHAR(50) COMMENT '视频时长描述',
    video_views VARCHAR(50) COMMENT '观看次数描述',
    video_thumbnail VARCHAR(500) COMMENT '视频缩略图',
    
    -- 图片相关字段  
    image_url VARCHAR(1000) COMMENT '图片URL',
    image_description TEXT COMMENT '图片描述',
    
    -- 重点卡片相关字段
    highlight_points JSON COMMENT '重点内容列表',
    
    -- 扩展字段
    extra_data JSON COMMENT '扩展数据字段',
    
    -- 状态和时间字段
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '卡片状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间(软删除)',
    
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_card_type (card_type),
    INDEX idx_sort_order (sort_order),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节内容卡片表';
```

### 2.2 验证表创建结果
```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE users;
DESCRIBE courses;
DESCRIBE chapters;
DESCRIBE chapter_content_cards;

-- 查看外键约束
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IS NOT NULL
AND TABLE_SCHEMA = 'miracle_agility';
```

## 3. 初始数据导入

### 3.1 创建测试管理员用户
```sql
-- 插入测试管理员用户
INSERT INTO users (openid, nickname, role, status) VALUES 
('test_admin_openid', '系统管理员', 'admin', 'active');

-- 获取用户ID（记录下来，后续会用到）
SELECT id, nickname, role FROM users WHERE openid = 'test_admin_openid';
```

### 3.2 导入测试课程数据
```sql
-- 插入测试课程（假设管理员用户ID为1）
INSERT INTO courses (title, description, teacher_name, category, level, status, created_by) VALUES 
('犬敏捷基础训练课程', '从零开始学习犬类敏捷训练的基础知识和技巧', '张教练', '基础训练', 'beginner', 'published', 1),
('高级障碍训练技巧', '进阶的犬类敏捷训练技巧和比赛准备', '李教练', '进阶训练', 'advanced', 'published', 1);

-- 插入测试章节
INSERT INTO chapters (course_id, title, description, sort_order, status, created_by) VALUES 
(1, '第一章：敏捷训练入门', '了解敏捷训练的基本概念和准备工作', 1, 'published', 1),
(1, '第二章：基础障碍训练', '学习基本的障碍物训练技巧', 2, 'published', 1),
(1, '第三章：高级技巧训练', '掌握更复杂的敏捷训练技巧', 3, 'draft', 1);

-- 插入测试内容卡片
INSERT INTO chapter_content_cards (chapter_id, card_type, title, content, sort_order, video_url, video_duration, video_views) VALUES 
(1, 'video', '敏捷训练概述视频', '', 1, 'https://example.com/video1.mp4', '15分钟', '128人学习'),
(1, 'text', '训练前准备', '在开始敏捷训练之前，需要确保以下几点准备工作...', 2, NULL, NULL, NULL),
(1, 'highlight', '本章重点', '', 3, NULL, NULL, NULL);

-- 更新重点卡片的JSON数据
UPDATE chapter_content_cards 
SET highlight_points = JSON_ARRAY('掌握敏捷训练的基本概念', '了解训练前的准备工作', '建立正确的训练心态') 
WHERE id = 3;
```

### 3.3 验证数据导入
```sql
-- 查看课程数据
SELECT id, title, teacher_name, status FROM courses;

-- 查看章节数据
SELECT id, course_id, title, status FROM chapters;

-- 查看内容卡片数据
SELECT id, chapter_id, card_type, title FROM chapter_content_cards;

-- 查看JSON数据
SELECT id, title, highlight_points FROM chapter_content_cards WHERE card_type = 'highlight';
```

## 4. 数据库配置

### 4.1 更新应用配置
确保 `application.yml` 中的数据库配置正确：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/miracle_agility?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: miracle_user  # 或 root
    password: miracle_password_2024  # 对应的密码
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 4.2 验证连接
启动Spring Boot应用，检查日志中是否有数据库连接成功的信息。

## 5. 常见问题解决

### 5.1 字符集问题
如果遇到中文乱码：
```sql
-- 修改数据库字符集
ALTER DATABASE miracle_agility CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5.2 外键约束问题
如果外键创建失败：
```sql
-- 检查外键约束
SHOW CREATE TABLE chapters;

-- 删除外键（如果需要）
ALTER TABLE chapters DROP FOREIGN KEY chapters_ibfk_1;

-- 重新添加外键
ALTER TABLE chapters ADD CONSTRAINT fk_chapters_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
```

### 5.3 权限问题
如果遇到权限错误：
```sql
-- 检查用户权限
SHOW GRANTS FOR 'miracle_user'@'localhost';

-- 重新授权
GRANT ALL PRIVILEGES ON miracle_agility.* TO 'miracle_user'@'localhost';
FLUSH PRIVILEGES;
```

## 6. 备份和恢复

### 6.1 数据库备份
```bash
# 备份整个数据库
mysqldump -u root -p miracle_agility > miracle_agility_backup_$(date +%Y%m%d).sql

# 只备份结构
mysqldump -u root -p --no-data miracle_agility > miracle_agility_structure.sql

# 只备份数据
mysqldump -u root -p --no-create-info miracle_agility > miracle_agility_data.sql
```

### 6.2 数据库恢复
```bash
# 恢复数据库
mysql -u root -p miracle_agility < miracle_agility_backup_20241219.sql
```

## 7. 性能优化建议

### 7.1 索引优化
```sql
-- 查看索引使用情况
SHOW INDEX FROM chapters;
SHOW INDEX FROM chapter_content_cards;

-- 分析查询性能
EXPLAIN SELECT * FROM chapters WHERE course_id = 1 AND status = 'published';
```

### 7.2 配置优化
在 `my.cnf` 中添加：
```ini
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

---

## 完成确认

执行完以上步骤后，您的Miracle Agility数据库应该已经设置完成，包含了完整的用户、课程、章节和内容卡片表结构，以及必要的测试数据。

可以通过以下SQL验证设置是否成功：
```sql
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 
    'Chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 
    'Content Cards', COUNT(*) FROM chapter_content_cards;
```

如果看到各表都有相应的数据记录，说明数据库设置成功！ 