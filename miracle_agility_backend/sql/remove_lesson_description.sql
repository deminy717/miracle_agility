-- 删除课时表的description字段
-- 执行前请确保已备份数据

-- 删除lessons表的description字段
ALTER TABLE `lessons` DROP COLUMN `description`;

-- 验证字段已删除
DESCRIBE `lessons`; 