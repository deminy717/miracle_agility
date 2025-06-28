-- 修复session_key重复约束冲突问题
-- 迁移脚本: 003_fix_session_key_duplicate.sql
-- 创建时间: 2024-12-19
-- 说明: 解决微信小程序session_key重复导致的UNIQUE约束冲突问题

USE miracle_agility;

-- 检查user_sessions表是否存在
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions'
);

-- 如果表存在，进行修复
SET @sql = IF(@table_exists > 0,
    'SELECT "Processing user_sessions table" as message',
    'SELECT "Table user_sessions does not exist, skipping migration" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 清理重复的session_key记录，只保留最新的
-- 首先备份原始数据
CREATE TABLE IF NOT EXISTS user_sessions_backup_session_key AS 
SELECT * FROM user_sessions WHERE 1=0;

-- 插入备份数据
INSERT INTO user_sessions_backup_session_key 
SELECT * FROM user_sessions 
WHERE session_key IN (
    SELECT session_key 
    FROM user_sessions 
    GROUP BY session_key 
    HAVING COUNT(*) > 1
);

-- 删除重复记录，保留最新的
DELETE us1 FROM user_sessions us1
INNER JOIN user_sessions us2 
WHERE us1.session_key = us2.session_key 
  AND us1.id < us2.id;

-- 清理过期和已撤销的会话
DELETE FROM user_sessions 
WHERE status IN ('expired', 'revoked') 
  AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- 验证修复结果
SELECT 
    'Session key duplicate fix completed' as result,
    COUNT(*) as total_sessions,
    COUNT(DISTINCT session_key) as unique_session_keys,
    COUNT(*) - COUNT(DISTINCT session_key) as duplicate_count
FROM user_sessions;

-- 如果仍有重复，显示详细信息
SELECT session_key, COUNT(*) as count
FROM user_sessions 
GROUP BY session_key 
HAVING COUNT(*) > 1; 