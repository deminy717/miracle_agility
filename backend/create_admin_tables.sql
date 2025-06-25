-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admins` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `role` VARCHAR(20) NOT NULL DEFAULT 'ADMIN' COMMENT '角色：ADMIN-管理员，SUPER_ADMIN-超级管理员',
    `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 插入默认的超级管理员账户（密码：admin123）
INSERT INTO `admins` (`username`, `password`, `real_name`, `role`, `status`) 
VALUES ('admin', '$2a$10$8.UnVuG2HZPKIQLWfwbepe8NnzOi1YJJo6S.fL.8jzj1O3dNuWRJG', '系统管理员', 'SUPER_ADMIN', 1)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);

-- 为现有表添加发布状态字段（如果不存在）
-- ALTER TABLE `articles` ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-已发布，0-草稿' AFTER `tags`;
-- ALTER TABLE `videos` ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-已发布，0-草稿' AFTER `views`;
-- ALTER TABLE `courses` ADD COLUMN `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-已发布，0-草稿' AFTER `difficulty`; 