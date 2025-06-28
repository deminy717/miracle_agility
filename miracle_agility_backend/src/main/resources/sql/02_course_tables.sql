-- ===============================================
-- 课程相关表结构定义
-- 创建时间: 2024-12-19
-- 说明: 课程、文章、订单等核心业务表
-- ===============================================

-- 1. 课程表 (courses)
CREATE TABLE IF NOT EXISTS courses (
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

-- 2. 文章表 (articles)
CREATE TABLE IF NOT EXISTS articles (
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

-- 3. 文章互动表 (article_interactions)
CREATE TABLE IF NOT EXISTS article_interactions (
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

-- 4. 文件表 (files)
CREATE TABLE IF NOT EXISTS files (
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

-- 5. 系统配置表 (system_configs)
CREATE TABLE IF NOT EXISTS system_configs (
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

-- 插入系统配置初始数据
INSERT IGNORE INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES
('app_name', 'Miracle Agility', 'string', '应用名称', true),
('app_version', '1.0.0', 'string', '应用版本', true),
('file_upload_max_size', '104857600', 'number', '文件上传最大大小(字节)', false),
('image_upload_max_size', '10485760', 'number', '图片上传最大大小(字节)', false),
('video_upload_max_size', '104857600', 'number', '视频上传最大大小(字节)', false); 