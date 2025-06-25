-- 创建数据库
CREATE DATABASE IF NOT EXISTS `miracle_agility` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `miracle_agility`;

-- 用户表
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `wx_openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nick_name` varchar(100) DEFAULT NULL COMMENT '昵称',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像',
  `gender` varchar(20) DEFAULT NULL COMMENT '性别',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `courses_count` int(11) DEFAULT 0 COMMENT '已购课程数',
  `completed_count` int(11) DEFAULT 0 COMMENT '已完成课程数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wx_openid` (`wx_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 文章表
CREATE TABLE `articles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `desc` varchar(500) DEFAULT NULL COMMENT '简介',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图片',
  `content` longtext COMMENT '内容',
  `author` varchar(100) DEFAULT NULL COMMENT '作者',
  `publish_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `views` int(11) DEFAULT 0 COMMENT '浏览量',
  `tags` varchar(200) DEFAULT NULL COMMENT '标签',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- 视频表
CREATE TABLE `videos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `desc` varchar(500) DEFAULT NULL COMMENT '描述',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图片',
  `video_url` varchar(500) DEFAULT NULL COMMENT '视频地址',
  `duration` varchar(20) DEFAULT NULL COMMENT '时长',
  `publish_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `views` int(11) DEFAULT 0 COMMENT '浏览量',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频表';

-- 课程表
CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `desc` varchar(500) DEFAULT NULL COMMENT '简介',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图片',
  `lesson_count` int(11) DEFAULT 0 COMMENT '课时数',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- 章节表
CREATE TABLE `chapters` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节表';

-- 课时表
CREATE TABLE `lessons` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `chapter_id` bigint(20) NOT NULL COMMENT '章节ID',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `duration` varchar(20) DEFAULT NULL COMMENT '时长',
  `content` longtext COMMENT '内容',
  `video_url` varchar(500) DEFAULT NULL COMMENT '视频地址',
  `video_poster` varchar(500) DEFAULT NULL COMMENT '视频封面',
  `images` text COMMENT '图片列表',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_chapter_id` (`chapter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课时表';

-- 用户课程关联表
CREATE TABLE `user_courses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `progress` int(11) DEFAULT 0 COMMENT '进度百分比',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_course` (`user_id`, `course_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户课程关联表';

-- 用户课时关联表
CREATE TABLE `user_lessons` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `lesson_id` bigint(20) NOT NULL COMMENT '课时ID',
  `course_id` bigint(20) NOT NULL COMMENT '课程ID',
  `completed` tinyint(1) DEFAULT 0 COMMENT '是否完成',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_lesson` (`user_id`, `lesson_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_lesson_id` (`lesson_id`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户课时关联表';

-- 插入测试数据
INSERT INTO `articles` (`title`, `desc`, `cover_image`, `content`, `author`, `views`) VALUES
('犬类敏捷训练基础教程', '了解犬类敏捷训练的基本知识和技巧', 'https://example.com/cover1.jpg', '<h1>犬类敏捷训练基础教程</h1><p>这里是详细的文章内容...</p>', '专业训练师', 1255),
('如何提高狗狗的反应速度', '通过专业的训练方法提高狗狗的反应能力', 'https://example.com/cover2.jpg', '<h1>如何提高狗狗的反应速度</h1><p>这里是详细的文章内容...</p>', '专业训练师', 856);

INSERT INTO `videos` (`title`, `desc`, `cover_image`, `video_url`, `duration`, `views`) VALUES
('敏捷训练入门视频', '适合初学者的敏捷训练视频教程', 'https://example.com/video1.jpg', 'https://example.com/video1.mp4', '12:30', 2341),
('高级障碍训练技巧', '进阶级的障碍训练方法演示', 'https://example.com/video2.jpg', 'https://example.com/video2.mp4', '08:45', 1876);

INSERT INTO `courses` (`title`, `desc`, `cover_image`, `lesson_count`) VALUES
('犬类敏捷基础课程', '从零开始学习犬类敏捷训练', 'https://example.com/course1.jpg', 12),
('高级敏捷训练技巧', '提升到专业水平的高级课程', 'https://example.com/course2.jpg', 8);

INSERT INTO `chapters` (`course_id`, `title`, `sort_order`) VALUES
(1, '基础理论', 1),
(1, '实践训练', 2),
(2, '高级技巧', 1),
(2, '比赛准备', 2);

INSERT INTO `lessons` (`course_id`, `chapter_id`, `title`, `duration`, `content`, `video_url`, `video_poster`, `sort_order`) VALUES
(1, 1, '什么是犬类敏捷训练', '15:00', '<h1>什么是犬类敏捷训练</h1><p>课程内容...</p>', 'https://example.com/lesson1.mp4', 'https://example.com/lesson1.jpg', 1),
(1, 1, '基本设备介绍', '12:30', '<h1>基本设备介绍</h1><p>课程内容...</p>', 'https://example.com/lesson2.mp4', 'https://example.com/lesson2.jpg', 2),
(1, 2, '第一次训练', '18:45', '<h1>第一次训练</h1><p>课程内容...</p>', 'https://example.com/lesson3.mp4', 'https://example.com/lesson3.jpg', 3); 