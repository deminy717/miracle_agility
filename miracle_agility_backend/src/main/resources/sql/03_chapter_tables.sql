-- ===============================================
-- 章节相关表结构定义
-- 创建时间: 2024-12-19
-- 说明: 支持卡片式编辑器的章节内容管理
-- ===============================================

-- 1. 课程表 (courses) - 如果不存在则创建
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
    deleted_at TIMESTAMP NULL COMMENT '删除时间(软删除)',
    
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_level (level),
    INDEX idx_status (status),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sort_order (sort_order),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 2. 章节表 (chapters)
CREATE TABLE IF NOT EXISTS chapters (
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
    lesson_count INT DEFAULT 0 COMMENT '课时数量',
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_course_id (course_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='章节表';

-- 3. 章节内容卡片表 (chapter_content_cards)
CREATE TABLE IF NOT EXISTS chapter_content_cards (
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

-- 插入测试课程数据（仅在数据不存在时）
INSERT IGNORE INTO courses (id, title, description, teacher_name, category, level, status, created_by) 
VALUES 
(1, '犬敏捷基础训练课程', '从零开始学习犬类敏捷训练的基础知识和技巧', '张教练', '基础训练', 'beginner', 'published', 1),
(2, '高级障碍训练技巧', '进阶的犬类敏捷训练技巧和比赛准备', '李教练', '进阶训练', 'advanced', 'published', 1);

-- 插入测试章节数据（仅在数据不存在时）
INSERT IGNORE INTO chapters (id, course_id, title, description, sort_order, status, created_by) 
VALUES 
(1, 1, '第一章：敏捷训练入门', '了解敏捷训练的基本概念和准备工作', 1, 'published', 1),
(2, 1, '第二章：基础障碍训练', '学习基本的障碍物训练技巧', 2, 'published', 1),
(3, 1, '第三章：高级技巧训练', '掌握更复杂的敏捷训练技巧', 3, 'draft', 1);

-- 插入测试卡片数据（仅在数据不存在时）
INSERT IGNORE INTO chapter_content_cards (id, chapter_id, card_type, title, content, sort_order, video_url, video_duration, video_views) 
VALUES 
(1, 1, 'video', '敏捷训练概述视频', '', 1, 'https://example.com/video1.mp4', '15分钟', '128人学习'),
(2, 1, 'text', '训练前准备', '在开始敏捷训练之前，需要确保以下几点准备工作...', 2, NULL, NULL, NULL),
(3, 1, 'highlight', '本章重点', '', 3, NULL, NULL, NULL);

-- 更新重点卡片的JSON数据
UPDATE chapter_content_cards 
SET highlight_points = JSON_ARRAY('掌握敏捷训练的基本概念', '了解训练前的准备工作', '建立正确的训练心态') 
WHERE id = 3; 