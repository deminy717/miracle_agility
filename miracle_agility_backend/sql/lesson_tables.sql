-- 课时表（简化版）
CREATE TABLE IF NOT EXISTS `lessons` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `chapter_id` bigint NOT NULL COMMENT '章节ID',
    `course_id` bigint NOT NULL COMMENT '课程ID',
    `title` varchar(200) NOT NULL COMMENT '课时标题',
    `description` text COMMENT '课时描述',
    `sort_order` int DEFAULT 0 COMMENT '排序顺序',
    `status` varchar(20) DEFAULT 'draft' COMMENT '状态：draft-草稿，published-已发布',
    `duration_minutes` int DEFAULT NULL COMMENT '预计时长（分钟）',
    `lesson_card_count` int DEFAULT 0 COMMENT '课时卡片数量',
    `video_url` varchar(500) DEFAULT NULL COMMENT '主要视频URL',
    `video_duration` varchar(50) DEFAULT NULL COMMENT '视频时长',
    `thumbnail_url` varchar(500) DEFAULT NULL COMMENT '缩略图URL',
    `created_by` bigint NOT NULL COMMENT '创建者ID',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `published_at` timestamp NULL DEFAULT NULL COMMENT '发布时间',
    `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间（软删除）',
    PRIMARY KEY (`id`),
    KEY `idx_chapter_id` (`chapter_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时表';

-- 课时内容卡片表（简化版）
CREATE TABLE IF NOT EXISTS `lesson_cards` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `lesson_id` bigint NOT NULL COMMENT '课时ID',
    `chapter_id` bigint DEFAULT NULL COMMENT '章节ID（冗余字段）',
    `course_id` bigint DEFAULT NULL COMMENT '课程ID（冗余字段）',
    `card_type` varchar(50) NOT NULL COMMENT '卡片类型：video-视频，text-文本，image-图片，highlight-重点，quiz-测验，audio-音频',
    `title` varchar(200) DEFAULT NULL COMMENT '卡片标题',
    `content` longtext COMMENT '卡片内容',
    `sort_order` int DEFAULT 0 COMMENT '排序顺序',
    
    -- 视频相关字段
    `video_url` varchar(500) DEFAULT NULL COMMENT '视频URL',
    `video_duration` varchar(50) DEFAULT NULL COMMENT '视频时长',
    `video_views` varchar(50) DEFAULT NULL COMMENT '播放次数',
    `video_thumbnail` varchar(500) DEFAULT NULL COMMENT '视频缩略图',
    `video_file_size` bigint DEFAULT NULL COMMENT '视频文件大小（字节）',
    
    -- 图片相关字段
    `image_url` varchar(500) DEFAULT NULL COMMENT '图片URL',
    `image_description` varchar(500) DEFAULT NULL COMMENT '图片描述',
    `image_alt` varchar(200) DEFAULT NULL COMMENT '图片alt属性',
    
    -- 音频相关字段
    `audio_url` varchar(500) DEFAULT NULL COMMENT '音频URL',
    `audio_duration` varchar(50) DEFAULT NULL COMMENT '音频时长',
    
    -- JSON数据字段
    `highlight_points` text COMMENT '重点列表JSON',
    `quiz_data` text COMMENT '测验数据JSON',
    `extra_data` text COMMENT '扩展数据JSON',
    
    `status` varchar(20) DEFAULT 'active' COMMENT '状态：active-启用，inactive-禁用',
    `is_required` tinyint(1) DEFAULT 0 COMMENT '是否必修：0-非必修，1-必修',
    `completion_required` tinyint(1) DEFAULT 0 COMMENT '是否需要完成才能继续：0-不需要，1-需要',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间（软删除）',
    
    PRIMARY KEY (`id`),
    KEY `idx_lesson_id` (`lesson_id`),
    KEY `idx_chapter_id` (`chapter_id`),
    KEY `idx_course_id` (`course_id`),
    KEY `idx_card_type` (`card_type`),
    KEY `idx_status` (`status`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时内容卡片表';

-- 添加外键约束（可选）
-- ALTER TABLE `lessons` ADD CONSTRAINT `fk_lessons_chapter_id` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `lessons` ADD CONSTRAINT `fk_lessons_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
-- ALTER TABLE `lesson_cards` ADD CONSTRAINT `fk_lesson_cards_lesson_id` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

-- 更新章节表，添加课时数量字段（如果不存在）
-- ALTER TABLE `chapters` ADD COLUMN IF NOT EXISTS `lesson_count` int DEFAULT 0 COMMENT '课时数量';
-- ALTER TABLE `chapters` ADD COLUMN `lesson_count` int DEFAULT 0 COMMENT '课时数量';

-- 创建复合索引优化查询性能
CREATE INDEX `idx_lessons_chapter_status_sort` ON `lessons` (`chapter_id`, `status`, `sort_order`);
CREATE INDEX `idx_lessons_course_status_sort` ON `lessons` (`course_id`, `status`, `sort_order`);
CREATE INDEX `idx_lesson_cards_lesson_type_sort` ON `lesson_cards` (`lesson_id`, `card_type`, `sort_order`);

-- 插入示例数据（可选）
INSERT INTO `lessons` (`chapter_id`, `course_id`, `title`, `description`, `sort_order`, `status`, `duration_minutes`, `created_by`) VALUES
(1, 1, '第一课时：犬敏捷基础概念', '了解犬敏捷训练的基本概念和重要性，为后续学习打下基础', 1, 'published', 30, 1),
(1, 1, '第二课时：基础设备介绍', '介绍犬敏捷训练中常用的基础设备及其使用方法', 2, 'draft', 25, 1),
(2, 1, '第三课时：障碍物设置技巧', '学习如何正确设置各种障碍物，调整高度和距离', 1, 'published', 35, 1);

INSERT INTO `lesson_cards` (`lesson_id`, `chapter_id`, `course_id`, `card_type`, `title`, `content`, `sort_order`, `status`) VALUES
(1, 1, 1, 'text', '课程概述', '本课时将为您介绍犬敏捷训练的基础概念，包括训练目标、基本原理和安全注意事项。', 1, 'active'),
(1, 1, 1, 'video', '基础概念视频', '观看视频了解犬敏捷训练的基本概念', 2, 'active'),
(1, 1, 1, 'highlight', '本节重点', '', 3, 'active'),
(2, 1, 1, 'text', '设备介绍', '犬敏捷训练需要使用多种专业设备，本节将详细介绍各种设备的用途和使用方法。', 1, 'active'),
(2, 1, 1, 'image', '设备图片展示', '各种训练设备的图片展示', 2, 'active'); 