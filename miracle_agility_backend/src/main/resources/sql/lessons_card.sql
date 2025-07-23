-- 创建课时内容卡片表
CREATE TABLE `lesson_cards` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '卡片ID',
    `lesson_id` BIGINT NOT NULL COMMENT '所属课时ID',
    `chapter_id` BIGINT NOT NULL COMMENT '所属章节ID',
    `course_id` BIGINT NOT NULL COMMENT '所属课程ID',
    `card_type` VARCHAR(20) NOT NULL COMMENT '卡片类型：video-视频，text-文本，image-图片，highlight-重点，quiz-测验，audio-音频，file-文件',
    `title` VARCHAR(255) COMMENT '卡片标题',
    `content` TEXT COMMENT '卡片内容',
    `sort_order` INT DEFAULT 0 COMMENT '排序序号',

    -- 视频相关字段
    `video_url` TEXT COMMENT '视频地址',
    `video_duration` VARCHAR(20) COMMENT '视频时长',
    `video_views` VARCHAR(50) COMMENT '视频观看次数',
    `video_thumbnail` TEXT COMMENT '视频缩略图',
    `video_file_size` BIGINT COMMENT '视频文件大小(字节)',

    -- 图片相关字段
    `image_url` TEXT COMMENT '图片地址',
    `image_description` TEXT COMMENT '图片描述',
    `image_alt` VARCHAR(255) COMMENT '图片alt文本',

    -- 音频相关字段
    `audio_url` TEXT COMMENT '音频地址',
    `audio_duration` VARCHAR(20) COMMENT '音频时长',

    -- 文件相关字段
    `file_url` TEXT COMMENT '文件地址',
    `file_name` VARCHAR(255) COMMENT '文件名',
    `file_size` VARCHAR(50) COMMENT '文件大小',
    `file_type` VARCHAR(50) COMMENT '文件类型',

    -- JSON数据字段
    `highlight_points` JSON COMMENT '重点卡片数据(JSON格式)',
    `quiz_data` JSON COMMENT '测验卡片数据(JSON格式)',
    `extra_data` JSON COMMENT '扩展数据(JSON格式)',

    `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态：active-激活，inactive-未激活',
    `is_required` BOOLEAN DEFAULT FALSE COMMENT '是否必修',
    `completion_required` BOOLEAN DEFAULT FALSE COMMENT '是否需要完成才能继续',

    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME NULL COMMENT '删除时间(软删除)',

    -- 索引
    INDEX `idx_lesson_id` (`lesson_id`),
    INDEX `idx_chapter_id` (`chapter_id`),
    INDEX `idx_course_id` (`course_id`),
    INDEX `idx_card_type` (`card_type`),
    INDEX `idx_sort_order` (`sort_order`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_deleted_at` (`deleted_at`),
    INDEX `idx_lesson_sort` (`lesson_id`, `sort_order`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课时内容卡片表';