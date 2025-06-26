# Miracle Agility MySQL 数据库设计文档

## 数据库概述
本文档描述了Miracle Agility小程序的MySQL数据库设计，包括所有表结构、字段定义、索引设计和关系约束。

## 数据库配置
- **数据库引擎**: InnoDB
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **时区**: Asia/Shanghai

## 表结构设计

### 1. 用户相关表

#### 1.1 用户表 (users)
```sql
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
```

#### 1.2 用户会话表 (user_sessions)
```sql
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

### 2. 课程相关表

#### 2.1 课程表 (courses)
```sql
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
    lesson_count INT DEFAULT 0 COMMENT '课时数量',
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

#### 2.2 章节表 (chapters)
```sql
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '章节ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    title VARCHAR(200) NOT NULL COMMENT '章节标题',
    description TEXT COMMENT '章节描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节表';
```

#### 2.3 课时表 (lessons)
```sql
CREATE TABLE lessons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '课时ID',
    chapter_id BIGINT NOT NULL COMMENT '章节ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    title VARCHAR(200) NOT NULL COMMENT '课时标题',
    content LONGTEXT COMMENT '课时内容',
    type ENUM('video', 'text', 'audio', 'document') DEFAULT 'video' COMMENT '课时类型',
    video_url VARCHAR(500) COMMENT '视频URL',
    audio_url VARCHAR(500) COMMENT '音频URL',
    document_url VARCHAR(500) COMMENT '文档URL',
    thumbnail VARCHAR(500) COMMENT '缩略图URL',
    duration_minutes INT DEFAULT 0 COMMENT '时长(分钟)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_free BOOLEAN DEFAULT FALSE COMMENT '是否免费',
    transcript TEXT COMMENT '字幕/文稿',
    materials JSON COMMENT '学习资料',
    exercises JSON COMMENT '练习题',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时表';
```

#### 2.4 用户课程关系表 (user_courses)
```sql
CREATE TABLE user_courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习进度(百分比)',
    study_time INT DEFAULT 0 COMMENT '学习时长(分钟)',
    last_lesson_id BIGINT COMMENT '最后学习的课时ID',
    completed_lessons INT DEFAULT 0 COMMENT '已完成课时数',
    total_lessons INT DEFAULT 0 COMMENT '总课时数',
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled' COMMENT '状态',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    last_study_at TIMESTAMP NULL COMMENT '最后学习时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (last_lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_course (user_id, course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户课程关系表';
```

#### 2.5 用户课时学习记录表 (user_lesson_progress)
```sql
CREATE TABLE user_lesson_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    lesson_id BIGINT NOT NULL COMMENT '课时ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '学习进度(百分比)',
    study_time INT DEFAULT 0 COMMENT '学习时长(分钟)',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否完成',
    last_position INT DEFAULT 0 COMMENT '最后播放位置(秒)',
    started_at TIMESTAMP NULL COMMENT '开始学习时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_lesson (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户课时学习记录表';
```

### 3. 文章相关表

#### 3.1 文章表 (articles)
```sql
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文章ID',
    title VARCHAR(200) NOT NULL COMMENT '文章标题',
    summary TEXT COMMENT '文章摘要',
    content LONGTEXT COMMENT '文章内容',
    cover VARCHAR(500) COMMENT '封面图片URL',
    category VARCHAR(50) COMMENT '文章分类',
    tags JSON COMMENT '标签数组',
    author_id BIGINT COMMENT '作者ID',
    author_name VARCHAR(100) COMMENT '作者姓名',
    status ENUM('draft', 'pending', 'published', 'rejected', 'archived') DEFAULT 'draft' COMMENT '状态',
    is_top BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_featured BOOLEAN DEFAULT FALSE COMMENT '是否精选',
    read_count INT DEFAULT 0 COMMENT '阅读量',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    collect_count INT DEFAULT 0 COMMENT '收藏数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    sort_order INT DEFAULT 0 COMMENT '排序',
    seo_title VARCHAR(200) COMMENT 'SEO标题',
    seo_description TEXT COMMENT 'SEO描述',
    seo_keywords VARCHAR(500) COMMENT 'SEO关键词',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted_at TIMESTAMP NULL COMMENT '删除时间',
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_author_id (author_id),
    INDEX idx_published_at (published_at),
    INDEX idx_is_top (is_top),
    INDEX idx_is_featured (is_featured),
    INDEX idx_sort_order (sort_order),
    FULLTEXT idx_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';
```

#### 3.2 文章互动表 (article_interactions)
```sql
CREATE TABLE article_interactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    article_id BIGINT NOT NULL COMMENT '文章ID',
    type ENUM('like', 'collect', 'share', 'read') NOT NULL COMMENT '互动类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_article_type (user_id, article_id, type),
    INDEX idx_user_id (user_id),
    INDEX idx_article_id (article_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章互动表';
```

### 4. 订单和支付表

#### 4.1 订单表 (orders)
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(64) UNIQUE NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    course_id BIGINT NOT NULL COMMENT '课程ID',
    course_title VARCHAR(200) NOT NULL COMMENT '课程标题',
    original_price DECIMAL(10,2) NOT NULL COMMENT '原价',
    discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
    final_price DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    payment_method VARCHAR(50) COMMENT '支付方式',
    payment_channel VARCHAR(50) COMMENT '支付渠道',
    payment_no VARCHAR(100) COMMENT '支付流水号',
    status ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
    paid_at TIMESTAMP NULL COMMENT '支付时间',
    expired_at TIMESTAMP NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
```

### 5. 成就系统表

#### 5.1 成就表 (achievements)
```sql
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成就ID',
    title VARCHAR(100) NOT NULL COMMENT '成就标题',
    description TEXT COMMENT '成就描述',
    icon VARCHAR(500) COMMENT '成就图标URL',
    type VARCHAR(50) NOT NULL COMMENT '成就类型',
    condition_type VARCHAR(50) NOT NULL COMMENT '达成条件类型',
    condition_value INT NOT NULL COMMENT '达成条件值',
    points INT DEFAULT 0 COMMENT '奖励积分',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就表';
```

#### 5.2 用户成就表 (user_achievements)
```sql
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    achievement_id BIGINT NOT NULL COMMENT '成就ID',
    progress INT DEFAULT 0 COMMENT '当前进度',
    is_unlocked BOOLEAN DEFAULT FALSE COMMENT '是否解锁',
    unlocked_at TIMESTAMP NULL COMMENT '解锁时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户成就表';
```

### 6. 通知和消息表

#### 6.1 通知表 (notifications)
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(50) NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    data JSON COMMENT '额外数据',
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    read_at TIMESTAMP NULL COMMENT '阅读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';
```

### 7. 反馈和举报表

#### 7.1 反馈表 (feedbacks)
```sql
CREATE TABLE feedbacks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '反馈ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(50) NOT NULL COMMENT '反馈类型',
    title VARCHAR(200) NOT NULL COMMENT '反馈标题',
    content TEXT NOT NULL COMMENT '反馈内容',
    images JSON COMMENT '图片数组',
    contact VARCHAR(200) COMMENT '联系方式',
    status ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending' COMMENT '处理状态',
    admin_reply TEXT COMMENT '管理员回复',
    processed_by BIGINT COMMENT '处理人ID',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反馈表';
```

#### 7.2 举报表 (reports)
```sql
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '举报ID',
    user_id BIGINT NOT NULL COMMENT '举报用户ID',
    target_type VARCHAR(50) NOT NULL COMMENT '举报目标类型',
    target_id BIGINT NOT NULL COMMENT '举报目标ID',
    reason VARCHAR(50) NOT NULL COMMENT '举报原因',
    description TEXT COMMENT '举报描述',
    evidence JSON COMMENT '举报证据',
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
    admin_note TEXT COMMENT '管理员备注',
    processed_by BIGINT COMMENT '处理人ID',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_type, target_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';
```

### 8. 文件和媒体表

#### 8.1 文件表 (files)
```sql
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    filename VARCHAR(255) NOT NULL COMMENT '文件名',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_url VARCHAR(500) NOT NULL COMMENT '文件URL',
    file_size BIGINT NOT NULL COMMENT '文件大小(字节)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
    upload_type VARCHAR(50) NOT NULL COMMENT '上传类型',
    user_id BIGINT NOT NULL COMMENT '上传用户ID',
    status ENUM('uploading', 'success', 'failed') DEFAULT 'uploading' COMMENT '上传状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_file_type (file_type),
    INDEX idx_upload_type (upload_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';
```

### 9. 草稿和编辑器表

#### 9.1 草稿表 (drafts)
```sql
CREATE TABLE drafts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '草稿ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(50) NOT NULL COMMENT '草稿类型',
    title VARCHAR(200) COMMENT '标题',
    content LONGTEXT COMMENT '内容',
    data JSON COMMENT '额外数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='草稿表';
```

### 10. 系统配置表

#### 10.1 系统配置表 (system_configs)
```sql
CREATE TABLE system_configs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type VARCHAR(50) DEFAULT 'string' COMMENT '配置类型',
    description TEXT COMMENT '配置描述',
    is_public BOOLEAN DEFAULT FALSE COMMENT '是否公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_config_key (config_key),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
```

#### 10.2 操作日志表 (operation_logs)
```sql
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id BIGINT COMMENT '操作用户ID',
    action VARCHAR(100) NOT NULL COMMENT '操作动作',
    resource_type VARCHAR(50) COMMENT '资源类型',
    resource_id BIGINT COMMENT '资源ID',
    description TEXT COMMENT '操作描述',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';
```

## 数据库索引优化

### 复合索引
```sql
-- 用户课程学习记录复合索引
ALTER TABLE user_lesson_progress ADD INDEX idx_user_course_lesson (user_id, course_id, lesson_id);

-- 文章查询复合索引
ALTER TABLE articles ADD INDEX idx_status_category_published (status, category, published_at);

-- 订单查询复合索引
ALTER TABLE orders ADD INDEX idx_user_status_created (user_id, status, created_at);

-- 通知查询复合索引
ALTER TABLE notifications ADD INDEX idx_user_read_created (user_id, is_read, created_at);
```

## 数据库初始化脚本

### 初始化数据
```sql
-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES
('app_name', 'Miracle Agility', 'string', '应用名称', TRUE),
('app_version', '1.0.0', 'string', '应用版本', TRUE),
('max_upload_size', '10485760', 'integer', '最大上传文件大小(字节)', FALSE),
('default_avatar', 'https://example.com/default-avatar.png', 'string', '默认头像', TRUE);

-- 插入默认成就
INSERT INTO achievements (title, description, icon, type, condition_type, condition_value, points, sort_order) VALUES
('初学者', '完成第一个课程', '🎓', 'course', 'completed_courses', 1, 10, 1),
('勤奋学习', '连续学习7天', '📚', 'study', 'study_streak', 7, 20, 2),
('课程达人', '完成10个课程', '🏆', 'course', 'completed_courses', 10, 50, 3),
('分享达人', '分享文章10次', '📤', 'social', 'share_count', 10, 30, 4);

-- 插入文章分类
INSERT INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES
('article_categories', '["训练技巧", "赛事通知", "经验分享", "器材推荐", "健康护理"]', 'json', '文章分类', TRUE),
('course_categories', '["基础训练", "技能提升", "竞技训练", "健康护理"]', 'json', '课程分类', TRUE);
```

## 性能优化建议

### 1. 查询优化
- 使用合适的索引覆盖常用查询
- 避免SELECT *，只查询需要的字段
- 使用LIMIT限制返回结果数量
- 合理使用JOIN，避免N+1查询问题

### 2. 存储优化
- 使用适当的数据类型，避免过度设计
- 对于大文本字段考虑分离存储
- 定期清理过期数据
- 使用压缩存储减少空间占用

### 3. 缓存策略
- 热点数据使用Redis缓存
- 静态配置数据缓存到应用内存
- 用户会话信息缓存
- 课程列表等相对静态数据缓存

### 4. 监控和维护
- 定期分析慢查询日志
- 监控数据库连接数和性能指标
- 定期备份重要数据
- 设置合理的数据保留策略

## 数据备份和恢复

### 备份策略
```bash
# 全量备份
mysqldump -u root -p --single-transaction --routines --triggers miracle_agility > backup_$(date +%Y%m%d_%H%M%S).sql

# 增量备份（基于binlog）
mysqlbinlog --start-datetime="2024-03-15 00:00:00" --stop-datetime="2024-03-15 23:59:59" mysql-bin.000001 > incremental_backup.sql
```

### 恢复策略
```bash
# 恢复全量备份
mysql -u root -p miracle_agility < backup_20240315_120000.sql

# 恢复增量备份
mysql -u root -p miracle_agility < incremental_backup.sql
```

## 数据安全

### 1. 访问控制
- 为不同角色创建专用数据库用户
- 限制用户权限，遵循最小权限原则
- 定期更换数据库密码

### 2. 数据加密
- 敏感字段使用AES加密存储
- 传输过程使用SSL/TLS加密
- 定期轮换加密密钥

### 3. 审计日志
- 记录所有数据变更操作
- 监控异常访问模式
- 保留足够的审计日志用于追溯

这个数据库设计涵盖了Miracle Agility小程序的所有功能需求，包括用户管理、课程学习、内容发布、支付订单、成就系统等。设计时考虑了数据完整性、性能优化、扩展性和安全性等方面。 