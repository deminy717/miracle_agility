-- 创建课时表
CREATE TABLE `lessons` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '课时ID',
    `chapter_id` BIGINT NOT NULL COMMENT '所属章节ID',
    `course_id` BIGINT NOT NULL COMMENT '所属课程ID',
    `title` VARCHAR(255) NOT NULL COMMENT '课时标题',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '状态：draft-草稿，published-已发布',
    `duration_minutes` INT DEFAULT 0 COMMENT '课时时长(分钟)',
    `lesson_card_count` INT DEFAULT 0 COMMENT '课时卡片数量',
    `video_url` TEXT COMMENT '视频地址',
    `video_duration` VARCHAR(20) COMMENT '视频时长(格式：HH:MM:SS)',
    `thumbnail_url` TEXT COMMENT '缩略图地址',
    `created_by` BIGINT COMMENT '创建者ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `published_at` DATETIME NULL COMMENT '发布时间',
    `deleted_at` DATETIME NULL COMMENT '删除时间(软删除)',

    -- 索引
    INDEX `idx_chapter_id` (`chapter_id`),
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_sort_order` (`sort_order`),
    INDEX `idx_created_by` (`created_by`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_deleted_at` (`deleted_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时表';