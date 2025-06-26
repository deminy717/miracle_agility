-- 修复user_sessions表字段长度问题
-- 迁移脚本: 001_fix_user_sessions_token_length.sql
-- 创建时间: 2024-12-19
-- 说明: 修复JWT token字段长度不足导致的数据截断问题

USE miracle_agility;

-- 检查表是否存在
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.tables 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions'
);

-- 如果表存在，进行结构修改
SET @sql = IF(@table_exists > 0,
    'ALTER TABLE user_sessions 
     MODIFY COLUMN access_token VARCHAR(512) NOT NULL COMMENT "访问令牌",
     MODIFY COLUMN refresh_token VARCHAR(512) DEFAULT NULL COMMENT "刷新令牌"',
    'SELECT "Table user_sessions does not exist, skipping migration" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查是否需要添加缺失的字段
SET @session_key_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions' 
    AND column_name = 'session_key'
);

-- 如果session_key字段不存在，添加它
SET @sql = IF(@session_key_exists = 0,
    'ALTER TABLE user_sessions 
     ADD COLUMN session_key VARCHAR(100) NOT NULL UNIQUE COMMENT "微信会话密钥" AFTER user_id,
     ADD INDEX idx_session_key (session_key)',
    'SELECT "Column session_key already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查是否需要添加status字段
SET @status_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions' 
    AND column_name = 'status'
);

-- 如果status字段不存在，添加它
SET @sql = IF(@status_exists = 0,
    'ALTER TABLE user_sessions 
     ADD COLUMN status ENUM("active", "expired", "revoked") DEFAULT "active" COMMENT "会话状态" AFTER device_info,
     ADD INDEX idx_status (status)',
    'SELECT "Column status already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查是否需要重命名字段
SET @token_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions' 
    AND column_name = 'token'
);

-- 如果存在旧的token字段，重命名为access_token
SET @sql = IF(@token_exists > 0,
    'ALTER TABLE user_sessions 
     CHANGE COLUMN token access_token VARCHAR(512) NOT NULL COMMENT "访问令牌"',
    'SELECT "Column token does not exist, no need to rename" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并重命名ip_address字段为client_ip
SET @ip_address_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions' 
    AND column_name = 'ip_address'
);

SET @sql = IF(@ip_address_exists > 0,
    'ALTER TABLE user_sessions 
     CHANGE COLUMN ip_address client_ip VARCHAR(45) DEFAULT NULL COMMENT "客户端IP"',
    'SELECT "Column ip_address does not exist, no need to rename" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加device_info字段
SET @device_info_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns 
    WHERE table_schema = 'miracle_agility' 
    AND table_name = 'user_sessions' 
    AND column_name = 'device_info'
);

SET @sql = IF(@device_info_exists = 0,
    'ALTER TABLE user_sessions 
     ADD COLUMN device_info JSON DEFAULT NULL COMMENT "设备信息" AFTER user_agent',
    'SELECT "Column device_info already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 清理现有的过期会话（可选）
DELETE FROM user_sessions WHERE expires_at < NOW();

SELECT 'Migration completed successfully' as result; 