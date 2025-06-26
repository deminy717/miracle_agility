-- 修复MyBatis-Plus软删除配置问题
-- 迁移脚本: 002_fix_mybatis_plus_soft_delete.sql
-- 创建时间: 2024-12-19
-- 说明: 修复软删除字段配置，确保SQL语法正确

USE miracle_agility;

-- 检查users表是否存在
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'users'
);

-- 确保deleted_at字段存在且类型正确
SET @deleted_at_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'users' 
    AND column_name = 'deleted_at'
);

-- 如果deleted_at字段不存在，添加它
SET @sql = IF(@deleted_at_exists = 0 AND @table_exists > 0,
    'ALTER TABLE users 
     ADD COLUMN deleted_at DATETIME DEFAULT NULL COMMENT "删除时间(软删除)",
     ADD INDEX idx_deleted_at (deleted_at)',
    'SELECT "Column deleted_at already exists or table does not exist" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 确保所有现有记录的deleted_at为NULL（表示未删除）
UPDATE users SET deleted_at = NULL WHERE deleted_at IS NOT NULL AND deleted_at = '0000-00-00 00:00:00';

-- 验证修复结果
SELECT 
    'Migration completed successfully' as result,
    COUNT(*) as total_users,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_users,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_users
FROM users; 